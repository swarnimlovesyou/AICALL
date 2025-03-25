from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
import os

from .models import Agent, CallRecording, CallAnalysis, Report, TrainingSession
from .serializers import (
    AgentSerializer, CallRecordingSerializer, CallAnalysisSerializer,
    ReportSerializer, TrainingSessionSerializer
)
from .services.call_processor import CallProcessingService
from .services.report_generator import ReportGenerator
from .services.training import TrainingService


class AgentViewSet(viewsets.ModelViewSet):
    """API endpoint for managing agents."""
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get performance metrics for an agent."""
        agent = self.get_object()
        
        # Get basic metrics
        total_calls = agent.call_analyses.count()
        avg_score = agent.avg_coverage_score
        
        # Get recent calls
        recent_calls = agent.call_recordings.order_by('-uploaded_at')[:5]
        recent_call_data = CallRecordingSerializer(recent_calls, many=True).data
        
        # Get sentiment distribution
        sentiment_counts = {
            'positive': agent.call_analyses.filter(sentiment='positive').count(),
            'neutral': agent.call_analyses.filter(sentiment='neutral').count(),
            'negative': agent.call_analyses.filter(sentiment='negative').count(),
        }
        
        return Response({
            'total_calls': total_calls,
            'avg_coverage_score': avg_score,
            'recent_calls': recent_call_data,
            'sentiment_distribution': sentiment_counts
        })
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get a leaderboard of agents based on coverage scores."""
        # Get top agents by coverage score (minimum 5 calls)
        top_agents = Agent.objects.annotate(
            calls_count=Count('call_analyses')
        ).filter(
            calls_count__gte=5
        ).order_by('-avg_coverage_score')[:10]
        
        return Response(AgentSerializer(top_agents, many=True).data)


class CallRecordingViewSet(viewsets.ModelViewSet):
    """API endpoint for managing call recordings."""
    queryset = CallRecording.objects.all()
    serializer_class = CallRecordingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        """Upload a new call recording."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recording = serializer.save()
        
        # Start processing the call
        call_processor = CallProcessingService()
        call_processor.process_call_recording(recording.id)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def analysis_status(self, request, pk=None):
        """Get the current status of a call analysis."""
        recording = self.get_object()
        
        # Check if analysis exists
        try:
            analysis = recording.analysis
            return Response({
                'status': recording.status,
                'analysis_id': analysis.id if analysis else None,
                'completed': recording.status == 'completed'
            })
        except CallAnalysis.DoesNotExist:
            return Response({
                'status': recording.status,
                'analysis_id': None,
                'completed': False
            })


class CallAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for retrieving call analyses."""
    queryset = CallAnalysis.objects.all()
    serializer_class = CallAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def download_report(self, request, pk=None):
        """Download the Excel report for a call analysis."""
        analysis = self.get_object()
        
        # Generate report if it doesn't exist
        report_generator = ReportGenerator()
        report_path = report_generator.generate_call_report(analysis)
        
        if report_path and os.path.exists(report_path):
            return FileResponse(
                open(report_path, 'rb'),
                as_attachment=True,
                filename=os.path.basename(report_path)
            )
        else:
            return Response(
                {'error': 'Report generation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReportViewSet(viewsets.ModelViewSet):
    """API endpoint for managing aggregate reports."""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new aggregate report."""
        # Get parameters from request
        report_type = request.data.get('report_type', 'weekly')
        start_date = request.data.get('date_range_start')
        end_date = request.data.get('date_range_end')
        
        # If dates not provided, use defaults based on report type
        if not start_date or not end_date:
            end_date = timezone.now().date()
            
            if report_type == 'weekly':
                start_date = end_date - timedelta(days=7)
            elif report_type == 'monthly':
                start_date = end_date - timedelta(days=30)
            else:  # custom
                start_date = end_date - timedelta(days=14)  # Default to 2 weeks
        
        # Get call analyses for the date range
        call_analyses = CallAnalysis.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Create report object
        report = Report.objects.create(
            title=f"{report_type.capitalize()} Report ({start_date} to {end_date})",
            report_type=report_type,
            date_range_start=start_date,
            date_range_end=end_date
        )
        
        # Generate Excel report
        report_generator = ReportGenerator()
        excel_path = report_generator.generate_aggregate_report(
            report_type, start_date, end_date, call_analyses
        )
        
        if excel_path:
            # Update report with file path
            with open(excel_path, 'rb') as f:
                report.excel_file.save(os.path.basename(excel_path), f)
            
            # Calculate aggregated metrics
            agent_performance = {}
            for agent in Agent.objects.all():
                agent_analyses = call_analyses.filter(agent=agent)
                if agent_analyses.exists():
                    agent_performance[agent.user.get_full_name()] = {
                        'call_count': agent_analyses.count(),
                        'avg_score': agent_analyses.aggregate(Avg('coverage_score'))['coverage_score__avg']
                    }
            
            # Identify common issues
            all_issues = []
            for analysis in call_analyses:
                if isinstance(analysis.key_issues, list):
                    all_issues.extend(analysis.key_issues)
            
            issue_counts = {}
            for issue in all_issues:
                if issue in issue_counts:
                    issue_counts[issue] += 1
                else:
                    issue_counts[issue] = 1
            
            common_issues = [
                {'issue': issue, 'count': count}
                for issue, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)
            ][:10]  # Top 10 issues
            
            # Update report with aggregated data
            report.agent_performance = agent_performance
            report.common_issues = common_issues
            report.save()
            
            return Response(ReportSerializer(report).data)
        else:
            report.delete()  # Clean up if report generation failed
            return Response(
                {'error': 'Report generation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the Excel file for a report."""
        report = self.get_object()
        
        if report.excel_file:
            return FileResponse(
                report.excel_file.open('rb'),
                as_attachment=True,
                filename=os.path.basename(report.excel_file.name)
            )
        else:
            return Response(
                {'error': 'Report file not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class TrainingSessionViewSet(viewsets.ModelViewSet):
    """API endpoint for managing agent training sessions."""
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def submit_response(self, request, pk=None):
        """Submit an agent's response to a training query."""
        session = self.get_object()
        
        # Get the agent's response from the request
        agent_response = request.data.get('agent_response', '')
        
        if not agent_response:
            return Response(
                {'error': 'Agent response is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the training session with the agent's response
        session.agent_response = agent_response
        session.save()
        
        # Evaluate the response
        training_service = TrainingService()
        result = training_service.evaluate_response(session)
        
        if result['success']:
            return Response(TrainingSessionSerializer(session).data)
        else:
            return Response(
                {'error': result.get('error', 'Evaluation failed')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def generate_query(self, request):
        """Generate a new training query for an agent."""
        agent_id = request.data.get('agent_id')
        
        if not agent_id:
            return Response(
                {'error': 'Agent ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent = get_object_or_404(Agent, id=agent_id)
        
        # Example queries (in a real system, these could be generated dynamically)
        sample_queries = [
            "I've been charged twice for my monthly premium and need a refund immediately.",
            "I submitted a claim three weeks ago and haven't heard anything. This is unacceptable!",
            "Your website said my policy covers flood damage, but my claim was denied. Why?",
            "I want to cancel my policy because your rates are too high compared to competitors.",
            "I've been a loyal customer for 10 years and you just raised my premium by 30%!"
        ]
        
        import random
        query = random.choice(sample_queries)
        
        # Create a new training session
        session = TrainingSession.objects.create(
            agent=agent,
            title=f"Training Query {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            query_text=query,
            status='pending'
        )
        
        return Response(TrainingSessionSerializer(session).data)


# Dashboard view for the web interface
def dashboard(request):
    """Render the main dashboard."""
    context = {
        'total_calls': CallRecording.objects.count(),
        'completed_analyses': CallAnalysis.objects.count(),
        'total_agents': Agent.objects.count()
    }
    return render(request, 'analyzer/dashboard.html', context)
