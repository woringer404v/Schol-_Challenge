from django.db import models


class Challenge(models.Model):
    """
    Represents a Range learning challenge with validation rules.
    """
    LESS_THAN = 'LESS_THAN'
    GREATER_THAN = 'GREATER_THAN'
    BETWEEN = 'BETWEEN'

    RULE_OPERATOR_CHOICES = [
        (LESS_THAN, 'Less Than'),
        (GREATER_THAN, 'Greater Than'),
        (BETWEEN, 'Between'),
    ]

    title = models.CharField(max_length=255)
    instruction_text = models.TextField()
    rule_operator = models.CharField(
        max_length=20,
        choices=RULE_OPERATOR_CHOICES,
        default=BETWEEN
    )
    rule_value_a = models.FloatField(
        help_text="For BETWEEN: minimum value. For LESS_THAN: maximum value. For GREATER_THAN: minimum value."
    )
    rule_value_b = models.FloatField(
        null=True,
        blank=True,
        help_text="Only used for BETWEEN operator (maximum value)."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class InitialDataPoint(models.Model):
    """
    Represents an initial data point for a challenge.
    """
    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='initial_data'
    )
    label = models.CharField(max_length=100)
    initial_x = models.FloatField(help_text="Number of Stations")
    initial_y = models.FloatField(help_text="Total System Length (km)")
    initial_z = models.FloatField(help_text="Ridership (billions, for bubble size)")

    order = models.IntegerField(default=0, help_text="Display order")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.label} - {self.challenge.title}"
