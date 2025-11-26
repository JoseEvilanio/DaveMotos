# Script para criar o arquivo .env
# Execute este script no PowerShell

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Configuração do Supabase" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar URL do Supabase
Write-Host "1. Acesse: https://supabase.com" -ForegroundColor Yellow
Write-Host "2. Crie um projeto (se ainda não tiver)" -ForegroundColor Yellow
Write-Host "3. Vá em Settings > API" -ForegroundColor Yellow
Write-Host ""

$supabaseUrl = Read-Host "Cole aqui a Project URL (ex: https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "Cole aqui a anon/public key (começa com eyJ...)"

# Criar conteúdo do arquivo .env
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
"@

# Salvar arquivo .env
$envPath = Join-Path $PSScriptRoot ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute o schema SQL no Supabase (SQL Editor)" -ForegroundColor White
Write-Host "   Arquivo: supabase/schema.sql" -ForegroundColor Gray
Write-Host "2. Reinicie o servidor: npm run dev" -ForegroundColor White
Write-Host ""
