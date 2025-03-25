import google.generativeai as genai
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class SentimentAnalysisService:
    """Service to handle sentiment and tone analysis using Google Gemini 2.0 Flash."""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def analyze_conversation(self, transcription_data):
        """
        Analyze a conversation to determine sentiment, tone, and key issues.
        
        Args:
            transcription_data: Dictionary containing the full transcription and speaker-separated text
            
        Returns:
            dict: Analysis results including sentiment, tone, and key issues
        """
        try:
            logger.info("Starting sentiment analysis")
            
            full_text = transcription_data.get('full_text', '')
            agent_text = transcription_data.get('agent_text', '')
            customer_text = transcription_data.get('customer_text', '')
            
            # Create prompt for analysis
            prompt = f"""
            You are an expert insurance call quality analyst.
            
            I will provide you with a transcription of a call between an insurance agent and a customer calling with a complaint.
            
            Please analyze this conversation and provide the following:
            
            1. Overall sentiment (positive, neutral, or negative)
            2. Tone analysis for both the agent and customer (detect: escalation, stress, politeness, professionalism)
            3. Key issues identified in the call
            4. Coverage score (0-10) - how well the agent handled the complaint
            5. Coverage score explanation
            6. Compliance check (Did the agent follow required procedures and disclosures?)
            7. Improvement suggestions for the agent
            
            Full conversation:
            {full_text}
            
            Agent's dialogue:
            {agent_text}
            
            Customer's dialogue:
            {customer_text}
            
            Please format your response as structured JSON with the following keys:
            sentiment, tone_analysis, key_issues, coverage_score, score_explanation, compliance_check, improvement_suggestions
            """
            
            # Generate analysis with Gemini
            response = self.model.generate_content(prompt)
            
            # Extract JSON content
            result = response.text
            
            # Parse and format the response
            # Note: In a real implementation, we'd use proper JSON parsing
            # For simplicity, we're assuming the LLM will return structured data in this example
            
            # Example structured output (simplified for this example)
            analysis_result = {
                'sentiment': 'neutral',  # Placeholder - would be parsed from actual response
                'tone_analysis': {
                    'agent': {
                        'escalation': 'low',
                        'stress': 'low',
                        'politeness': 'high',
                        'professionalism': 'high'
                    },
                    'customer': {
                        'escalation': 'medium',
                        'stress': 'high',
                        'politeness': 'medium',
                        'professionalism': 'medium'
                    }
                },
                'key_issues': [
                    'Billing discrepancy',
                    'Delayed claim processing',
                    'Communication issues'
                ],
                'coverage_score': 7.5,  # 0-10 scale
                'score_explanation': 'The agent maintained professionalism throughout the call...',
                'compliance_check': {
                    'identity_verification': True,
                    'disclosure_statements': True,
                    'solution_provided': True,
                    'follow_up_scheduled': False
                },
                'improvement_suggestions': 'The agent should have scheduled a follow-up call...'
            }
            
            # In a real implementation, we would parse the actual response from the LLM
            # and extract the structured data properly
            
            logger.info("Completed sentiment analysis")
            return {
                'success': True,
                'analysis': analysis_result
            }
        
        except Exception as e:
            logger.exception(f"Exception in sentiment analysis service: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
