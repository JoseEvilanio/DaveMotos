@echo off
chcp 65001 >nul
title Sistema de Oficina de Motos - Iniciando...

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🏍️  SISTEMA DE OFICINA DE MOTOS  🏍️                ║
echo ║                                                            ║
echo ║              Iniciando o sistema...                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js antes de continuar:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js encontrado
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules\" (
    echo 📦 Instalando dependências pela primeira vez...
    echo    Isso pode levar alguns minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo.
    echo ✓ Dependências instaladas com sucesso!
    echo.
)

REM Iniciar o backend em segundo plano
echo 🚀 Iniciando servidor backend...
start /B cmd /c "node server\index.js > logs\backend.log 2>&1"

REM Aguardar o backend iniciar
echo    Aguardando servidor inicializar...
timeout /t 3 /nobreak >nul

REM Verificar se o backend está rodando
curl -s http://localhost:3001/api/health >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    Aguardando mais um pouco...
    timeout /t 3 /nobreak >nul
)

echo ✓ Servidor backend iniciado!
echo.

REM Iniciar o frontend em segundo plano
echo 🎨 Iniciando interface do sistema...
start /B cmd /c "npm run dev > logs\frontend.log 2>&1"

REM Aguardar o frontend iniciar
echo    Aguardando interface carregar...
timeout /t 5 /nobreak >nul

echo ✓ Interface iniciada!
echo.

REM Abrir o navegador
echo 🌐 Abrindo navegador...
timeout /t 2 /nobreak >nul

REM Tentar abrir no navegador padrão - múltiplas tentativas
start "" "http://localhost:3000"
timeout /t 1 /nobreak >nul

REM Tentar com rundll32 se o start não funcionou
rundll32 url.dll,FileProtocolHandler "http://localhost:3000"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        ✅ SISTEMA INICIADO COM SUCESSO! ✅                 ║
echo ║                                                            ║
echo ║    O sistema está rodando em: http://localhost:3000       ║
echo ║                                                            ║
echo ║    ⚠️  NÃO FECHE ESTA JANELA enquanto usar o sistema!     ║
echo ║                                                            ║
echo ║    📌 Se o navegador não abriu automaticamente:           ║
echo ║       1. Abra seu navegador manualmente                   ║
echo ║       2. Digite: http://localhost:3000                    ║
echo ║       OU execute: abrir-navegador.bat                     ║
echo ║                                                            ║
echo ║    Para encerrar: Feche esta janela ou pressione Ctrl+C   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Pressione qualquer tecla para encerrar o sistema...
pause >nul

REM Encerrar processos ao fechar
echo.
echo 🛑 Encerrando sistema...
taskkill /F /IM node.exe >nul 2>nul
echo ✓ Sistema encerrado!
timeout /t 2 /nobreak >nul
