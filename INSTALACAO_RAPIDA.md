# ⚡ Instalação Rápida - 5 Minutos

## 🎯 Passo a Passo

### 1️⃣ Instalar Dependências (2 min)

```powershell
# Execute o script automático
.\setup-pwa.ps1
```

**OU manualmente:**

```bash
npm install
```

### 2️⃣ Configurar Supabase (2 min)

#### A. Criar Projeto Supabase

1. Acesse: https://supabase.com
2. Clique em "New Project"
3. Preencha os dados e crie

#### B. Copiar Credenciais

1. Vá em: **Project Settings** > **API**
2. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: `eyJhbGc...`

#### C. Criar arquivo .env

```bash
# Crie o arquivo .env na raiz do projeto
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
```

### 3️⃣ Executar Migrations (1 min)

1. No Supabase, vá em: **SQL Editor**
2. Copie TODO o conteúdo de: `supabase/migrations/001_initial_schema.sql`
3. Cole no editor e clique em **RUN**
4. Aguarde a execução (pode levar 30 segundos)

### 4️⃣ Iniciar Sistema

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5️⃣ Criar Primeiro Usuário

1. Na tela de login, clique em "Registrar"
2. Preencha os dados e crie sua conta
3. Volte ao Supabase SQL Editor e execute:

```sql
-- Promover usuário para admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1);
```

## ✅ Pronto!

Seu sistema está funcionando! 🎉

## 🚀 Próximos Passos

1. **Adicionar Ícones PWA**
   - Coloque ícones em `public/icons/`
   - Veja `public/icons/README.md` para tamanhos

2. **Personalizar**
   - Edite cores em `tailwind.config.js`
   - Ajuste nome em `vite.config.ts`

3. **Deploy**
   - Siga `CHECKLIST_DEPLOY.md`
   - Use Netlify ou Vercel

## 📚 Documentação

- **Guia Completo**: `GUIA_PWA_COMPLETO.md`
- **Checklist Deploy**: `CHECKLIST_DEPLOY.md`
- **Status do Sistema**: `SISTEMA_PWA_PRONTO.md`

## 🆘 Problemas?

### Erro ao instalar dependências

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro ao conectar Supabase

- Verifique se o `.env` está correto
- Confirme que as migrations foram executadas
- Teste a conexão no dashboard do Supabase

### Service Worker não registra

- Use HTTPS ou localhost
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique o console para erros

## 💡 Dicas

- Use Chrome/Edge para melhor experiência PWA
- Teste offline após carregar a primeira vez
- Instale como app para melhor performance

---

**Tempo total: ~5 minutos** ⏱️

**Dificuldade: Fácil** ✅

**Pronto para produção!** 🚀
