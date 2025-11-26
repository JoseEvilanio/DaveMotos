# Script para testar a conexão com o banco de dados

$env:PGPASSWORD = "N1e2t3o4@2106"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Testar Banco de Dados" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testando conexão com PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

# Teste 1: Listar tabelas
Write-Host "1. Listando tabelas criadas:" -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

Write-Host ""

# Teste 2: Contar registros em users
Write-Host "2. Verificando usuário admin:" -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT email, full_name, role FROM users;"

Write-Host ""

# Teste 3: Ver configurações
Write-Host "3. Verificando configurações:" -ForegroundColor Cyan
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT chave, valor FROM configuracoes LIMIT 5;"

Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  ✓ Banco funcionando!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximo passo:" -ForegroundColor Yellow
    Write-Host "  1. Certifique-se de que o arquivo .env está configurado" -ForegroundColor White
    Write-Host "  2. Execute: npm run dev" -ForegroundColor White
    Write-Host "  3. Acesse: http://localhost:3002" -ForegroundColor White
    Write-Host "  4. Login: admin@oficina.com / senha123" -ForegroundColor White
} else {
    Write-Host "❌ Erro ao conectar ao banco!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
