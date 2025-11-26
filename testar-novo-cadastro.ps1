# Script para testar cadastro de novo usuario
param(
    [string]$email = "usuario$(Get-Random -Minimum 100 -Maximum 999)@teste.com",
    [string]$nome = "Usuario Teste $(Get-Random -Minimum 100 -Maximum 999)",
    [string]$senha = "senha123",
    [string]$telefone = "11999999999"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Teste de Cadastro de Usuario" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dados do novo usuario:" -ForegroundColor Yellow
Write-Host "  Email: $email"
Write-Host "  Nome: $nome"
Write-Host "  Senha: $senha"
Write-Host "  Telefone: $telefone"
Write-Host ""

$body = @{
    email = $email
    password = $senha
    full_name = $nome
    phone = $telefone
} | ConvertTo-Json

Write-Host "Enviando requisicao para API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
    
    Write-Host ""
    Write-Host "SUCESSO! Usuario criado:" -ForegroundColor Green
    Write-Host "  ID: $($response.user.id)"
    Write-Host "  Email: $($response.user.email)"
    Write-Host "  Nome: $($response.user.full_name)"
    Write-Host "  Role: $($response.user.role)"
    Write-Host ""
    
    # Verificar no banco
    Write-Host "Verificando no banco de dados..." -ForegroundColor Yellow
    node verificar-usuarios.js
    
} catch {
    Write-Host ""
    Write-Host "ERRO ao criar usuario:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Detalhes: $($errorObj.error)" -ForegroundColor Yellow
    }
}
