# Script para criar o banco de dados PostgreSQL local
# Credenciais fornecidas

$env:PGPASSWORD = "N1e2t3o4@2106"
$dbHost = "localhost"
$dbPort = "5432"
$dbUsername = "postgres"
$dbName = "moto"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Criar Banco de Dados Moto" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o psql está disponível
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ Erro: PostgreSQL (psql) não encontrado no PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale o PostgreSQL ou adicione ao PATH:" -ForegroundColor Yellow
    Write-Host "C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✓ PostgreSQL encontrado" -ForegroundColor Green
Write-Host ""

# Passo 1: Criar o banco de dados se não existir
Write-Host "Passo 1: Criando banco de dados 'moto'..." -ForegroundColor Yellow

$createDbQuery = @"
SELECT 'CREATE DATABASE moto'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moto')\gexec
"@

$createDbQuery | psql -h $dbHost -p $dbPort -U $dbUsername -d postgres 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Banco de dados 'moto' criado/verificado" -ForegroundColor Green
} else {
    Write-Host "⚠ Banco de dados pode já existir (continuando...)" -ForegroundColor Yellow
}

Write-Host ""

# Passo 2: Executar o schema
Write-Host "Passo 2: Criando tabelas e estrutura..." -ForegroundColor Yellow

$schemaPath = Join-Path $PSScriptRoot "database\schema-local.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "❌ Erro: Arquivo schema-local.sql não encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $schemaPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Executar o schema SQL
psql -h $dbHost -p $dbPort -U $dbUsername -d $dbName -f $schemaPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  ✓ Banco criado com sucesso!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Informações de conexão:" -ForegroundColor Cyan
    Write-Host "  Database: moto" -ForegroundColor White
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 5432" -ForegroundColor White
    Write-Host "  User: postgres" -ForegroundColor White
    Write-Host ""
    Write-Host "Usuário admin criado:" -ForegroundColor Cyan
    Write-Host "  Email: admin@oficina.com" -ForegroundColor White
    Write-Host "  Senha: senha123" -ForegroundColor White
    Write-Host ""
    Write-Host "Próximo passo:" -ForegroundColor Yellow
    Write-Host "  Execute: npm run dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro ao criar o schema!" -ForegroundColor Red
    Write-Host "Verifique as mensagens de erro acima." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
