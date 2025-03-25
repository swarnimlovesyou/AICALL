import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

def test_token_auth():
    """Test authentication and token retrieval"""
    print("Testing token authentication...")
    url = f"{BASE_URL}/api-token-auth/"
    data = {'username': 'testuser', 'password': 'password123'}
    
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"✅ Authentication successful! Token: {token[:10]}...")
            return token
        else:
            print(f"❌ Authentication failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_api_endpoints(token):
    """Test various API endpoints"""
    if not token:
        print("Cannot test API endpoints without a token.")
        return
    
    # Configure headers with authentication token
    headers = {'Authorization': f'Token {token}'}
    
    # Test endpoints
    endpoints = [
        '/api/agents/',
        '/api/call-recordings/',
        '/api/call-analyses/',
        '/api/reports/',
        '/api/training-sessions/'
    ]
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        print(f"\nTesting endpoint: {endpoint}")
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Status code: {response.status_code}")
                print(f"Response data: {json.dumps(data, indent=2)[:100]}...")
            else:
                print(f"❌ Request failed. Status code: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("=== AI Call Analyzer API Test ===")
    token = test_token_auth()
    test_api_endpoints(token)
    print("\n=== Test Complete ===")
