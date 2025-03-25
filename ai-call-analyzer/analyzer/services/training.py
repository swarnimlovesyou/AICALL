import google.generativeai as genai
import logging
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

class TrainingService:
    """Service to handle agent training evaluations."""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def evaluate_response(self, training_session):
        """
        Evaluate an agent's response to a training query.
        
        Args:
            training_session: TrainingSession object with the query and agent's response
            
        Returns:
            dict: Evaluation results
        """
        try:
            logger.info(f"Evaluating training response for session {training_session.id}")
            
            query_text = training_session.query_text
            agent_response = training_session.agent_response
            
            # Create prompt for evaluation
            prompt = f"""
            You are an expert insurance call quality trainer.
            
            I will provide you with a customer query and an insurance agent's response.
            
            Please evaluate the agent's response on the following criteria:
            
            1. Tone (0-10): How appropriate and professional was the agent's tone?
            2. Clarity (0-10): How clear and understandable was the agent's explanation?
            3. Accuracy (0-10): How accurately did the agent address the customer's concern?
            4. Feedback: Provide specific constructive feedback for the agent to improve.
            
            Customer Query:
            {query_text}
            
            Agent Response:
            {agent_response}
            
            Please format your response as structured JSON with the following keys:
            tone_score, clarity_score, accuracy_score, feedback
            """
            
            # Generate evaluation with Gemini
            response = self.model.generate_content(prompt)
            
            # Extract JSON content
            result = response.text
            
            # Parse and format the response
            # Note: In a real implementation, we'd use proper JSON parsing
            # For simplicity, we're assuming the LLM will return structured data in this example
            
            # Example structured output (simplified for this example)
            evaluation_result = {
                'tone_score': 8.5,  # Placeholder - would be parsed from actual response
                'clarity_score': 7.0,  # Placeholder
                'accuracy_score': 8.0,  # Placeholder
                'feedback': 'The agent maintained a professional tone throughout their response...'  # Placeholder
            }
            
            # In a real implementation, we would parse the actual response from the LLM
            # and extract the structured data properly
            
            # Update the training session with evaluation results
            training_session.tone_score = evaluation_result['tone_score']
            training_session.clarity_score = evaluation_result['clarity_score']
            training_session.accuracy_score = evaluation_result['accuracy_score']
            training_session.feedback = evaluation_result['feedback']
            training_session.status = 'completed'
            training_session.completed_at = datetime.now()
            training_session.save()
            
            logger.info(f"Completed evaluation for training session {training_session.id}")
            
            return {
                'success': True,
                'evaluation': evaluation_result
            }
        
        except Exception as e:
            logger.exception(f"Exception in training evaluation: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
