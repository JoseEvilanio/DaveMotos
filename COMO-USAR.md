# 🚀 Como Usar o Sistema

## 1️⃣ Iniciar o Backend

**Abra um terminal** e execute:

```bash
cd c:\Users\TIDesigner\Moto
npm run dev:api
```

Aguarde ver:
```
🚀 API rodando em http://localhost:3001
🐘 Conectado ao PostgreSQL
```

## 2️⃣ Iniciar o Electron

**Com o backend rodando**, execute o sistema:

```bash
cd release\win-unpacked
start "Sistema Oficina Motos.exe"
```

## 3️⃣ Fazer Login

Na tela de login, você pode usar:

### Opção 1: Username
- Email: `admin`
- Senha: `admin123`

### Opção 2: Email Completo
- Email: `admin@oficina.com` (ou qualquer email cadastrado)
- Senha: `admin123`

### Como Funciona
- **Se digitar sem @**: Sistema busca por username
- **Se digitar com @**: Sistema busca por email

---

## ✅ Sistema Funcionando!

Após o login, você terá acesso a:

- 📊 **Dashboard** - Visão geral
- 👥 **Clientes** - Cadastro de clientes
- 🏍️ **Veículos** - Cadastro de motos
- 🔧 **Ordens de Serviço** - Gestão de OS
- 📦 **Produtos** - Estoque de peças
- 💰 **Financeiro** - Contas a pagar/receber
- 📈 **Relatórios** - Análises e gráficos

---

## 🐛 Problemas Comuns

### Erro: "Failed to fetch"
**Backend não está rodando!**

Solução:
```bash
npm run dev:api
```

### Erro: "Credenciais inválidas"
**Senha incorreta ou usuário não existe**

Solução:
- Verifique se digitou `admin` / `admin123`
- Ou use um email cadastrado no banco

### Tela Branca
**Arquivos não carregaram**

Solução:
```bash
# Rebuild
npm run build
xcopy dist release\win-unpacked\resources\app\dist\ /E /I /Y
```

---

## 💡 Dicas

### Manter Backend Rodando
Deixe o terminal do backend aberto enquanto usa o sistema.

### Múltiplas Janelas
Você pode abrir várias janelas do Electron (cada uma conecta ao mesmo backend).

### Desenvolvimento
Para desenvolver, use:
```bash
# Terminal 1: Backend
npm run dev:api

# Terminal 2: Frontend
npm run dev

# Abra: http://localhost:3000
```

---

## 🎯 Usuários Padrão

| Username | Email | Senha | Perfil |
|----------|-------|-------|--------|
| admin | admin@oficina.com | admin123 | Administrador |

---

## 📝 Criar Novo Usuário

### Via Interface (Registro)
1. Clique em "Criar Nova Conta"
2. Preencha os dados
3. Faça login

### Via SQL (Direto no Banco)
```sql
INSERT INTO users (email, encrypted_password, full_name, role, is_active)
VALUES (
  'novo@email.com',
  '$2a$10$...', -- Hash da senha
  'Nome Completo',
  'admin',
  true
);
```

---

## 🔐 Segurança

- ✅ Senhas são criptografadas (bcrypt)
- ✅ Token de autenticação
- ✅ Validação de credenciais
- ⚠️ **Mude a senha padrão em produção!**

---

## 🎊 Pronto!

**Sistema está funcionando!**

Qualquer dúvida, consulte:
- `CORRECAO-FINAL.md` - Correções aplicadas
- `SISTEMA-RESTAURADO.md` - Mudanças no código
- `GUIA-PRODUCAO.md` - Como distribuir

**Bom uso!** 🏍️✨
