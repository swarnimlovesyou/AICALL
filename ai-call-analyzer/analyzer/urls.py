from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for API views
router = DefaultRouter()
router.register(r'agents', views.AgentViewSet)
router.register(r'call-recordings', views.CallRecordingViewSet)
router.register(r'call-analyses', views.CallAnalysisViewSet)
router.register(r'reports', views.ReportViewSet)
router.register(r'training-sessions', views.TrainingSessionViewSet)

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Web interface
    path('', views.dashboard, name='dashboard'),
]
