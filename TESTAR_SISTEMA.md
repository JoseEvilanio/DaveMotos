# 🧪 Testar Sistema com PostgreSQL Local

## ✅ Sistema Configurado!

O sistema agora está usando:
- ✅ PostgreSQL local (localhost:5432)
- ✅ Autenticação JWT simples
- ✅ Tabela `users` para login
- ✅ Módulo de Clientes funcional

---

## 🚀 Como Testar

### 1. Verificar se o servidor está rodando

```bash
npm run dev
```

Deve mostrar algo como:
```
➜  Local:   http://localhost:3000/
```

### 2. Abrir o navegador

Acesse: **http://localhost:3000**

### 3. Fazer Login

Use as credenciais do usuário admin criado automaticamente:

- **Email**: `admin@oficina.com`
- **Senha**: `senha123`

### 4. Testar o Módulo de Clientes

Após fazer login:

1. Clique em **"Clientes"** no menu lateral
2. Clique em **"Novo Cliente"**
3. Preencha o formulário:
   - Nome: João Silva
   - Telefone: (11) 98765-4321
   - Email: joao@email.com
4. Clique em **"Salvar"**
5. O cliente deve aparecer na lista!

---

## 🔍 Verificar Dados no Banco

### Via psql:

```powershell
$env:PGPASSWORD="N1e2t3o4@2106"
psql -h localhost -p 5432 -U postgres -d moto
```

Depois execute:

```sql
-- Ver usuários
SELECT email, full_name, role FROM users;

-- Ver clientes
SELECT nome, telefone, email FROM clientes;

-- Ver todas as tabelas
\dt

-- Sair
\q
```

### Via Script PowerShell:

```powershell
.\testar-banco.ps1
```

---

## 🐛 Troubleshooting

### Erro: "Credenciais inválidas"

Verifique se o usuário admin existe:

```sql
SELECT * FROM users WHERE email = 'admin@oficina.com';
```

Se não existir, execute:

```sql
INSERT INTO users (email, encrypted_password, full_name, role, is_active)
VALUES (
  'admin@oficina.com',
  crypt('senha123', gen_salt('bf')),
  'Administrador',
  'admin',
  true
);
```

### Erro: "Cannot connect to database"

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais em `src/lib/pg-client.ts`
3. Teste a conexão:

```powershell
psql -h localhost -p 5432 -U postgres -d moto -c "SELECT 1"
```

### Erro no Console do Navegador

Abra o Console (F12) e veja os erros. Procure por:
- ✅ "🐘 Usando PostgreSQL local direto" - Conexão OK
- ❌ Erros de conexão - Verificar configuração

### Página em branco

1. Verifique o console do navegador (F12)
2. Veja se há erros no terminal onde o Vite está rodando
3. Tente limpar o cache: Ctrl+Shift+R

---

## 📊 Estrutura do Sistema

### Autenticação
- **Arquivo**: `src/lib/auth.ts`
- **Método**: JWT simples com bcrypt
- **Storage**: localStorage

### Conexão com Banco
- **Arquivo**: `src/lib/pg-client.ts`
- **Biblioteca**: `pg` (node-postgres)
- **Adaptador**: Simula interface do Supabase

### Módulos Implementados
- ✅ **Login** - Funcional
- ✅ **Dashboard** - Funcional (com dados do PostgreSQL)
- ✅ **Clientes** - CRUD completo
- 🚧 **Outros** - Estrutura criada, aguardando implementação

---

## 🎯 Próximos Passos

1. ✅ Testar login
2. ✅ Testar cadastro de cliente
3. ⏳ Implementar outros módulos (Veículos, Produtos, etc.)
4. ⏳ Adicionar upload de fotos
5. ⏳ Implementar relatórios

---

## 📝 Credenciais de Teste

### Banco de Dados
- Host: localhost
- Port: 5432
- Database: moto
- User: postgres
- Password: N1e2t3o4@2106

### Sistema
- Email: admin@oficina.com
- Senha: senha123
- Role: admin

---

**Última atualização**: 27/10/2025 14:35
