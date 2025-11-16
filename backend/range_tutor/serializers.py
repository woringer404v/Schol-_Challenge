from rest_framework import serializers
from .models import Challenge, InitialDataPoint


class InitialDataPointSerializer(serializers.ModelSerializer):
    """
    Serializer for InitialDataPoint model.
    """
    class Meta:
        model = InitialDataPoint
        fields = ['label', 'initial_x', 'initial_y', 'initial_z']


class ChallengeSerializer(serializers.ModelSerializer):
    """
    Serializer for Challenge model with nested initial data points.
    """
    initial_data = InitialDataPointSerializer(many=True, read_only=True)

    class Meta:
        model = Challenge
        fields = [
            'id',
            'title',
            'instruction_text',
            'rule_operator',
            'rule_value_a',
            'rule_value_b',
            'initial_data'
        ]


class SubmissionDataPointSerializer(serializers.Serializer):
    """
    Non-model serializer for validating individual submitted data points.
    """
    label = serializers.CharField(max_length=100)
    x = serializers.FloatField()
    y = serializers.FloatField()
    z = serializers.FloatField(required=False)

    def validate_y(self, value):
        """Ensure y value is a valid number."""
        if value is None:
            raise serializers.ValidationError("Y value cannot be null.")
        return value


class SubmissionSerializer(serializers.Serializer):
    """
    Non-model serializer for validating the entire submission payload.
    """
    submitted_data = serializers.ListField(
        child=SubmissionDataPointSerializer(),
        allow_empty=False
    )

    def validate_submitted_data(self, value):
        """Ensure at least one data point is submitted."""
        if not value:
            raise serializers.ValidationError("Submitted data cannot be empty.")
        return value
