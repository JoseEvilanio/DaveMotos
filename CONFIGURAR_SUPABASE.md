# 🔧 Como Configurar o Supabase para o Sistema DaveMotos

## 📋 Passo a Passo

### 1️⃣ Criar Projeto no Supabase (GRÁTIS)

1. **Acesse**: https://supabase.com
2. **Clique em**: "Start your project"
3. **Faça login** com GitHub (ou crie uma conta)
4. **Clique em**: "New Project"
5. **Preencha os dados**:
   - **Name**: `DaveMotos`
   - **Database Password**: Escolha uma senha forte (anote!)
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan**: `Free` (grátis para sempre)
6. **Clique em**: "Create new project"
7. **Aguarde** 2-3 minutos enquanto o projeto é criado

---

### 2️⃣ Obter as Credenciais

Após o projeto ser criado:

1. **No painel do Supabase**, vá em: **Settings** > **API**
2. **Copie as seguintes informações**:

   - **Project URL**: 
     ```
     https://xyzcompany.supabase.co
     ```
   
   - **anon public** (chave pública):
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

⚠️ **IMPORTANTE**: 
- **NÃO copie** a `service_role` key (essa é secreta!)
- Use apenas a **anon public** key

---

### 3️⃣ Configurar o Arquivo `.env`

1. **Abra o arquivo** `.env` na raiz do projeto
2. **Substitua** os valores:

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Salve o arquivo**

---

### 4️⃣ Criar as Tabelas no Banco de Dados

1. **No painel do Supabase**, vá em: **SQL Editor**
2. **Clique em**: "New query"
3. **Cole o conteúdo** do arquivo: `supabase/migrations/001_initial_schema.sql`
4. **Clique em**: "Run" (ou pressione `Ctrl+Enter`)
5. **Aguarde** a confirmação de sucesso

---

### 5️⃣ Configurar Row Level Security (RLS)

O RLS garante que os usuários só acessem seus próprios dados.

1. **No SQL Editor**, execute o seguinte script:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mecanicos ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (usuários podem ver e editar seu próprio perfil)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para clientes (todos os usuários autenticados podem acessar)
CREATE POLICY "Authenticated users can view clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clientes" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clientes" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete clientes" ON clientes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Repita para as outras tabelas (veiculos, ordens_servico, produtos, servicos, mecanicos)
-- Ou use: FOR ALL USING (auth.role() = 'authenticated');
```

---

### 6️⃣ Criar Usuário Administrador

1. **No painel do Supabase**, vá em: **Authentication** > **Users**
2. **Clique em**: "Add user" > "Create new user"
3. **Preencha**:
   - **Email**: `jose_evilanio@hotmail.com` (ou seu email)
   - **Password**: Escolha uma senha
   - **Auto Confirm User**: ✅ (marque)
4. **Clique em**: "Create user"

5. **Criar perfil do usuário** (no SQL Editor):

```sql
INSERT INTO profiles (id, full_name, role)
VALUES (
  'cole-aqui-o-id-do-usuario',
  'José Evilânio',
  'admin'
);
```

Para obter o ID do usuário:
- Vá em **Authentication** > **Users**
- Clique no usuário criado
- Copie o **UUID** (ID)

---

### 7️⃣ Testar a Conexão

1. **No terminal**, execute:
   ```bash
   npm run dev
   ```

2. **Abra o navegador** em: `http://localhost:3000`

3. **Faça login** com:
   - Email: `jose_evilanio@hotmail.com`
   - Senha: (a que você criou)

4. **Verifique** se não há mais erros de conexão!

---

## ✅ Checklist de Verificação

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas para `.env`
- [ ] Tabelas criadas no banco de dados
- [ ] RLS habilitado e políticas configuradas
- [ ] Usuário administrador criado
- [ ] Perfil do usuário inserido
- [ ] Sistema rodando sem erros
- [ ] Login funcionando

---

## 🐛 Problemas Comuns

### ❌ "Invalid API key"
**Solução**: Verifique se copiou a **anon public** key corretamente no `.env`

### ❌ "relation does not exist"
**Solução**: Execute o script SQL de criação das tabelas

### ❌ "new row violates row-level security policy"
**Solução**: Configure as políticas RLS conforme o passo 5

### ❌ "Invalid login credentials"
**Solução**: 
- Verifique se o usuário foi criado
- Verifique se marcou "Auto Confirm User"
- Tente resetar a senha

---

## 📚 Recursos Úteis

- **Documentação Supabase**: https://supabase.com/docs
- **SQL Editor**: https://supabase.com/dashboard/project/_/sql
- **Gerenciar Usuários**: https://supabase.com/dashboard/project/_/auth/users
- **Visualizar Tabelas**: https://supabase.com/dashboard/project/_/editor

---

## 🎉 Pronto!

Após seguir todos os passos, seu sistema estará **100% funcional** usando o Supabase como backend!

**Vantagens**:
- ✅ Sem necessidade de servidor Node.js local
- ✅ Banco de dados PostgreSQL gerenciado
- ✅ Autenticação segura
- ✅ Backup automático
- ✅ Grátis até 500MB de dados
- ✅ Funciona de qualquer lugar

**Bom uso!** 🏍️✨
