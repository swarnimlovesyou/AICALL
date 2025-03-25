# AI Call Analyzer for Insurance Agent Helplines

A Django-based API system that analyzes customer complaint calls for insurance agent helplines. The system processes MP3 call recordings, extracts insights, and generates structured reports for management.

## Features

- **Speech-to-Text Transcription** with speaker identification via AssemblyAI
- **Sentiment & Tone Analysis** to detect escalation, stress, and politeness
- **Dynamic Coverage Score** based on agent handling of complaints
- **Compliance Checking** to verify agents follow required procedures
- **Excel Report Generation** for individual calls and aggregate data
- **Agent Performance Tracking** with leaderboards and metrics
- **Training Module** for agent improvement

## Tech Stack

- **Backend:** Django / Django REST Framework
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **AI Services:**
  - AssemblyAI for speech-to-text and speaker diarization
  - Google Gemini 2.0 Flash for sentiment analysis and insights
- **Deployment:** Docker / Docker Compose
- **Report Generation:** Pandas / OpenPyXL

## Project Structure

```
ai-call-analyzer/
├── analyzer/              # Main app directory
│   ├── migrations/        # Database migrations
│   ├── services/          # Core AI services
│   │   ├── transcription.py
│   │   ├── sentiment_analysis.py
│   │   ├── call_processor.py
│   │   ├── report_generator.py
│   │   └── training.py
│   ├── models.py          # Database models
│   ├── serializers.py     # REST API serializers
│   ├── views.py           # API endpoints
│   ├── urls.py            # URL routing
│   └── admin.py           # Admin interface customization
├── call_analyzer/         # Project settings
├── media/                 # User uploads (call recordings, reports)
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Service orchestration
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

## API Endpoints

The following REST API endpoints are available:

### Authentication

- `POST /api-token-auth/` - Obtain authentication token

### Agents

- `GET /api/agents/` - List all agents
- `POST /api/agents/` - Create a new agent
- `GET /api/agents/{id}/` - Retrieve agent details
- `PUT /api/agents/{id}/` - Update agent details
- `DELETE /api/agents/{id}/` - Delete an agent
- `GET /api/agents/{id}/performance/` - Get agent performance metrics
- `GET /api/agents/leaderboard/` - Get top-performing agents

### Call Recordings

- `GET /api/call-recordings/` - List all call recordings
- `POST /api/call-recordings/` - Upload a new call recording
- `GET /api/call-recordings/{id}/` - Retrieve recording details
- `DELETE /api/call-recordings/{id}/` - Delete a recording
- `GET /api/call-recordings/{id}/analysis-status/` - Check analysis status

### Call Analyses

- `GET /api/call-analyses/` - List all analyses
- `GET /api/call-analyses/{id}/` - Retrieve analysis details
- `GET /api/call-analyses/{id}/download-report/` - Download Excel report

### Reports

- `GET /api/reports/` - List all reports
- `POST /api/reports/generate/` - Generate a new report
- `GET /api/reports/{id}/` - Retrieve report details
- `GET /api/reports/{id}/download/` - Download report Excel file

### Training Sessions

- `GET /api/training-sessions/` - List all training sessions
- `POST /api/training-sessions/generate-query/` - Generate new training query
- `GET /api/training-sessions/{id}/` - Retrieve session details
- `POST /api/training-sessions/{id}/submit-response/` - Submit agent response

## Setup & Installation

### Requirements

- Python 3.8+
- PostgreSQL (for production)
- API keys for AssemblyAI and Google Gemini

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-call-analyzer.git
   cd ai-call-analyzer
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your configuration:
   ```
   # API Keys
   ASSEMBLY_AI_API_KEY=your_assembly_ai_key
   GOOGLE_API_KEY=your_google_api_key

   # Database Configuration
   DB_NAME=callanalyzer
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432

   # Django settings
   SECRET_KEY=your-secret-key
   DEBUG=True
   ```

5. Apply migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

### Docker Deployment

1. Make sure Docker and Docker Compose are installed

2. Update your `.env` file for production:
   ```
   DEBUG=False
   ```

3. Build and start the containers:
   ```
   docker-compose up -d --build
   ```

4. The API will be available at http://localhost:8000/

## Usage Examples

### Upload a Call Recording

```python
import requests

# Get authentication token
auth_response = requests.post(
    'http://localhost:8000/api-token-auth/',
    data={'username': 'admin', 'password': 'password'}
)
token = auth_response.json()['token']

# Upload a call recording
files = {'file': open('call.mp3', 'rb')}
data = {
    'title': 'Customer Complaint - Billing Issue',
    'agent': 1,  # Agent ID
    'customer_phone': '555-123-4567'
}
headers = {'Authorization': f'Token {token}'}

response = requests.post(
    'http://localhost:8000/api/call-recordings/',
    files=files,
    data=data,
    headers=headers
)

# Get the recording ID from the response
recording_id = response.json()['id']
```

### Check Analysis Status

```python
response = requests.get(
    f'http://localhost:8000/api/call-recordings/{recording_id}/analysis-status/',
    headers=headers
)

status = response.json()['status']
print(f"Analysis status: {status}")
```

### Download Analysis Report

```python
if status == 'completed':
    analysis_id = response.json()['analysis_id']
    
    # Download the report
    report_response = requests.get(
        f'http://localhost:8000/api/call-analyses/{analysis_id}/download-report/',
        headers=headers,
        stream=True
    )
    
    with open('analysis_report.xlsx', 'wb') as f:
        for chunk in report_response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print("Report downloaded successfully!")
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- AssemblyAI for speech-to-text transcription
- Google Gemini for AI-powered analysis
- The Django community for the excellent web framework
