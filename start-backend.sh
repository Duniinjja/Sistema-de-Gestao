#!/bin/bash
echo "Iniciando Backend Django..."
cd backend
source venv/bin/activate
python manage.py runserver
