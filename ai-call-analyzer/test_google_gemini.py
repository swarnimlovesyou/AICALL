import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv('GOOGLE_API_KEY')
print(f"Testing Google Gemini API Key: {api_key[:12]}...")

try:
    # Configure the Gemini API
    genai.configure(api_key=api_key)
    
    # Get available models
    models = genai.list_models()
    gemini_models = [model for model in models if "gemini" in model.name.lower()]
    
    if gemini_models:
        print("✅ Google Gemini API Key is valid!")
        print("Available Gemini models:")
        for model in gemini_models:
            print(f" - {model.name}")
        
        # Test a simple generation with Gemini 1.0 Pro
        model = genai.GenerativeModel('gemini-1.0-pro')
        response = model.generate_content("Hello, please respond with just one word: 'Working'")
        print(f"\nTest response: {response.text}")
    else:
        print("⚠️ API key may be valid but no Gemini models were found.")
        print(f"Available models: {[model.name for model in models]}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
