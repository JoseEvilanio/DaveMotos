# 🔄 Reiniciar a API

## ⚠️ Problema

O endpoint `/api/auth/register` retorna 404 porque a API precisa ser reiniciada para carregar as novas rotas.

---

## ✅ Solução Rápida

### Passo 1: Parar a API

No terminal onde a API está rodando:
1. Pressione **Ctrl+C**
2. Aguarde parar completamente

### Passo 2: Iniciar novamente

```powershell
npm run dev:api
```

Aguarde ver:
```
🚀 API rodando em http://localhost:3001
🐘 Conectado ao PostgreSQL
```

### Passo 3: Testar

Abra no navegador: http://localhost:3001/api/health

Deve mostrar:
```json
{"status":"ok","message":"Conectado ao PostgreSQL"}
```

---

## 🚀 Ou Reinicie Tudo de Uma Vez

Se você estiver usando `npm run dev:all`:

1. **Pare tudo**: Pressione **Ctrl+C** no terminal
2. **Inicie novamente**:
   ```powershell
   npm run dev:all
   ```

---

## ✅ Verificar se Funcionou

### Teste 1: Health Check
```
http://localhost:3001/api/health
```

### Teste 2: Criar Conta

1. Acesse: http://localhost:3000/registro
2. Preencha o formulário
3. Clique em "Criar Conta"
4. Deve funcionar agora!

---

## 🐛 Se Ainda Não Funcionar

### Verificar se a API está rodando:

```powershell
# Ver processos na porta 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```

Se não mostrar nada, a API não está rodando!

### Verificar logs da API:

Olhe no terminal da API se há algum erro ao iniciar.

### Testar manualmente com curl:

```powershell
curl http://localhost:3001/api/health
```

---

## 📝 Comandos Úteis

```powershell
# Ver o que está rodando nas portas
Get-NetTCPConnection -LocalPort 3000,3001 | Select-Object LocalPort,State

# Matar processo na porta 3001
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force

# Matar processo na porta 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Reiniciar tudo
npm run dev:all
```

---

**Reinicie a API e teste novamente!** 🚀
