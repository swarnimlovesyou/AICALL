import os
import logging
from django.conf import settings
from .transcription import TranscriptionService
from .sentiment_analysis import SentimentAnalysisService
from .report_generator import ReportGenerator
from ..models import CallRecording, CallAnalysis
import tempfile
import threading

logger = logging.getLogger(__name__)

class CallProcessingService:
    """Service to orchestrate the entire call processing workflow."""
    
    def __init__(self):
        self.transcription_service = TranscriptionService()
        self.sentiment_service = SentimentAnalysisService()
        self.report_generator = ReportGenerator()
    
    def process_call_recording(self, recording_id):
        """
        Process a call recording asynchronously.
        
        Args:
            recording_id: ID of the CallRecording object to process
        """
        # Start processing in a background thread to avoid blocking
        thread = threading.Thread(
            target=self._process_call_recording_thread,
            args=(recording_id,)
        )
        thread.daemon = True
        thread.start()
    
    def _process_call_recording_thread(self, recording_id):
        """
        Main processing workflow for a call recording.
        
        Args:
            recording_id: ID of the CallRecording object to process
        """
        try:
            # Get the recording object
            recording = CallRecording.objects.get(id=recording_id)
            
            # Update status to processing
            recording.status = 'processing'
            recording.save()
            
            logger.info(f"Starting processing for call recording {recording_id}")
            
            # Get the file path
            file_path = recording.file.path
            
            # 1. Transcribe the audio
            transcription_result = self.transcription_service.process_audio_file(file_path)
            
            if not transcription_result['success']:
                logger.error(f"Transcription failed: {transcription_result.get('error')}")
                recording.status = 'failed'
                recording.save()
                return
            
            # 2. Perform sentiment and tone analysis
            sentiment_result = self.sentiment_service.analyze_conversation(transcription_result)
            
            if not sentiment_result['success']:
                logger.error(f"Sentiment analysis failed: {sentiment_result.get('error')}")
                recording.status = 'failed'
                recording.save()
                return
            
            # 3. Create or update the call analysis object
            analysis = self._create_call_analysis(recording, transcription_result, sentiment_result)
            
            # 4. Generate Excel report
            report_path = self.report_generator.generate_call_report(analysis)
            
            # 5. Update recording status
            recording.status = 'completed'
            recording.save()
            
            logger.info(f"Completed processing for call recording {recording_id}")
            
            return analysis
            
        except Exception as e:
            logger.exception(f"Exception in call processing: {str(e)}")
            try:
                recording = CallRecording.objects.get(id=recording_id)
                recording.status = 'failed'
                recording.save()
            except:
                pass
    
    def _create_call_analysis(self, recording, transcription_result, sentiment_result):
        """
        Create or update a CallAnalysis object with the results.
        
        Args:
            recording: CallRecording object
            transcription_result: Result from transcription service
            sentiment_result: Result from sentiment analysis service
            
        Returns:
            CallAnalysis: The created or updated analysis object
        """
        analysis_data = sentiment_result['analysis']
        
        analysis, created = CallAnalysis.objects.update_or_create(
            call_recording=recording,
            defaults={
                'agent': recording.agent,
                'transcription_text': transcription_result['full_text'],
                'agent_text': transcription_result['agent_text'],
                'customer_text': transcription_result['customer_text'],
                'coverage_score': analysis_data['coverage_score'],
                'score_explanation': analysis_data['score_explanation'],
                'sentiment': analysis_data['sentiment'],
                'confidence_score': 0.85,  # Placeholder value
                'key_issues': analysis_data['key_issues'],
                'compliance_check': analysis_data['compliance_check'],
                'improvement_suggestions': analysis_data['improvement_suggestions']
            }
        )
        
        return analysis
