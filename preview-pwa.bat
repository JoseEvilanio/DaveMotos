@echo off
echo ==========================================
echo INICIANDO SERVIDOR PWA (PREVIEW)
echo ==========================================
echo.
echo Este servidor usa os arquivos da pasta 'dist'
echo que acabaram de ser atualizados.
echo.
echo Acessando: http://localhost:8000
echo.

cd /d "%~dp0"
npm run preview -- --port 8000
pause
