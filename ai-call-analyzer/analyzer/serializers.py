from rest_framework import serializers
from .models import Agent, CallRecording, CallAnalysis, Report, TrainingSession
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


class AgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'user', 'employee_id', 'department', 'hire_date',
            'avg_coverage_score', 'total_calls_handled'
        ]
        read_only_fields = ['id', 'avg_coverage_score', 'total_calls_handled']


class CallRecordingSerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CallRecording
        fields = [
            'id', 'title', 'file', 'agent', 'agent_name', 'customer_phone',
            'uploaded_at', 'duration_seconds', 'status'
        ]
        read_only_fields = ['id', 'uploaded_at', 'duration_seconds', 'status']
    
    def get_agent_name(self, obj):
        return obj.agent.user.get_full_name()


class CallAnalysisSerializer(serializers.ModelSerializer):
    recording_title = serializers.CharField(source='call_recording.title', read_only=True)
    agent_name = serializers.CharField(source='agent.user.get_full_name', read_only=True)
    
    class Meta:
        model = CallAnalysis
        fields = [
            'id', 'call_recording', 'recording_title', 'agent', 'agent_name',
            'transcription_text', 'agent_text', 'customer_text',
            'coverage_score', 'score_explanation', 'sentiment',
            'confidence_score', 'key_issues', 'compliance_check',
            'improvement_suggestions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'recording_title', 'agent_name', 'transcription_text',
            'agent_text', 'customer_text', 'coverage_score', 'score_explanation',
            'sentiment', 'confidence_score', 'key_issues', 'compliance_check',
            'improvement_suggestions', 'created_at', 'updated_at'
        ]


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'report_type', 'date_range_start',
            'date_range_end', 'excel_file', 'agent_performance',
            'common_issues', 'trend_analysis', 'created_at'
        ]
        read_only_fields = [
            'id', 'excel_file', 'agent_performance',
            'common_issues', 'trend_analysis', 'created_at'
        ]


class TrainingSessionSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.user.get_full_name', read_only=True)
    
    class Meta:
        model = TrainingSession
        fields = [
            'id', 'agent', 'agent_name', 'title', 'query_text',
            'agent_response', 'tone_score', 'clarity_score',
            'accuracy_score', 'feedback', 'status',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'agent_name', 'tone_score', 'clarity_score',
            'accuracy_score', 'feedback', 'status', 'created_at', 'completed_at'
        ]
