# 🔧 Solução: Tela Branca

## ⚠️ Problema

O frontend está abrindo em branco porque:
1. A API backend não está rodando
2. O frontend não consegue se conectar à API

---

## ✅ Solução Rápida

### Opção 1: Usar o Script Automático

Execute este comando:

```powershell
.\iniciar-sistema.ps1
```

Isso abrirá **2 janelas do PowerShell**:
- Uma para a API (porta 3001)
- Uma para o Frontend (porta 3000)

### Opção 2: Iniciar Manualmente

**Terminal 1 - API Backend:**
```powershell
npm run dev:api
```

Aguarde ver: `🚀 API rodando em http://localhost:3001`

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

Aguarde ver: `➜  Local:   http://localhost:3000/`

### Opção 3: Tudo em Um Comando

```powershell
npm run dev:all
```

---

## 🔍 Verificar se Está Funcionando

### 1. Testar a API

Abra o navegador em: **http://localhost:3001/api/health**

Deve mostrar:
```json
{
  "status": "ok",
  "message": "Conectado ao PostgreSQL"
}
```

### 2. Abrir o Console do Navegador

1. Abra: **http://localhost:3000**
2. Pressione **F12** (DevTools)
3. Vá na aba **Console**

**Se estiver funcionando**, você verá:
- Nenhum erro vermelho
- A página de login deve aparecer

**Se houver erro**, você verá:
- `Failed to fetch` - A API não está rodando
- `CORS error` - Problema de configuração (já resolvido)
- Outros erros - Anote e reporte

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch" ou "Network Error"

**Causa**: A API não está rodando

**Solução**:
1. Abra um terminal
2. Execute: `npm run dev:api`
3. Aguarde ver: `🚀 API rodando em http://localhost:3001`
4. Atualize o navegador (F5)

### Erro: "Cannot GET /"

**Causa**: Você está acessando a API diretamente

**Solução**: Acesse o frontend em **http://localhost:3000** (não 3001)

### Tela continua branca

**Verificações**:

1. **API está rodando?**
   ```powershell
   # Teste no navegador:
   http://localhost:3001/api/health
   ```

2. **Frontend está rodando?**
   ```powershell
   # Deve mostrar no terminal:
   ➜  Local:   http://localhost:3000/
   ```

3. **Console do navegador tem erros?**
   - Pressione F12
   - Vá em Console
   - Veja se há erros vermelhos

4. **Portas corretas?**
   - API: 3001
   - Frontend: 3000

### Erro: "Port already in use"

**Solução**:
```powershell
# Matar processos nas portas
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force

# Reiniciar
npm run dev:all
```

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────┐
│  NAVEGADOR                      │
│  http://localhost:3000          │
│  (Você acessa aqui)             │
└────────────┬────────────────────┘
             │
             │ Faz requisições HTTP
             ▼
┌─────────────────────────────────┐
│  FRONTEND (React + Vite)        │
│  Porta: 3000                    │
│  Comando: npm run dev           │
└────────────┬────────────────────┘
             │
             │ Chama API REST
             ▼
┌─────────────────────────────────┐
│  API BACKEND (Express)          │
│  Porta: 3001                    │
│  Comando: npm run dev:api       │
└────────────┬────────────────────┘
             │
             │ Executa SQL
             ▼
┌─────────────────────────────────┐
│  POSTGRESQL                     │
│  Porta: 5432                    │
│  Database: moto                 │
└─────────────────────────────────┘
```

---

## ✅ Checklist de Inicialização

- [ ] PostgreSQL está rodando
- [ ] Banco de dados "moto" foi criado
- [ ] API Backend está rodando (porta 3001)
- [ ] Frontend está rodando (porta 3000)
- [ ] Navegador aberto em http://localhost:3000
- [ ] Console do navegador sem erros (F12)

---

## 🎯 Teste Final

Se tudo estiver correto:

1. ✅ Abra: http://localhost:3000
2. ✅ Veja a tela de login
3. ✅ Digite:
   - Email: admin@oficina.com
   - Senha: senha123
4. ✅ Clique em "Entrar"
5. ✅ Deve redirecionar para o Dashboard

---

## 📞 Ainda com Problemas?

Execute este comando e me envie a saída:

```powershell
# Verificar status de tudo
Write-Host "=== STATUS DO SISTEMA ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. PostgreSQL:" -ForegroundColor Yellow
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT 'OK' as status" 2>&1

Write-Host ""
Write-Host "2. API Backend (porta 3001):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "ERRO: API não está respondendo" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Frontend (porta 3000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Frontend não está respondendo" -ForegroundColor Red
}
```

---

**Última atualização**: 27/10/2025 14:46
