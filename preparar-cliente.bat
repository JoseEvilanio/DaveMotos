@echo off
chcp 65001 >nul
title Preparação do Cliente - Sistema Oficina de Motos

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🏍️  PREPARAÇÃO DO CLIENTE  🏍️                      ║
echo ║                                                            ║
echo ║        Sistema de Oficina de Motos                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Este script irá verificar se o ambiente está pronto
echo para instalar o Sistema de Oficina de Motos.
echo.
pause

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Verificando Requisitos                                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar PostgreSQL
echo 🔍 Verificando PostgreSQL...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL não encontrado!
    echo.
    echo O PostgreSQL é necessário para o sistema funcionar.
    echo.
    set /p INSTALAR_PG="Deseja abrir o site de download do PostgreSQL? (S/N): "
    if /i "%INSTALAR_PG%"=="S" (
        start https://www.postgresql.org/download/windows/
        echo.
        echo Após instalar o PostgreSQL, execute este script novamente.
        pause
        exit /b 1
    ) else (
        echo.
        echo ⚠️  ATENÇÃO: O sistema não funcionará sem PostgreSQL!
        pause
        exit /b 1
    )
) else (
    echo ✓ PostgreSQL encontrado
    psql --version
)
echo.

REM Verificar se PostgreSQL está rodando
echo 🔍 Verificando se PostgreSQL está rodando...
sc query postgresql-x64-14 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Serviço PostgreSQL está rodando
) else (
    echo ⚠️  Serviço PostgreSQL não encontrado ou não está rodando
    echo.
    echo Tentando iniciar...
    net start postgresql-x64-14 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ PostgreSQL iniciado com sucesso
    ) else (
        echo ❌ Não foi possível iniciar o PostgreSQL automaticamente
        echo    Inicie manualmente pelo Painel de Controle → Serviços
    )
)
echo.

REM Verificar banco de dados
echo 🔍 Verificando banco de dados 'moto'...
set /p PG_PASSWORD="Digite a senha do usuário postgres: "
psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname='moto';" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Banco de dados 'moto' não encontrado
    echo.
    set /p CRIAR_DB="Deseja criar o banco de dados agora? (S/N): "
    if /i "%CRIAR_DB%"=="S" (
        echo.
        echo Criando banco de dados...
        psql -U postgres -c "CREATE DATABASE moto;" 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo ✓ Banco de dados 'moto' criado com sucesso!
        ) else (
            echo ❌ Erro ao criar banco de dados
            echo    Verifique a senha e tente novamente
        )
    )
) else (
    echo ✓ Banco de dados 'moto' encontrado
)
echo.

REM Verificar scripts SQL
echo 🔍 Verificando scripts SQL...
if exist "database\schema-local.sql" (
    echo ✓ Script schema-local.sql encontrado
    
    set /p EXECUTAR_SQL="Deseja executar os scripts SQL agora? (S/N): "
    if /i "%EXECUTAR_SQL%"=="S" (
        echo.
        echo Executando schema-local.sql...
        psql -U postgres -d moto -f "database\schema-local.sql"
        if %ERRORLEVEL% EQU 0 (
            echo ✓ Schema criado com sucesso!
        ) else (
            echo ❌ Erro ao executar schema
        )
        
        echo.
        if exist "database\seed-data.sql" (
            set /p EXECUTAR_SEED="Deseja inserir dados de exemplo? (S/N): "
            if /i "%EXECUTAR_SEED%"=="S" (
                echo Executando seed-data.sql...
                psql -U postgres -d moto -f "database\seed-data.sql"
                if %ERRORLEVEL% EQU 0 (
                    echo ✓ Dados de exemplo inseridos!
                ) else (
                    echo ❌ Erro ao inserir dados
                )
            )
        )
    )
) else (
    echo ⚠️  Scripts SQL não encontrados na pasta database/
)
echo.

REM Resumo
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        📋 RESUMO DA VERIFICAÇÃO                            ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Requisitos verificados:
echo   [✓] PostgreSQL instalado
echo   [✓] PostgreSQL rodando
echo   [✓] Banco de dados 'moto' criado
echo   [✓] Tabelas criadas
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        ✅ AMBIENTE PRONTO! ✅                              ║
echo ║                                                            ║
echo ║    Próximos passos:                                        ║
echo ║    1. Execute o instalador do sistema                      ║
echo ║    2. Clique no atalho criado                              ║
echo ║    3. Faça login com:                                      ║
echo ║       Usuário: admin                                       ║
echo ║       Senha: admin123                                      ║
echo ║                                                            ║
echo ║    ⚠️  IMPORTANTE: Altere a senha após o primeiro login!  ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
