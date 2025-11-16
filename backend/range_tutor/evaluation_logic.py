from typing import Dict, List
from .models import Challenge


def evaluate_submission(challenge: Challenge, submitted_data: List[Dict]) -> Dict:
    """
    Evaluates a user's submission against the challenge's range rules.

    Args:
        challenge: The Challenge object containing the rules.
        submitted_data: List of dictionaries with 'label', 'x', 'y' keys.

    Returns:
        Dictionary with 'correct' (bool) and 'feedback' (str) keys.
    """
    # Extract all Y values from submitted data
    y_values = [point['y'] for point in submitted_data]

    if not y_values:
        return {
            'correct': False,
            'feedback': 'No data points were submitted.'
        }

    # Calculate the range (min and max Y values)
    min_y = min(y_values)
    max_y = max(y_values)

    # Retrieve challenge rules
    operator = challenge.rule_operator
    rule_a = challenge.rule_value_a
    rule_b = challenge.rule_value_b

    # Evaluate based on the operator
    correct = False

    if operator == Challenge.LESS_THAN:
        correct = max_y < rule_a
        if correct:
            feedback = (
                f"Well done! The range of your data is [{min_y:.1f}km, {max_y:.1f}km]. "
                f"The maximum value ({max_y:.1f}km) is less than {rule_a:.1f}km."
            )
        else:
            feedback = (
                f"Not quite. The maximum value should be less than {rule_a:.1f}km, "
                f"but your range is [{min_y:.1f}km, {max_y:.1f}km]."
            )

    elif operator == Challenge.GREATER_THAN:
        correct = min_y > rule_a
        if correct:
            feedback = (
                f"Well done! The range of your data is [{min_y:.1f}km, {max_y:.1f}km]. "
                f"The minimum value ({min_y:.1f}km) is greater than {rule_a:.1f}km."
            )
        else:
            feedback = (
                f"Not quite. The minimum value should be greater than {rule_a:.1f}km, "
                f"but your range is [{min_y:.1f}km, {max_y:.1f}km]."
            )

    elif operator == Challenge.BETWEEN:
        if rule_b is None:
            return {
                'correct': False,
                'feedback': 'Challenge configuration error: BETWEEN operator requires two values.'
            }

        correct = (min_y >= rule_a) and (max_y <= rule_b)
        if correct:
            feedback = (
                f"Well done! The range of your data is [{min_y:.1f}km, {max_y:.1f}km], "
                f"which fits perfectly within the required range of [{rule_a:.1f}km, {rule_b:.1f}km]."
            )
        else:
            feedback = (
                f"Not quite. The required range was [{rule_a:.1f}km, {rule_b:.1f}km], "
                f"but your range is [{min_y:.1f}km, {max_y:.1f}km]. "
            )
            if min_y < rule_a:
                feedback += f"The minimum value ({min_y:.1f}km) is too low. "
            if max_y > rule_b:
                feedback += f"The maximum value ({max_y:.1f}km) is too high."

    else:
        return {
            'correct': False,
            'feedback': f'Unknown operator: {operator}'
        }

    return {
        'correct': correct,
        'feedback': feedback
    }
