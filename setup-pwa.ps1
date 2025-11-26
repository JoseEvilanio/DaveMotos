# =====================================================
# Script de Instalação - Sistema PWA Oficina de Motos
# =====================================================

Write-Host "🏍️  Sistema PWA - Oficina de Motos" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📋 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   Instale Node.js 18+ de: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "📋 Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos)" -ForegroundColor Gray
Write-Host ""

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}

# Verificar arquivo .env
Write-Host ""
Write-Host "🔧 Verificando configuração..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo .env não encontrado" -ForegroundColor Yellow
    Write-Host ""
    
    $createEnv = Read-Host "   Deseja criar o arquivo .env agora? (S/N)"
    
    if ($createEnv -eq "S" -or $createEnv -eq "s") {
        Write-Host ""
        Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
        Write-Host ""
        
        $supabaseUrl = Read-Host "   Digite a URL do Supabase"
        $supabaseKey = Read-Host "   Digite a Anon Key do Supabase"
        
        $envContent = @"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host ""
        Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Lembre-se de criar o arquivo .env antes de iniciar o sistema" -ForegroundColor Yellow
        Write-Host "   Use o arquivo .env.example como referência" -ForegroundColor Gray
    }
}

# Verificar migrations
Write-Host ""
Write-Host "📊 Verificando migrations do banco de dados..." -ForegroundColor Yellow

if (Test-Path "supabase/migrations/001_initial_schema.sql") {
    Write-Host "✅ Migration encontrada" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Execute a migration no Supabase!" -ForegroundColor Yellow
    Write-Host "   1. Acesse o SQL Editor no dashboard do Supabase" -ForegroundColor Gray
    Write-Host "   2. Copie o conteúdo de: supabase/migrations/001_initial_schema.sql" -ForegroundColor Gray
    Write-Host "   3. Execute o script completo" -ForegroundColor Gray
} else {
    Write-Host "❌ Migration não encontrada!" -ForegroundColor Red
}

# Criar diretório de ícones se não existir
if (-not (Test-Path "public/icons")) {
    New-Item -ItemType Directory -Path "public/icons" -Force | Out-Null
    Write-Host ""
    Write-Host "📁 Diretório public/icons criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Instalação concluída!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure o arquivo .env (se ainda não fez)" -ForegroundColor White
Write-Host "2. Execute as migrations no Supabase" -ForegroundColor White
Write-Host "3. Adicione os ícones em public/icons/" -ForegroundColor White
Write-Host "4. Inicie o sistema: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentação completa: GUIA_PWA_COMPLETO.md" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Deseja iniciar o sistema agora? (S/N)"

if ($startNow -eq "S" -or $startNow -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando sistema..." -ForegroundColor Green
    Write-Host ""
    npm run dev
}
