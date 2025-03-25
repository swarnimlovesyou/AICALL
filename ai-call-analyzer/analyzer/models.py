from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
import uuid
import os

def get_upload_path(instance, filename):
    """Generate a unique path for uploaded call recordings."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('call_recordings', filename)

class Agent(models.Model):
    """Model representing an insurance agent."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    hire_date = models.DateField()
    
    # Performance metrics
    avg_coverage_score = models.FloatField(default=0.0)
    total_calls_handled = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"
    
    def update_metrics(self):
        """Update agent metrics based on call analyses."""
        analyses = self.call_analyses.all()
        if analyses.exists():
            self.avg_coverage_score = sum(a.coverage_score for a in analyses) / analyses.count()
            self.total_calls_handled = analyses.count()
            self.save()

class CallRecording(models.Model):
    """Model for storing uploaded call recordings."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=get_upload_path)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='call_recordings')
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"{self.title} - {self.agent.user.get_full_name()}"

class CallAnalysis(models.Model):
    """Model for storing AI analysis results of call recordings."""
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]
    
    call_recording = models.OneToOneField(CallRecording, on_delete=models.CASCADE, related_name='analysis')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='call_analyses')
    
    # Transcription data
    transcription_text = models.TextField()
    agent_text = models.TextField()  # Agent's parts of the conversation
    customer_text = models.TextField()  # Customer's parts of the conversation
    
    # Analysis results
    coverage_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="AI-generated score (0-10) of how well the agent handled the complaint"
    )
    score_explanation = models.TextField(help_text="Explanation of the coverage score")
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES)
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="AI confidence in the analysis (0-1)"
    )
    
    # Key insights
    key_issues = models.JSONField(default=list, help_text="List of key issues identified")
    compliance_check = models.JSONField(default=dict, help_text="Compliance check results")
    improvement_suggestions = models.TextField(blank=True)
    
    # Processing metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analysis for {self.call_recording.title}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update agent metrics when analysis is saved
        self.agent.update_metrics()

class Report(models.Model):
    """Model for aggregated reports and analytics."""
    REPORT_TYPE_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom'),
    ]
    
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    date_range_start = models.DateField()
    date_range_end = models.DateField()
    
    # Excel report file
    excel_file = models.FileField(upload_to='reports', blank=True, null=True)
    
    # Report data
    agent_performance = models.JSONField(default=dict)
    common_issues = models.JSONField(default=list)
    trend_analysis = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"

class TrainingSession(models.Model):
    """Model for agent training sessions."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]
    
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='training_sessions')
    title = models.CharField(max_length=255)
    query_text = models.TextField(help_text="Text-based customer query for the agent to respond to")
    agent_response = models.TextField(blank=True, help_text="Agent's recorded response")
    
    # AI Evaluation
    tone_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        null=True, blank=True
    )
    clarity_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        null=True, blank=True
    )
    accuracy_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        null=True, blank=True
    )
    feedback = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.agent.user.get_full_name()}"
