@echo off
echo ========================================
echo   OFICINA MOTO - SERVIDOR PWA
echo ========================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado: 
node --version
echo.

REM Verificar se o serve está instalado
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Pacote 'serve' nao encontrado.
    echo Instalando automaticamente...
    echo.
    npm install -g serve
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar 'serve'
        pause
        exit /b 1
    )
)

echo [OK] Servidor 'serve' instalado
echo.

REM Obter o IP local
echo Detectando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
)
set IP=%IP:~1%
echo [INFO] IP Local: %IP%
echo.

echo ========================================
echo   INICIANDO SERVIDOR...
echo ========================================
echo.
echo O sistema estara disponivel em:
echo.
echo   Local:  http://localhost:3000
echo   Rede:   http://%IP%:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

REM Iniciar o servidor
serve -s . -p 3000 -l 0.0.0.0

pause
