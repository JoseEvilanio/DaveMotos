# Script para criar o banco de dados PostgreSQL local
$env:PGPASSWORD = "N1e2t3o4@2106"
$dbHost = "localhost"
$dbPort = "5432"
$dbUsername = "postgres"
$dbName = "moto"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Criar Banco de Dados Moto" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o psql esta disponivel
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERRO: PostgreSQL (psql) nao encontrado no PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale o PostgreSQL ou adicione ao PATH:" -ForegroundColor Yellow
    Write-Host "C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Gray
    exit 1
}

Write-Host "OK: PostgreSQL encontrado" -ForegroundColor Green
Write-Host ""

# Passo 1: Criar o banco de dados
Write-Host "Passo 1: Criando banco de dados 'moto'..." -ForegroundColor Yellow

$createDbQuery = "SELECT 'CREATE DATABASE moto' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moto')\gexec"
$createDbQuery | psql -h $dbHost -p $dbPort -U $dbUsername -d postgres 2>&1 | Out-Null

Write-Host "OK: Banco de dados 'moto' criado/verificado" -ForegroundColor Green
Write-Host ""

# Passo 2: Executar o schema
Write-Host "Passo 2: Criando tabelas e estrutura..." -ForegroundColor Yellow

$schemaPath = Join-Path $PSScriptRoot "database\schema-local.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "ERRO: Arquivo schema-local.sql nao encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $schemaPath" -ForegroundColor Gray
    exit 1
}

# Executar o schema SQL
psql -h $dbHost -p $dbPort -U $dbUsername -d $dbName -f $schemaPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  Banco criado com sucesso!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Informacoes de conexao:" -ForegroundColor Cyan
    Write-Host "  Database: moto" -ForegroundColor White
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 5432" -ForegroundColor White
    Write-Host "  User: postgres" -ForegroundColor White
    Write-Host ""
    Write-Host "Usuario admin criado:" -ForegroundColor Cyan
    Write-Host "  Email: admin@oficina.com" -ForegroundColor White
    Write-Host "  Senha: senha123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERRO ao criar o schema!" -ForegroundColor Red
    Write-Host "Verifique as mensagens de erro acima." -ForegroundColor Yellow
    Write-Host ""
}
