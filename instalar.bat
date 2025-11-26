@echo off
chcp 65001 >nul
title Sistema de Oficina de Motos - Instalação

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🏍️  SISTEMA DE OFICINA DE MOTOS  🏍️                ║
echo ║                                                            ║
echo ║              Instalador do Sistema                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Verificando requisitos...
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo O Node.js é necessário para rodar o sistema.
    echo.
    echo 📥 Deseja baixar o Node.js agora? (S/N)
    set /p download="Digite S para abrir o site de download: "
    if /i "%download%"=="S" (
        start https://nodejs.org/
        echo.
        echo Após instalar o Node.js, execute este instalador novamente.
        echo.
        pause
        exit /b 1
    ) else (
        echo.
        echo Instalação cancelada.
        pause
        exit /b 1
    )
)

echo ✓ Node.js encontrado: 
node --version
echo.

REM Verificar PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PostgreSQL não encontrado no PATH
    echo.
    echo O PostgreSQL é necessário para o banco de dados.
    echo.
    echo 📥 Deseja baixar o PostgreSQL agora? (S/N)
    set /p download_pg="Digite S para abrir o site de download: "
    if /i "%download_pg%"=="S" (
        start https://www.postgresql.org/download/
        echo.
        echo Após instalar o PostgreSQL, execute este instalador novamente.
        echo.
        pause
        exit /b 1
    ) else (
        echo.
        echo ⚠️  Continuando sem verificar PostgreSQL...
        echo    Certifique-se de que está instalado e rodando!
        echo.
        timeout /t 3 /nobreak >nul
    )
) else (
    echo ✓ PostgreSQL encontrado
    echo.
)

REM Criar diretórios necessários
echo 📁 Criando estrutura de diretórios...
if not exist "logs\" mkdir logs
if not exist "database\backups\" mkdir database\backups
echo ✓ Diretórios criados!
echo.

REM Instalar dependências
echo 📦 Instalando dependências do sistema...
echo    Isso pode levar alguns minutos...
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao instalar dependências!
    echo.
    echo Verifique sua conexão com a internet e tente novamente.
    pause
    exit /b 1
)

echo.
echo ✓ Dependências instaladas com sucesso!
echo.

REM Criar atalho na área de trabalho
echo 🔗 Criando atalho na área de trabalho...

set SCRIPT_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop

REM Criar arquivo VBS para criar atalho
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%DESKTOP%\Sistema Oficina Motos.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%SCRIPT_DIR%start-sistema.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "Sistema de Gestão para Oficina de Motos" >> CreateShortcut.vbs
echo oLink.IconLocation = "%SystemRoot%\System32\SHELL32.dll,165" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

cscript //nologo CreateShortcut.vbs
del CreateShortcut.vbs

echo ✓ Atalho criado na área de trabalho!
echo.

REM Verificar banco de dados
echo 🗄️  Verificando banco de dados...
echo.
echo    ⚠️  IMPORTANTE: Certifique-se de que:
echo       1. O PostgreSQL está rodando
echo       2. O banco de dados 'moto' foi criado
echo       3. As tabelas foram criadas (execute os scripts SQL)
echo.

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO! ✅             ║
echo ║                                                            ║
echo ║    Para iniciar o sistema:                                 ║
echo ║    1. Clique no atalho "Sistema Oficina Motos"            ║
echo ║       na área de trabalho                                  ║
echo ║                                                            ║
echo ║    OU                                                      ║
echo ║                                                            ║
echo ║    2. Execute o arquivo "start-sistema.bat"                ║
echo ║                                                            ║
echo ║    O sistema abrirá automaticamente no navegador!          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
