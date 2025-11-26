# Testar endpoint de registro
$body = @{
    email = 'teste@exemplo.com'
    password = 'senha123'
    full_name = 'Usuario Teste'
    phone = '11999999999'
} | ConvertTo-Json

Write-Host "Testando registro de novo usuario..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "SUCESSO! Usuario criado:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "ERRO ao criar usuario:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalhes:" $_.ErrorDetails.Message
    }
}
