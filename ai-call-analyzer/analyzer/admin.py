from django.contrib import admin
from .models import Agent, CallRecording, CallAnalysis, Report, TrainingSession

# Register your models here.

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department', 'hire_date', 'avg_coverage_score', 'total_calls_handled')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'employee_id', 'department')
    list_filter = ('department', 'hire_date')

@admin.register(CallRecording)
class CallRecordingAdmin(admin.ModelAdmin):
    list_display = ('title', 'agent', 'customer_phone', 'uploaded_at', 'duration_seconds', 'status')
    search_fields = ('title', 'agent__user__username', 'customer_phone')
    list_filter = ('status', 'uploaded_at')
    date_hierarchy = 'uploaded_at'

@admin.register(CallAnalysis)
class CallAnalysisAdmin(admin.ModelAdmin):
    list_display = ('call_recording', 'agent', 'coverage_score', 'sentiment', 'confidence_score', 'created_at')
    search_fields = ('call_recording__title', 'agent__user__username')
    list_filter = ('sentiment', 'created_at')
    date_hierarchy = 'created_at'
    readonly_fields = ('transcription_text', 'agent_text', 'customer_text', 'key_issues', 'compliance_check')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'date_range_start', 'date_range_end', 'created_at')
    search_fields = ('title',)
    list_filter = ('report_type', 'created_at')
    date_hierarchy = 'created_at'

@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'agent', 'status', 'tone_score', 'clarity_score', 'accuracy_score', 'created_at')
    search_fields = ('title', 'agent__user__username')
    list_filter = ('status', 'created_at')
    date_hierarchy = 'created_at'
    readonly_fields = ('completed_at',)
