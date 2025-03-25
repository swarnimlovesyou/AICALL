import assemblyai as aai
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Service to handle speech-to-text transcription using AssemblyAI."""
    
    def __init__(self):
        self.api_key = settings.ASSEMBLY_AI_API_KEY
        aai.settings.api_key = self.api_key
    
    def process_audio_file(self, file_path):
        """
        Process an audio file and return the transcription with speaker labels.
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            dict: Transcription data including the full text and speaker-separated text
        """
        try:
            logger.info(f"Processing audio file: {file_path}")
            
            # Create a transcriber with speaker diarization
            config = aai.TranscriptionConfig(
                speaker_labels=True,
                speakers_expected=2,  # Agent and customer
                language_code="en"
            )
            
            transcriber = aai.Transcriber(config=config)
            
            # Start transcription
            transcript = transcriber.transcribe(file_path)
            
            if transcript.status == 'error':
                logger.error(f"Transcription failed: {transcript.error}")
                return {
                    'success': False,
                    'error': transcript.error
                }
            
            # Extract full text
            full_text = transcript.text
            
            # Extract agent and customer text based on speaker labels
            agent_text = []
            customer_text = []
            
            for utterance in transcript.utterances:
                if utterance.speaker == "A":  # Assuming A is the agent
                    agent_text.append(utterance.text)
                elif utterance.speaker == "B":  # Assuming B is the customer
                    customer_text.append(utterance.text)
            
            return {
                'success': True,
                'full_text': full_text,
                'agent_text': "\n".join(agent_text),
                'customer_text': "\n".join(customer_text),
                'utterances': [
                    {
                        'speaker': u.speaker,
                        'text': u.text,
                        'start': u.start,
                        'end': u.end
                    }
                    for u in transcript.utterances
                ]
            }
        
        except Exception as e:
            logger.exception(f"Exception in transcription service: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
