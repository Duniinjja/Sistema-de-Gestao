@echo off
title Backend Django - Sistema de Gestao
color 0B

echo ========================================
echo    BACKEND DJANGO - PORTA 8000
echo ========================================
echo.

cd /d %~dp0backend

echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate

echo [INFO] Verificando migrations pendentes...
python manage.py showmigrations --list | findstr "\[ \]" > nul
if %errorlevel% == 0 (
    echo.
    echo [AVISO] Existem migrations pendentes!
    echo Deseja aplicar agora? (S/N)
    choice /c SN /n
    if errorlevel 2 goto :start
    if errorlevel 1 (
        echo.
        echo [INFO] Aplicando migrations...
        python manage.py migrate
        echo.
    )
)

:start
echo.
echo [INFO] Iniciando servidor Django...
echo.
echo Acesse: http://localhost:8000
echo Admin:  http://localhost:8000/admin
echo.
echo ----------------------------------------
echo.

python manage.py runserver

pause
