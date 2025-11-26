# Diagnostico completo do banco de dados
$env:PGPASSWORD = "N1e2t3o4@2106"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Diagnostico do Banco de Dados" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar conexao com o banco
Write-Host "1. Verificando conexao com o banco 'moto'..." -ForegroundColor Yellow
$testConnection = psql -h localhost -p 5432 -U postgres -d moto -c "SELECT current_database(), current_user;" -t 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Conectado ao banco 'moto'" -ForegroundColor Green
} else {
    Write-Host "   ERRO: Nao foi possivel conectar" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Contar usuarios
Write-Host "2. Contando usuarios na tabela 'users'..." -ForegroundColor Yellow
$countResult = psql -h localhost -p 5432 -U postgres -d moto -c "SELECT COUNT(*) as total FROM users;" -t
Write-Host "   Total de usuarios: $($countResult.Trim())" -ForegroundColor White
Write-Host ""

# 3. Listar todos os usuarios
Write-Host "3. Listando TODOS os usuarios:" -ForegroundColor Yellow
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC;"
Write-Host ""

# 4. Verificar se ha transacoes pendentes
Write-Host "4. Verificando transacoes ativas..." -ForegroundColor Yellow
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT pid, state, query_start, state_change FROM pg_stat_activity WHERE datname = 'moto' AND state != 'idle';"
Write-Host ""

# 5. Verificar se ha outros bancos com nome similar
Write-Host "5. Verificando bancos de dados existentes..." -ForegroundColor Yellow
psql -h localhost -p 5432 -U postgres -c "SELECT datname FROM pg_database WHERE datname LIKE '%moto%' OR datname LIKE '%oficina%';"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Diagnostico concluido!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
