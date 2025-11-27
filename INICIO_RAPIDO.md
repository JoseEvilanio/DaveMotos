# 🚀 INÍCIO RÁPIDO - DaveMotos PWA

## ⚡ 3 Passos para Começar

### 1️⃣ Configure o Supabase (5 minutos)

```bash
# 1. Acesse: https://supabase.com
# 2. Crie um projeto (grátis)
# 3. Copie URL e anon key
# 4. Cole no arquivo .env
```

**Edite o arquivo `.env`**:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

---

### 2️⃣ Crie as Tabelas (2 minutos)

1. **No Supabase**, vá em: **SQL Editor**
2. **Cole** o conteúdo de: `supabase/migrations/001_initial_schema.sql`
3. **Execute** (Ctrl+Enter)

---

### 3️⃣ Inicie o Sistema (1 minuto)

```bash
# Instalar dependências (primeira vez)
npm install

# Iniciar o sistema
npm run dev
```

**Abra**: http://localhost:3000

---

## 🔐 Login Padrão

Após criar um usuário no Supabase:

```
Email: seu-email@exemplo.com
Senha: sua-senha
```

---

## 📚 Documentação Completa

- **Configuração detalhada**: `CONFIGURAR_SUPABASE.md`
- **Correções aplicadas**: `CORRECOES_SUPABASE.md`
- **Guia de uso**: `README.md`

---

## ✅ Checklist Rápido

- [ ] Projeto Supabase criado
- [ ] `.env` configurado
- [ ] Tabelas criadas (SQL executado)
- [ ] Usuário criado no Supabase
- [ ] `npm install` executado
- [ ] `npm run dev` rodando
- [ ] Login funcionando

---

## 🐛 Problemas?

### ❌ "Invalid API key"
→ Verifique o `.env`

### ❌ "relation does not exist"
→ Execute o SQL de criação das tabelas

### ❌ "Invalid login credentials"
→ Crie um usuário no Supabase (Authentication > Users)

---

## 🎉 Pronto!

**Sistema rodando em**: http://localhost:3000

**Bom uso!** 🏍️✨
