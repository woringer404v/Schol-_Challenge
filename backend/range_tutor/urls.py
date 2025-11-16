from django.urls import path
from .views import ChallengeListView, ChallengeDetailView, ChallengeSubmitView

app_name = 'range_tutor'

urlpatterns = [
    path('challenges/', ChallengeListView.as_view(), name='challenge-list'),
    path('challenge/<int:pk>/', ChallengeDetailView.as_view(), name='challenge-detail'),
    path('challenge/<int:pk>/submit/', ChallengeSubmitView.as_view(), name='challenge-submit'),
]
