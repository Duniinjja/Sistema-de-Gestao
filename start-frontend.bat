@echo off
title Frontend React - Sistema de Gestao
color 0E

echo ========================================
echo    FRONTEND REACT - PORTA 3000
echo ========================================
echo.

cd /d %~dp0frontend

echo [INFO] Verificando dependencias...
if not exist node_modules (
    echo.
    echo [AVISO] Pasta node_modules nao encontrada!
    echo Instalando dependencias...
    call npm install
    echo.
)

echo [INFO] Iniciando servidor de desenvolvimento...
echo.
echo Acesse: http://localhost:3000
echo.
echo ----------------------------------------
echo.

npm run dev

pause
