#!/bin/bash

echo "========================================"
echo "Sistema de Gestão Multiempresas"
echo "Setup Automático - Linux/Mac"
echo "========================================"
echo ""

echo "[1/5] Configurando Backend..."
cd backend

echo "Criando ambiente virtual Python..."
python3 -m venv venv

echo "Ativando ambiente virtual..."
source venv/bin/activate

echo "Instalando dependências..."
pip install -r requirements.txt

echo "Criando arquivo .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "IMPORTANTE: Edite o arquivo backend/.env com suas configurações!"
    read -p "Pressione ENTER para continuar..."
fi

echo ""
echo "[2/5] Aplicando migrações do banco de dados..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "[3/5] Criando superusuário..."
echo "Digite as informações do Admin Chefe:"
python manage.py createsuperuser

cd ..

echo ""
echo "[4/5] Configurando Frontend..."
cd frontend

echo "Instalando dependências do Node.js..."
npm install

cd ..

echo ""
echo "========================================"
echo "Setup Concluído!"
echo "========================================"
echo ""
echo "Para iniciar o sistema:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
