@echo off
title Setup - Sistema de Gestao
color 0A

echo ========================================
echo    SISTEMA DE GESTAO MULTIEMPRESAS
echo         Setup Automatico
echo ========================================
echo.

:: Verifica se Python esta instalado
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale o Python 3.11+ primeiro.
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Verifica se Node.js esta instalado
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js 18+ primeiro.
    echo https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo [OK] Node.js encontrado
echo.

echo ========================================
echo [1/5] Configurando Backend...
echo ========================================
echo.

cd /d %~dp0backend

if not exist venv (
    echo [INFO] Criando ambiente virtual Python...
    python -m venv venv
) else (
    echo [INFO] Ambiente virtual ja existe.
)

echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate

echo [INFO] Instalando dependencias Python...
pip install -r requirements.txt --quiet

if not exist .env (
    echo.
    echo [INFO] Criando arquivo .env...
    copy .env.example .env > nul
    echo.
    echo ========================================
    echo    IMPORTANTE!
    echo ========================================
    echo Edite o arquivo backend\.env com suas
    echo configuracoes de banco de dados antes
    echo de continuar.
    echo ========================================
    echo.
    pause
)

echo.
echo ========================================
echo [2/5] Configurando Banco de Dados...
echo ========================================
echo.

echo [INFO] Criando migrations...
python manage.py makemigrations --verbosity=0

echo [INFO] Aplicando migrations...
python manage.py migrate --verbosity=0

echo [OK] Banco de dados configurado!

echo.
echo ========================================
echo [3/5] Criar Admin Chefe?
echo ========================================
echo.
echo Deseja criar um superusuario agora? (S/N)
choice /c SN /n
if errorlevel 2 goto :frontend
if errorlevel 1 (
    echo.
    python manage.py createsuperuser
)

:frontend
cd /d %~dp0

echo.
echo ========================================
echo [4/5] Configurando Frontend...
echo ========================================
echo.

cd frontend

if not exist node_modules (
    echo [INFO] Instalando dependencias Node.js...
    call npm install
) else (
    echo [INFO] Dependencias ja instaladas.
)

cd /d %~dp0

echo.
echo ========================================
echo [5/5] Setup Concluido!
echo ========================================
echo.
echo Para iniciar o sistema, execute:
echo.
echo   start.bat     - Inicia Backend e Frontend
echo.
echo Ou separadamente:
echo   start-backend.bat   - Apenas Backend
echo   start-frontend.bat  - Apenas Frontend
echo.
echo ----------------------------------------
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:8000/admin
echo.
echo ========================================
echo.

echo Deseja iniciar o sistema agora? (S/N)
choice /c SN /n
if errorlevel 2 goto :end
if errorlevel 1 (
    call start.bat
)

:end
pause
