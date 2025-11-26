@echo off
chcp 65001 >nul
title Abrir Sistema no Navegador

echo.
echo 🌐 Abrindo sistema no navegador...
echo.

REM Método 1: Start padrão
start "" "http://localhost:3000"
timeout /t 1 /nobreak >nul

REM Método 2: Rundll32
rundll32 url.dll,FileProtocolHandler "http://localhost:3000"
timeout /t 1 /nobreak >nul

REM Método 3: PowerShell
powershell -Command "Start-Process 'http://localhost:3000'"

echo.
echo ✅ Tentativas de abertura concluídas!
echo.
echo Se o navegador não abriu, copie e cole este endereço:
echo http://localhost:3000
echo.
pause
