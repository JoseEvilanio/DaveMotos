# Ver usuarios diretamente no PostgreSQL (sem pager)
$env:PGPASSWORD = "N1e2t3o4@2106"
$env:PAGER = ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "USUARIOS NO POSTGRESQL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Query simples
$query = "SELECT email, full_name, role, is_active, to_char(created_at, 'DD/MM/YYYY HH24:MI:SS') as criado FROM users ORDER BY created_at DESC;"

Write-Host "Consultando tabela users..." -ForegroundColor Yellow
Write-Host ""

psql -h localhost -p 5432 -U postgres -d moto -c $query

Write-Host ""
Write-Host "Total de registros:" -ForegroundColor Yellow
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT COUNT(*) as total FROM users;" -t

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
