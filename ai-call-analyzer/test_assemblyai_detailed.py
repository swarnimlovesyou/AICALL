import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv('ASSEMBLY_AI_API_KEY')
print(f"Testing AssemblyAI API Key: {api_key}")

# Test the healthcheck endpoint (should be accessible regardless of API key)
try:
    health_response = requests.get("https://api.assemblyai.com/v2/status")
    print(f"API Health Status: {health_response.status_code} - {health_response.json() if health_response.status_code == 200 else health_response.text}")
except Exception as e:
    print(f"Error checking API health: {str(e)}")

# Test the transcripts endpoint (requires valid API key)
headers = {
    "authorization": api_key,
    "content-type": "application/json"
}

try:
    # This endpoint should return a list of transcripts (even if empty)
    transcripts_response = requests.get("https://api.assemblyai.com/v2/transcript", headers=headers)
    print(f"\nTranscripts Endpoint Status: {transcripts_response.status_code}")
    
    if transcripts_response.status_code == 200:
        print("✅ AssemblyAI API Key is valid!")
        print(f"Response: {transcripts_response.json()}")
    elif transcripts_response.status_code == 401:
        print("❌ API Key Authentication Failed: Invalid or expired API key")
        print(f"Response: {transcripts_response.text}")
    else:
        print(f"❌ Unexpected API Response: {transcripts_response.status_code}")
        print(f"Response: {transcripts_response.text}")
except Exception as e:
    print(f"Error testing API key: {str(e)}")

# Try using the API in the way our service would use it
try:
    print("\nTesting API with a sample transcript request...")
    data = {
        "audio_url": "https://storage.googleapis.com/aai-web-samples/meeting_speaker.wav",
        "speaker_labels": True
    }
    response = requests.post("https://api.assemblyai.com/v2/transcript", json=data, headers=headers)
    print(f"Transcript Request Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        print("✅ Successfully created a transcript request!")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ Failed to create transcript request: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error creating transcript: {str(e)}")
