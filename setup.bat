@echo off
echo ========================================
echo Sistema de Gestao Multiempresas
echo Setup Automatico - Windows
echo ========================================
echo.

echo [1/5] Configurando Backend...
cd backend

echo Criando ambiente virtual Python...
python -m venv venv

echo Ativando ambiente virtual...
call venv\Scripts\activate

echo Instalando dependencias...
pip install -r requirements.txt

echo Criando arquivo .env...
if not exist .env (
    copy .env.example .env
    echo IMPORTANTE: Edite o arquivo backend\.env com suas configuracoes!
    pause
)

echo.
echo [2/5] Aplicando migracoes do banco de dados...
python manage.py makemigrations
python manage.py migrate

echo.
echo [3/5] Criando superusuario...
echo Digite as informacoes do Admin Chefe:
python manage.py createsuperuser

cd..

echo.
echo [4/5] Configurando Frontend...
cd frontend

echo Instalando dependencias do Node.js...
call npm install

cd..

echo.
echo ========================================
echo Setup Concluido!
echo ========================================
echo.
echo Para iniciar o sistema:
echo.
echo Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
echo Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Acesse: http://localhost:3000
echo.
pause
