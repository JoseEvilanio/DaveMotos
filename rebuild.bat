@echo off
echo Encerrando processos do Electron...
taskkill /F /IM "Sistema Oficina Motos.exe" 2>nul
timeout /t 2 /nobreak >nul

echo Limpando pasta release...
if exist "release" (
    rmdir /s /q release 2>nul
    timeout /t 1 /nobreak >nul
)

echo Reconstruindo...
call npm run electron:build:win

echo.
echo Concluido!
pause
