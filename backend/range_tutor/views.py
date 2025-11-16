from rest_framework import status
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Challenge
from .serializers import ChallengeSerializer, SubmissionSerializer
from .evaluation_logic import evaluate_submission


class ChallengeListView(ListAPIView):
    """
    Lists all available challenges.

    Endpoint: GET /api/challenges/
    """
    queryset = Challenge.objects.all().order_by('id')
    serializer_class = ChallengeSerializer


class ChallengeDetailView(RetrieveAPIView):
    """
    Retrieves a single challenge with its initial data points.

    Endpoint: GET /api/challenge/<int:pk>/
    """
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer


class ChallengeSubmitView(APIView):
    """
    Accepts a submission of modified data points and evaluates them.

    Endpoint: POST /api/challenge/<int:pk>/submit/

    Expected payload:
    {
        "submitted_data": [
            {"label": "Shanghai", "x": 375, "y": 450, "z": 3.5},
            ...
        ]
    }

    Returns:
    {
        "correct": true/false,
        "feedback": "..."
    }
    """

    def post(self, request, pk):
        # Validate the incoming data
        submission_serializer = SubmissionSerializer(data=request.data)

        if not submission_serializer.is_valid():
            return Response(
                {
                    'error': 'Invalid submission format',
                    'details': submission_serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch the challenge
        challenge = get_object_or_404(Challenge, pk=pk)

        # Extract validated data
        submitted_data = submission_serializer.validated_data['submitted_data']

        # Evaluate the submission
        result = evaluate_submission(challenge, submitted_data)

        return Response(result, status=status.HTTP_200_OK)
