# Script para copiar o schema SQL para a área de transferência
# Execute este script e depois cole no SQL Editor do Supabase

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Executar Schema SQL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$schemaPath = Join-Path $PSScriptRoot "supabase\schema.sql"

if (Test-Path $schemaPath) {
    # Ler o conteúdo do arquivo
    $schemaContent = Get-Content $schemaPath -Raw
    
    # Copiar para a área de transferência
    Set-Clipboard -Value $schemaContent
    
    Write-Host "✅ Schema SQL copiado para a área de transferência!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard/project/axichcfsgzvzilrnowjl" -ForegroundColor White
    Write-Host "2. Clique em 'SQL Editor' no menu lateral" -ForegroundColor White
    Write-Host "3. Clique em 'New query'" -ForegroundColor White
    Write-Host "4. Cole o conteúdo (Ctrl+V)" -ForegroundColor White
    Write-Host "5. Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "Pressione qualquer tecla para abrir o Supabase no navegador..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Abrir o navegador
    Start-Process "https://supabase.com/dashboard/project/axichcfsgzvzilrnowjl/editor"
    
} else {
    Write-Host "❌ Erro: Arquivo schema.sql não encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $schemaPath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
