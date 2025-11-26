# 🚀 INICIAR O SISTEMA - GUIA RÁPIDO

## ⚡ Passo a Passo (2 minutos)

### 1️⃣ Abrir DOIS Terminais PowerShell

**Terminal 1 - API Backend:**
```powershell
cd c:\Users\TIDesigner\Moto
npm run dev:api
```

✅ Aguarde ver: `🚀 API rodando em http://localhost:3001`

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\TIDesigner\Moto
npm run dev
```

✅ Aguarde ver: `➜  Local:   http://localhost:3000/`

### 2️⃣ Abrir o Navegador

Acesse: **http://localhost:3000**

### 3️⃣ Fazer Login

- Email: `admin@oficina.com`
- Senha: `senha123`

---

## 🎯 OU Use o Comando Único

```powershell
npm run dev:all
```

Isso inicia TUDO de uma vez!

---

## ✅ Como Saber se Está Funcionando

### API Backend (Porta 3001)

Abra no navegador: http://localhost:3001/api/health

Deve mostrar:
```json
{"status":"ok","message":"Conectado ao PostgreSQL"}
```

### Frontend (Porta 3000)

Abra no navegador: http://localhost:3000

Deve mostrar a **tela de login**

---

## 🐛 Se a Tela Continuar Branca

1. **Abra o Console do Navegador** (F12)
2. **Veja se há erros vermelhos**
3. **Verifique se AMBOS os servidores estão rodando**

### Verificar Servidores:

```powershell
# Ver processos nas portas
Get-NetTCPConnection -LocalPort 3000,3001 | Select-Object LocalPort,State,OwningProcess
```

Deve mostrar:
- Porta 3000: LISTEN (Frontend)
- Porta 3001: LISTEN (API)

---

## 🔄 Reiniciar Tudo

Se algo der errado:

```powershell
# Parar tudo (Ctrl+C em cada terminal)

# Ou matar processos:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue

# Iniciar novamente:
npm run dev:all
```

---

## 📊 Arquitetura

```
VOCÊ → http://localhost:3000 (Frontend)
         ↓
       API REST
         ↓
http://localhost:3001 (Backend)
         ↓
       SQL
         ↓
localhost:5432 (PostgreSQL)
```

---

## ✅ Checklist Final

- [ ] PostgreSQL rodando
- [ ] API rodando (porta 3001)
- [ ] Frontend rodando (porta 3000)
- [ ] Navegador em http://localhost:3000
- [ ] Tela de login aparecendo
- [ ] Console sem erros (F12)

---

**IMPORTANTE**: Você precisa dos **DOIS servidores rodando ao mesmo tempo**!

- ❌ Só Frontend = Tela branca
- ❌ Só API = Nada acontece
- ✅ Ambos = Sistema funciona!

---

**Última atualização**: 27/10/2025 14:48
