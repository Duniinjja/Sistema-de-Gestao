@echo off
title Sistema de Gestao - Iniciando...
color 0A

echo ========================================
echo    SISTEMA DE GESTAO MULTIEMPRESAS
echo ========================================
echo.

echo [INFO] Iniciando Backend e Frontend...
echo.

:: Inicia o Backend em uma nova janela
echo [1/2] Iniciando Backend Django...
start "Backend Django - Sistema de Gestao" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && echo. && echo ======================================== && echo    BACKEND DJANGO - PORTA 8000 && echo ======================================== && echo. && python manage.py runserver"

:: Aguarda 3 segundos para o backend iniciar
timeout /t 3 /nobreak > nul

:: Inicia o Frontend em uma nova janela
echo [2/2] Iniciando Frontend React...
start "Frontend React - Sistema de Gestao" cmd /k "cd /d %~dp0frontend && echo. && echo ======================================== && echo    FRONTEND REACT - PORTA 3000 && echo ======================================== && echo. && npm run dev"

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:8000/admin
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause > nul

:: Abre o navegador automaticamente
start http://localhost:3000

exit
