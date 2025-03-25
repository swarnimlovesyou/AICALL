import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv('ASSEMBLY_AI_API_KEY')
print(f"Testing AssemblyAI API Key: {api_key[:8]}...")

# Define the API endpoint
url = "https://api.assemblyai.com/v2/transcript"

# Set headers with the API key
headers = {
    "authorization": api_key,
    "content-type": "application/json"
}

# Simple request to test API key validity
try:
    response = requests.get("https://api.assemblyai.com/v2", headers=headers)
    if response.status_code == 200:
        print("✅ AssemblyAI API Key is valid!")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ AssemblyAI API Key is invalid. Status code: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
