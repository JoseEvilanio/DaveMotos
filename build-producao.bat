@echo off
chcp 65001 >nul
title Build de Produção - Sistema Oficina de Motos

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🏍️  BUILD DE PRODUÇÃO  🏍️                          ║
echo ║                                                            ║
echo ║        Sistema de Oficina de Motos                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Node.js não encontrado!
    pause
    exit /b 1
)

echo ✓ Node.js encontrado: 
node --version
echo.

REM Perguntar versão
set /p VERSION="Digite a versão (ex: 1.0.0): "
if "%VERSION%"=="" (
    echo ❌ Versão não informada!
    pause
    exit /b 1
)

echo.
echo 📋 Checklist de Pré-Build
echo ═══════════════════════════════════════════════════════════
echo.
echo Antes de continuar, verifique:
echo   [ ] Código testado em desenvolvimento
echo   [ ] Todas as funcionalidades funcionando
echo   [ ] Ícone criado em assets/icon.ico
echo   [ ] Documentação atualizada
echo   [ ] Versão atualizada em package.json para %VERSION%
echo.
set /p CONTINUAR="Tudo pronto? (S/N): "
if /i not "%CONTINUAR%"=="S" (
    echo.
    echo Build cancelado.
    pause
    exit /b 0
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Iniciando Build de Produção                               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Passo 1: Limpar builds antigos
echo 🧹 Passo 1/5: Limpando builds antigos...
if exist "dist\" (
    rmdir /s /q dist
    echo   ✓ Pasta dist removida
)
if exist "release\" (
    rmdir /s /q release
    echo   ✓ Pasta release removida
)
echo.

REM Passo 2: Limpar cache
echo 🗑️  Passo 2/5: Limpando cache do npm...
call npm cache clean --force >nul 2>nul
echo   ✓ Cache limpo
echo.

REM Passo 3: Build do frontend
echo 🎨 Passo 3/5: Compilando frontend...
echo   Isso pode levar alguns minutos...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERRO: Build do frontend falhou!
    pause
    exit /b 1
)
echo   ✓ Frontend compilado com sucesso!
echo.

REM Passo 4: Build do Electron
echo 📦 Passo 4/5: Gerando executável...
echo   Isso pode levar 5-15 minutos...
echo.
call npm run electron:build:win
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERRO: Build do Electron falhou!
    pause
    exit /b 1
)
echo.
echo   ✓ Executável gerado com sucesso!
echo.

REM Passo 5: Verificar arquivos
echo ✅ Passo 5/5: Verificando arquivos gerados...
if exist "release\Sistema Oficina Motos Setup %VERSION%.exe" (
    echo   ✓ Instalador encontrado!
    
    REM Obter tamanho do arquivo
    for %%A in ("release\Sistema Oficina Motos Setup %VERSION%.exe") do (
        set SIZE=%%~zA
    )
    
    REM Converter para MB
    set /a SIZE_MB=%SIZE% / 1048576
    echo   📊 Tamanho: %SIZE_MB% MB
) else (
    echo   ⚠️  Instalador não encontrado no caminho esperado
    echo   Verifique a pasta release/
)
echo.

REM Gerar checksum
echo 🔐 Gerando checksum SHA256...
powershell -Command "Get-FileHash 'release\Sistema Oficina Motos Setup %VERSION%.exe' -Algorithm SHA256 | Select-Object -ExpandProperty Hash" > "release\checksum.txt"
if exist "release\checksum.txt" (
    echo   ✓ Checksum gerado: release\checksum.txt
    type "release\checksum.txt"
)
echo.

REM Resumo
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        ✅ BUILD CONCLUÍDO COM SUCESSO! ✅                  ║
echo ║                                                            ║
echo ║    Versão: %VERSION%                                       ║
echo ║    Tamanho: %SIZE_MB% MB                                   ║
echo ║                                                            ║
echo ║    📁 Localização:                                         ║
echo ║    release\Sistema Oficina Motos Setup %VERSION%.exe       ║
echo ║                                                            ║
echo ║    📋 Próximos passos:                                     ║
echo ║    1. Testar o instalador                                  ║
echo ║    2. Verificar todas as funcionalidades                   ║
echo ║    3. Distribuir para os clientes                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Perguntar se quer abrir a pasta
set /p ABRIR="Deseja abrir a pasta release? (S/N): "
if /i "%ABRIR%"=="S" (
    start "" "release"
)

echo.
pause
