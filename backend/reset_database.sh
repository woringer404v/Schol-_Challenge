#!/bin/bash
# Script to reset the database and reseed data with ID 1

echo "Resetting database..."

# Delete the database
rm -f db.sqlite3

# Run migrations
python manage.py migrate

# Seed data
python manage.py seed_data

echo "Database reset complete!"
