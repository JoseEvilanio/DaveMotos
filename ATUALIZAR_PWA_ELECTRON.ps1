# ============================================================================
# SCRIPT DE ATUALIZAÇÃO DO PWA NO ELECTRON
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ATUALIZADOR PWA - OFICINA MOTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Caminhos
$distPath = "C:\Users\TIDesigner\Moto\dist"
$electronPath = "C:\Users\TIDesigner\Moto\release-v3\win-unpacked\resources"
$asarPath = "$electronPath\app.asar"
$appPath = "$electronPath\app"

# Verificar se a pasta dist existe
if (-not (Test-Path $distPath)) {
    Write-Host "[ERRO] Pasta dist não encontrada!" -ForegroundColor Red
    Write-Host "Execute 'npm run build' primeiro." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[OK] Pasta dist encontrada" -ForegroundColor Green

# Verificar se precisa instalar asar
try {
    $null = Get-Command asar -ErrorAction Stop
    Write-Host "[OK] Ferramenta 'asar' encontrada" -ForegroundColor Green
}
catch {
    Write-Host "[AVISO] Ferramenta 'asar' não encontrada" -ForegroundColor Yellow
    Write-Host "Instalando asar..." -ForegroundColor Yellow
    npm install -g @electron/asar
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] asar instalado com sucesso" -ForegroundColor Green
    }
    else {
        Write-Host "[ERRO] Falha ao instalar asar" -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host ""
Write-Host "Iniciando atualização..." -ForegroundColor Cyan
Write-Host ""

# Passo 1: Fazer backup do app.asar original
if (Test-Path $asarPath) {
    $backupPath = "$asarPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "[1/6] Criando backup: $backupPath" -ForegroundColor Yellow
    Copy-Item $asarPath $backupPath
    Write-Host "[OK] Backup criado" -ForegroundColor Green
}
else {
    Write-Host "[AVISO] app.asar não encontrado, pulando backup" -ForegroundColor Yellow
}

# Passo 2: Extrair app.asar
Write-Host "[2/6] Extraindo app.asar..." -ForegroundColor Yellow
if (Test-Path $appPath) {
    Remove-Item -Recurse -Force $appPath
}
asar extract $asarPath $appPath
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Extração concluída" -ForegroundColor Green
}
else {
    Write-Host "[ERRO] Falha ao extrair app.asar" -ForegroundColor Red
    pause
    exit 1
}

# Passo 3: Atualizar arquivos do dist
Write-Host "[3/6] Atualizando arquivos do PWA..." -ForegroundColor Yellow
$targetDistPath = "$appPath\dist"
if (Test-Path $targetDistPath) {
    Remove-Item -Recurse -Force $targetDistPath
}
Copy-Item -Recurse $distPath $targetDistPath
Write-Host "[OK] Arquivos PWA atualizados" -ForegroundColor Green

# Passo 3.5: Copiar electron/package.json para garantir CommonJS
Write-Host "[4/6] Atualizando electron/package.json..." -ForegroundColor Yellow
$electronPkgSource = "C:\Users\TIDesigner\Moto\electron\package.json"
$electronPkgTarget = "$appPath\electron\package.json"
if (Test-Path $electronPkgSource) {
    $electronDir = "$appPath\electron"
    if (-not (Test-Path $electronDir)) {
        New-Item -ItemType Directory -Path $electronDir -Force | Out-Null
    }
    Copy-Item $electronPkgSource $electronPkgTarget -Force
    Write-Host "[OK] electron/package.json atualizado" -ForegroundColor Green
}
else {
    Write-Host "[AVISO] electron/package.json não encontrado, pulando" -ForegroundColor Yellow
}

# Passo 4: Reempacotar app.asar
Write-Host "[5/6] Reempacotando app.asar..." -ForegroundColor Yellow
if (Test-Path $asarPath) {
    Remove-Item -Force $asarPath
}
asar pack $appPath $asarPath
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Reempacotamento concluído" -ForegroundColor Green
}
else {
    Write-Host "[ERRO] Falha ao reempacotar app.asar" -ForegroundColor Red
    pause
    exit 1
}

# Passo 5: Limpar pasta temporária
Write-Host "[6/6] Limpando arquivos temporários..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $appPath
Write-Host "[OK] Limpeza concluída" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Você pode executar o aplicativo em:" -ForegroundColor White
Write-Host "C:\Users\TIDesigner\Moto\release-v3\win-unpacked\Sistema de Oficina de Motos.exe" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backups anteriores foram salvos em:" -ForegroundColor White
Write-Host "$electronPath\app.asar.backup-*" -ForegroundColor Yellow
Write-Host ""

pause
