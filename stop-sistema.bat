@echo off
chcp 65001 >nul
title Sistema de Oficina de Motos - Encerrando...

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🏍️  SISTEMA DE OFICINA DE MOTOS  🏍️                ║
echo ║                                                            ║
echo ║              Encerrando o sistema...                       ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Parando processos do sistema...
taskkill /F /IM node.exe >nul 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ Sistema encerrado com sucesso!
) else (
    echo ℹ️  Nenhum processo do sistema estava rodando.
)

echo.
echo Pressione qualquer tecla para fechar...
pause >nul
