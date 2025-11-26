# Consultar usuarios diretamente no PostgreSQL
$env:PGPASSWORD = "N1e2t3o4@2106"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CONSULTA DIRETA NO POSTGRESQL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Executando: SELECT * FROM users;" -ForegroundColor Yellow
Write-Host ""

psql -h localhost -p 5432 -U postgres -d moto -f consulta-usuarios.sql

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
