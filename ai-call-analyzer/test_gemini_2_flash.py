import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv('GOOGLE_API_KEY')
print(f"Testing Google Gemini 2.0 Flash API Key: {api_key[:12]}...")

try:
    # Configure the Gemini API
    genai.configure(api_key=api_key)
    
    # Create a test transcription to simulate our real use case
    test_data = {
        "full_text": """
        Agent: Hello, thank you for calling Insurance Helpline. My name is John. How may I assist you today?
        Customer: Hi John, I'm calling about my claim. I submitted it three weeks ago and still haven't heard anything.
        Agent: I understand your concern. May I have your policy number please?
        Customer: Yes, it's POL-12345-XYZ.
        Agent: Thank you. Let me check the status of your claim.
        Agent: I see that your claim is still under review. The adjuster has requested additional documentation.
        Customer: What? I wasn't informed about any additional documentation. This is frustrating!
        Agent: I apologize for the inconvenience. I can see that the notification email failed to deliver. Let me explain what documents are needed.
        Customer: Fine, go ahead.
        Agent: We need a copy of the police report and photos of the damage. Once we receive these, we can proceed with your claim.
        Customer: I'll send those today. How long will it take after that?
        Agent: Typically, once we have all documentation, the review takes 3-5 business days.
        Customer: Alright, thank you for the information.
        Agent: Is there anything else I can help you with today?
        Customer: No, that's all. Thank you.
        Agent: Thank you for calling Insurance Helpline. Have a great day!
        """,
        "agent_text": """
        Hello, thank you for calling Insurance Helpline. My name is John. How may I assist you today?
        I understand your concern. May I have your policy number please?
        Thank you. Let me check the status of your claim.
        I see that your claim is still under review. The adjuster has requested additional documentation.
        I apologize for the inconvenience. I can see that the notification email failed to deliver. Let me explain what documents are needed.
        We need a copy of the police report and photos of the damage. Once we receive these, we can proceed with your claim.
        Typically, once we have all documentation, the review takes 3-5 business days.
        Is there anything else I can help you with today?
        Thank you for calling Insurance Helpline. Have a great day!
        """,
        "customer_text": """
        Hi John, I'm calling about my claim. I submitted it three weeks ago and still haven't heard anything.
        Yes, it's POL-12345-XYZ.
        What? I wasn't informed about any additional documentation. This is frustrating!
        Fine, go ahead.
        I'll send those today. How long will it take after that?
        Alright, thank you for the information.
        No, that's all. Thank you.
        """
    }
    
    # Create the prompt using the format from our service
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
    {test_data['full_text']}
    
    Agent's dialogue:
    {test_data['agent_text']}
    
    Customer's dialogue:
    {test_data['customer_text']}
    
    Please format your response as structured JSON with the following keys:
    sentiment, tone_analysis, key_issues, coverage_score, score_explanation, compliance_check, improvement_suggestions
    """
    
    # Initialize the Gemini 2.0 Flash model
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    print("Sending test analysis request to Gemini 2.0 Flash...")
    response = model.generate_content(prompt)
    
    print("\n✅ Successfully received response from Gemini 2.0 Flash!")
    
    # Try to parse the response as JSON
    try:
        # Some cleanup in case the model returns markdown or extra text
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        analysis_data = json.loads(response_text)
        print("\nParsed JSON Result:")
        print(f"Sentiment: {analysis_data.get('sentiment')}")
        print(f"Coverage Score: {analysis_data.get('coverage_score')}")
        print(f"Key Issues: {analysis_data.get('key_issues')}")
    except json.JSONDecodeError:
        print("\nCouldn't parse response as JSON. Raw response:")
        print(response.text[:500] + "..." if len(response.text) > 500 else response.text)
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
