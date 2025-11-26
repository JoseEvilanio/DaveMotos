# 👤 Sistema de Cadastro de Usuários

## ✅ Funcionalidade Implementada!

Agora o sistema possui uma página completa de registro de novos usuários!

---

## 🎯 Como Usar

### 1. Acessar a Página de Registro

**Na tela de login**, você verá:
- Um botão **"Criar Nova Conta"** abaixo do formulário de login
- Clique nele para ir para a página de registro

Ou acesse diretamente: **http://localhost:3000/registro**

### 2. Preencher o Formulário

Campos obrigatórios:
- **Nome Completo** - Mínimo 3 caracteres
- **Email** - Deve ser um email válido
- **Telefone** - Mínimo 10 dígitos
- **Senha** - Mínimo 6 caracteres
- **Confirmar Senha** - Deve ser igual à senha

### 3. Criar a Conta

1. Preencha todos os campos
2. Clique em **"Criar Conta"**
3. Aguarde a confirmação
4. Você será redirecionado para o login
5. Faça login com as credenciais criadas

---

## 🔐 Níveis de Acesso

### Novos Usuários

Todos os usuários criados pelo formulário de registro recebem automaticamente:
- **Role**: `atendente`
- **Status**: Ativo

### Alterar Nível de Acesso

Para promover um usuário a **admin** ou **mecânico**, use o SQL:

```sql
-- Conectar ao banco
psql -h localhost -p 5432 -U postgres -d moto

-- Ver todos os usuários
SELECT id, email, full_name, role FROM users;

-- Promover para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'usuario@email.com';

-- Promover para mecânico
UPDATE users 
SET role = 'mecanico' 
WHERE email = 'usuario@email.com';

-- Voltar para atendente
UPDATE users 
SET role = 'atendente' 
WHERE email = 'usuario@email.com';
```

---

## 📊 Níveis de Acesso e Permissões

### 🔴 Admin
- Acesso total ao sistema
- Gerenciar usuários
- Configurações do sistema
- Relatórios financeiros
- Todas as funcionalidades

### 🟡 Mecânico
- Ver e editar Ordens de Serviço
- Registrar serviços executados
- Ver estoque
- Ver clientes e veículos
- Não pode acessar financeiro

### 🟢 Atendente
- Cadastrar clientes e veículos
- Criar Ordens de Serviço
- Registrar vendas
- Ver estoque
- Não pode acessar configurações

---

## 🎨 Interface da Página de Registro

A página possui:
- ✅ Design moderno e responsivo
- ✅ Validação em tempo real
- ✅ Mensagens de erro claras
- ✅ Botão "Voltar para o login"
- ✅ Feedback visual durante o cadastro
- ✅ Confirmação de senha

---

## 🔒 Segurança

### Senha
- Hash com bcrypt (10 rounds)
- Nunca armazenada em texto plano
- Validação de força mínima (6 caracteres)

### Email
- Validação de formato
- Verificação de duplicidade
- Único no sistema

### Dados
- Validação no frontend (Zod)
- Validação no backend
- Proteção contra SQL injection

---

## 🧪 Testar o Cadastro

### Passo a Passo:

1. **Acesse**: http://localhost:3000/login
2. **Clique**: "Criar Nova Conta"
3. **Preencha**:
   - Nome: João Silva
   - Email: joao@teste.com
   - Telefone: (11) 98765-4321
   - Senha: 123456
   - Confirmar Senha: 123456
4. **Clique**: "Criar Conta"
5. **Aguarde**: Mensagem de sucesso
6. **Faça login**: Com as credenciais criadas

---

## 🐛 Erros Comuns

### "Email já cadastrado"
**Causa**: O email já existe no banco de dados
**Solução**: Use outro email ou faça login com o existente

### "As senhas não coincidem"
**Causa**: Senha e confirmação diferentes
**Solução**: Digite a mesma senha nos dois campos

### "Erro ao criar conta"
**Causa**: Problema de conexão com a API
**Solução**: 
1. Verifique se a API está rodando (porta 3001)
2. Veja os logs do terminal da API
3. Teste: http://localhost:3001/api/health

---

## 📝 Endpoints da API

### POST /api/auth/register

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "full_name": "Nome Completo",
  "phone": "(11) 98765-4321"
}
```

**Response (Sucesso - 201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "full_name": "Nome Completo",
    "phone": "(11) 98765-4321",
    "role": "atendente",
    "is_active": true
  }
}
```

**Response (Erro - 400):**
```json
{
  "error": "Email já cadastrado"
}
```

---

## 🔄 Fluxo Completo

```
1. Usuário acessa /login
   ↓
2. Clica em "Criar Nova Conta"
   ↓
3. Redirecionado para /registro
   ↓
4. Preenche o formulário
   ↓
5. Clica em "Criar Conta"
   ↓
6. Frontend valida os dados (Zod)
   ↓
7. Envia POST para /api/auth/register
   ↓
8. Backend valida e cria usuário
   ↓
9. Senha é hasheada com bcrypt
   ↓
10. Usuário salvo no banco
   ↓
11. Mensagem de sucesso
   ↓
12. Redirecionado para /login
   ↓
13. Faz login com as credenciais
   ↓
14. Acessa o sistema!
```

---

## 📊 Gerenciar Usuários

### Ver todos os usuários:

```sql
SELECT 
  id,
  email,
  full_name,
  phone,
  role,
  is_active,
  created_at
FROM users
ORDER BY created_at DESC;
```

### Desativar usuário:

```sql
UPDATE users 
SET is_active = false 
WHERE email = 'usuario@email.com';
```

### Reativar usuário:

```sql
UPDATE users 
SET is_active = true 
WHERE email = 'usuario@email.com';
```

---

## 🎯 Próximas Melhorias

- [ ] Página de gerenciamento de usuários (admin)
- [ ] Recuperação de senha por email
- [ ] Verificação de email
- [ ] Avatar/foto de perfil
- [ ] Histórico de atividades do usuário
- [ ] Permissões granulares
- [ ] Autenticação de dois fatores (2FA)

---

**Sistema de cadastro 100% funcional!** 🎉

**Última atualização**: 27/10/2025 15:05
