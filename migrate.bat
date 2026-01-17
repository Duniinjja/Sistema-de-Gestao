@echo off
title Migrations - Sistema de Gestao
color 0D

echo ========================================
echo    SISTEMA DE GESTAO MULTIEMPRESAS
echo         Gerenciador de Migrations
echo ========================================
echo.

cd /d %~dp0backend

echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate

echo.
echo Escolha uma opcao:
echo.
echo [1] Criar e aplicar migrations (makemigrations + migrate)
echo [2] Apenas criar migrations (makemigrations)
echo [3] Apenas aplicar migrations (migrate)
echo [4] Ver migrations pendentes (showmigrations)
echo [5] Voltar/Cancelar
echo.

choice /c 12345 /n /m "Opcao: "

if errorlevel 5 goto :end
if errorlevel 4 goto :show
if errorlevel 3 goto :migrate
if errorlevel 2 goto :make
if errorlevel 1 goto :both

:both
echo.
echo [INFO] Criando migrations...
python manage.py makemigrations
echo.
echo [INFO] Aplicando migrations...
python manage.py migrate
echo.
echo [OK] Migrations aplicadas com sucesso!
goto :end

:make
echo.
echo [INFO] Criando migrations...
python manage.py makemigrations
echo.
echo [OK] Migrations criadas!
echo.
echo Para aplicar, execute: python manage.py migrate
goto :end

:migrate
echo.
echo [INFO] Aplicando migrations...
python manage.py migrate
echo.
echo [OK] Migrations aplicadas!
goto :end

:show
echo.
echo [INFO] Status das migrations:
echo ========================================
python manage.py showmigrations
goto :end

:end
echo.
pause
