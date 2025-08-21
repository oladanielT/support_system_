#!/usr/bin/env bash
set -e  # Exit immediately if a command fails

echo "Upgrading pip, setuptools, and wheel..."
python -m pip install --upgrade pip setuptools wheel

echo "Installing requirements..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput


echo "Running migrations..."
python manage.py migrate

echo "Build complete!"
