from django.core.management.base import BaseCommand
from range_tutor.models import Challenge, InitialDataPoint


class Command(BaseCommand):
    help = 'Seeds the database with initial challenge and data points'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database with challenges...')

        # Clear existing data (optional - comment out to preserve data)
        Challenge.objects.all().delete()
        InitialDataPoint.objects.all().delete()

        # Reset the auto-increment counter (SQLite specific)
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='range_tutor_challenge';")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='range_tutor_initialdatapoint';")

        # Challenge 1: Metro Systems - BETWEEN range
        challenge1 = Challenge.objects.create(
            title='Metro Systems - Target Range',
            instruction_text=(
                'Adjust the metro system positions so the range (Total System Length) is between 150km and 500km. '
                'The range includes all Y-axis values from minimum to maximum.'
            ),
            rule_operator=Challenge.BETWEEN,
            rule_value_a=150.0,
            rule_value_b=500.0
        )

        # Metro system data points
        metro_data = [
            {'label': 'Shanghai', 'x': 375, 'y': 550, 'z': 3.5, 'order': 1},
            {'label': 'Beijing', 'x': 340, 'y': 510, 'z': 3.5, 'order': 2},
            {'label': 'London', 'x': 280, 'y': 400, 'z': 1.5, 'order': 3},
            {'label': 'New York City', 'x': 425, 'y': 350, 'z': 2.5, 'order': 4},
            {'label': 'Seoul', 'x': 300, 'y': 325, 'z': 2.5, 'order': 5},
            {'label': 'Moscow', 'x': 250, 'y': 325, 'z': 2.5, 'order': 6},
            {'label': 'Paris', 'x': 300, 'y': 260, 'z': 1.5, 'order': 7},
            {'label': 'Guangzhou', 'x': 140, 'y': 240, 'z': 2.5, 'order': 8},
            {'label': 'Mexico City', 'x': 200, 'y': 210, 'z': 1.5, 'order': 9},
            {'label': 'Delhi', 'x': 150, 'y': 200, 'z': 1.5, 'order': 10},
            {'label': 'Tokyo', 'x': 190, 'y': 190, 'z': 2.5, 'order': 11},
        ]

        for data in metro_data:
            InitialDataPoint.objects.create(
                challenge=challenge1,
                label=data['label'],
                initial_x=data['x'],
                initial_y=data['y'],
                initial_z=data['z'],
                order=data['order']
            )

        self.stdout.write(self.style.SUCCESS(f'Created challenge 1: "{challenge1.title}"'))

        # Challenge 2: City Populations - LESS THAN range
        challenge2 = Challenge.objects.create(
            title='City Populations - Maximum Limit',
            instruction_text=(
                'Adjust city positions so all population values (Y-axis) are less than 20 million. '
                'The range must not exceed this upper limit.'
            ),
            rule_operator=Challenge.LESS_THAN,
            rule_value_a=20.0,
            rule_value_b=None
        )

        # City population data (in millions)
        city_data = [
            {'label': 'Tokyo', 'x': 380, 'y': 38, 'z': 3.5, 'order': 1},
            {'label': 'Delhi', 'x': 285, 'y': 33, 'z': 3.0, 'order': 2},
            {'label': 'Shanghai', 'x': 250, 'y': 28, 'z': 2.5, 'order': 3},
            {'label': 'São Paulo', 'x': 220, 'y': 50, 'z': 2.0, 'order': 4},
            {'label': 'Mexico City', 'x': 195, 'y': 45, 'z': 1.5, 'order': 5},
            {'label': 'Cairo', 'x': 180, 'y': 22, 'z': 1.8, 'order': 6},
            {'label': 'Mumbai', 'x': 170, 'y': 35, 'z': 2.2, 'order': 7},
            {'label': 'Beijing', 'x': 165, 'y': 18, 'z': 2.0, 'order': 8},
        ]

        for data in city_data:
            InitialDataPoint.objects.create(
                challenge=challenge2,
                label=data['label'],
                initial_x=data['x'],
                initial_y=data['y'],
                initial_z=data['z'],
                order=data['order']
            )

        self.stdout.write(self.style.SUCCESS(f'Created challenge 2: "{challenge2.title}"'))

        # Challenge 3: Tech Companies - GREATER THAN range
        challenge3 = Challenge.objects.create(
            title='Tech Companies - Minimum Threshold',
            instruction_text=(
                'Adjust tech company positions so all revenue values (Y-axis) are greater than 50 billion USD. '
                'The range must start above this minimum threshold.'
            ),
            rule_operator=Challenge.GREATER_THAN,
            rule_value_a=50.0,
            rule_value_b=None
        )

        # Tech company revenue data (in billions USD)
        tech_data = [
            {'label': 'Apple', 'x': 170, 'y': 45, 'z': 3.0, 'order': 1},
            {'label': 'Microsoft', 'x': 180, 'y': 38, 'z': 2.8, 'order': 2},
            {'label': 'Alphabet', 'x': 150, 'y': 52, 'z': 2.5, 'order': 3},
            {'label': 'Amazon', 'x': 200, 'y': 55, 'z': 3.2, 'order': 4},
            {'label': 'Meta', 'x': 140, 'y': 42, 'z': 2.3, 'order': 5},
            {'label': 'Tesla', 'x': 120, 'y': 48, 'z': 2.0, 'order': 6},
            {'label': 'NVIDIA', 'x': 160, 'y': 35, 'z': 2.2, 'order': 7},
            {'label': 'Samsung', 'x': 190, 'y': 58, 'z': 2.7, 'order': 8},
        ]

        for data in tech_data:
            InitialDataPoint.objects.create(
                challenge=challenge3,
                label=data['label'],
                initial_x=data['x'],
                initial_y=data['y'],
                initial_z=data['z'],
                order=data['order']
            )

        self.stdout.write(self.style.SUCCESS(f'Created challenge 3: "{challenge3.title}"'))

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created 3 challenges with total {len(metro_data) + len(city_data) + len(tech_data)} data points'
            )
        )
