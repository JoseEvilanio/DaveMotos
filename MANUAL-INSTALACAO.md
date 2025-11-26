# 🏍️ Manual de Instalação - Sistema de Oficina de Motos

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação no Windows](#instalação-no-windows)
3. [Instalação no Linux](#instalação-no-linux)
4. [Instalação no macOS](#instalação-no-macos)
5. [Primeiro Uso](#primeiro-uso)
6. [Solução de Problemas](#solução-de-problemas)
7. [Atualizações](#atualizações)
8. [Desinstalação](#desinstalação)

---

## 🖥️ Requisitos do Sistema

### Mínimos
- **Sistema Operacional**: Windows 10/11, Linux (Ubuntu 20.04+), macOS 10.15+
- **Processador**: Intel Core i3 ou equivalente
- **Memória RAM**: 4 GB
- **Espaço em Disco**: 500 MB livres
- **Navegador**: Chrome, Edge, Firefox ou Safari (versão recente)

### Software Necessário
- **Node.js** versão 18 ou superior
- **PostgreSQL** versão 14 ou superior

---

## 🪟 Instalação no Windows

### Passo 1: Instalar Requisitos

#### Node.js
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Clique em "Next" até concluir
5. Reinicie o computador se solicitado

#### PostgreSQL
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador
3. Execute e siga as instruções
4. **IMPORTANTE**: Anote a senha do usuário `postgres`
5. Mantenha a porta padrão `5432`

### Passo 2: Preparar o Banco de Dados

1. Abra o **pgAdmin** (instalado com PostgreSQL)
2. Conecte-se ao servidor local
3. Clique com botão direito em "Databases" → "Create" → "Database"
4. Nome: `moto`
5. Clique em "Save"
6. Abra o banco `moto` → "Query Tool"
7. Execute os scripts SQL na ordem:
   - `database/schema-local.sql`
   - `database/seed-data.sql` (opcional - dados de exemplo)

### Passo 3: Instalar o Sistema

1. **Extraia** o arquivo ZIP do sistema para uma pasta (ex: `C:\SistemaOficina`)
2. **Clique duas vezes** em `instalar.bat`
3. Aguarde a instalação concluir
4. Um atalho será criado na **Área de Trabalho**

### Passo 4: Iniciar o Sistema

**Opção 1** (Recomendada):
- Clique duas vezes no atalho **"Sistema Oficina Motos"** na área de trabalho

**Opção 2**:
- Abra a pasta do sistema
- Clique duas vezes em `start-sistema.bat`

**O que acontece**:
1. Uma janela preta abrirá (console)
2. O sistema iniciará automaticamente
3. Seu navegador padrão abrirá com o sistema
4. **NÃO FECHE** a janela preta enquanto usar o sistema!

### Passo 5: Parar o Sistema

**Opção 1**:
- Feche a janela preta do console

**Opção 2**:
- Clique duas vezes em `stop-sistema.bat`

---

## 🐧 Instalação no Linux

### Passo 1: Instalar Requisitos

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib

# Fedora
sudo dnf install nodejs npm postgresql postgresql-server

# Arch Linux
sudo pacman -S nodejs npm postgresql
```

### Passo 2: Configurar PostgreSQL

```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE moto;
\q

# Executar scripts SQL
sudo -u postgres psql -d moto -f database/schema-local.sql
sudo -u postgres psql -d moto -f database/seed-data.sql
```

### Passo 3: Instalar o Sistema

```bash
# Extrair o sistema
unzip sistema-oficina-motos.zip
cd sistema-oficina-motos

# Dar permissão de execução
chmod +x start-sistema.sh
chmod +x instalar.sh

# Instalar dependências
./instalar.sh
```

### Passo 4: Iniciar o Sistema

```bash
./start-sistema.sh
```

O navegador abrirá automaticamente em `http://localhost:3000`

### Passo 5: Parar o Sistema

Pressione `Ctrl+C` no terminal

---

## 🍎 Instalação no macOS

### Passo 1: Instalar Requisitos

#### Homebrew (se não tiver)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Node.js e PostgreSQL
```bash
brew install node postgresql@14
brew services start postgresql@14
```

### Passo 2: Configurar PostgreSQL

```bash
# Criar banco de dados
createdb moto

# Executar scripts SQL
psql -d moto -f database/schema-local.sql
psql -d moto -f database/seed-data.sql
```

### Passo 3: Instalar o Sistema

```bash
# Extrair e entrar na pasta
unzip sistema-oficina-motos.zip
cd sistema-oficina-motos

# Dar permissão
chmod +x start-sistema.sh

# Instalar
npm install
```

### Passo 4: Iniciar o Sistema

```bash
./start-sistema.sh
```

### Passo 5: Parar o Sistema

Pressione `Ctrl+C` no terminal

---

## 🚀 Primeiro Uso

### Acessar o Sistema

1. O navegador abrirá automaticamente em: `http://localhost:3000`
2. Se não abrir, digite manualmente no navegador

### Login Padrão

```
Usuário: admin
Senha: admin123
```

**⚠️ IMPORTANTE**: Altere a senha padrão após o primeiro acesso!

### Navegação

- **Dashboard**: Visão geral do sistema
- **Ordens de Serviço**: Gerenciar OS
- **Clientes**: Cadastro de clientes
- **Veículos**: Cadastro de motos
- **Produtos**: Estoque de peças
- **Financeiro**: Contas a pagar/receber
- **Configurações**: Ajustes do sistema

---

## 🔧 Solução de Problemas

### Problema: "Node.js não encontrado"

**Solução**:
1. Instale o Node.js: https://nodejs.org/
2. Reinicie o computador
3. Tente novamente

### Problema: "Erro ao conectar ao banco"

**Solução**:
1. Verifique se o PostgreSQL está rodando:
   - **Windows**: Abra "Serviços" e procure por "postgresql"
   - **Linux**: `sudo systemctl status postgresql`
   - **macOS**: `brew services list`
2. Verifique se o banco `moto` existe
3. Verifique as credenciais em `server/index.ts`

### Problema: "Porta já em uso"

**Solução**:
1. Outra instância do sistema está rodando
2. Execute `stop-sistema.bat` (Windows) ou pressione Ctrl+C (Linux/Mac)
3. Aguarde 10 segundos
4. Tente iniciar novamente

### Problema: "Página não carrega"

**Solução**:
1. Aguarde 30 segundos após iniciar
2. Atualize a página (F5)
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Tente outro navegador

### Problema: "Erro 404 nas requisições"

**Solução**:
1. Verifique se o backend está rodando (porta 3001)
2. Abra: `http://localhost:3001/api/health`
3. Deve mostrar: `{"status":"ok"}`
4. Se não funcionar, reinicie o sistema

---

## 🔄 Atualizações

### Como Atualizar

1. **Faça backup** do banco de dados:
   ```bash
   # Windows (PowerShell)
   pg_dump -U postgres moto > backup_moto.sql
   
   # Linux/Mac
   pg_dump moto > backup_moto.sql
   ```

2. **Pare o sistema** completamente

3. **Substitua os arquivos**:
   - Extraia a nova versão
   - Copie sobre a pasta antiga
   - **NÃO substitua** a pasta `database/` se tiver dados importantes

4. **Execute** o instalador novamente:
   - Windows: `instalar.bat`
   - Linux/Mac: `./instalar.sh`

5. **Inicie o sistema** normalmente

### Verificar Versão

Abra o sistema e vá em **Configurações** → **Sobre**

---

## 🗑️ Desinstalação

### Windows

1. Pare o sistema (`stop-sistema.bat`)
2. Delete a pasta do sistema
3. Delete o atalho da área de trabalho
4. (Opcional) Desinstale Node.js e PostgreSQL pelo Painel de Controle

### Linux/Mac

```bash
# Parar o sistema
./stop-sistema.sh

# Remover pasta
cd ..
rm -rf sistema-oficina-motos

# (Opcional) Remover banco de dados
dropdb moto
```

---

## 📞 Suporte

### Logs do Sistema

Os logs ficam em:
- `logs/backend.log` - Erros do servidor
- `logs/frontend.log` - Erros da interface

### Contato

- **Email**: suporte@oficinamotos.com
- **Telefone**: (11) 1234-5678
- **WhatsApp**: (11) 91234-5678

---

## 📝 Notas Importantes

### Segurança

- ✅ O sistema roda **localmente** no seu computador
- ✅ Nenhum dado é enviado para a internet
- ✅ Faça **backups regulares** do banco de dados
- ⚠️ Altere as senhas padrão
- ⚠️ Não compartilhe o acesso ao banco de dados

### Performance

- O sistema é otimizado para até **1000 ordens de serviço** simultâneas
- Recomenda-se **limpar dados antigos** periodicamente
- Faça **backup antes de grandes operações**

### Compatibilidade

- ✅ Funciona **offline** (sem internet)
- ✅ Pode ser usado em **múltiplos computadores** (com banco compartilhado)
- ✅ Compatível com **impressoras térmicas** para OS

---

## 🎯 Checklist de Instalação

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `moto` criado
- [ ] Scripts SQL executados
- [ ] Dependências instaladas (`npm install`)
- [ ] Sistema inicia sem erros
- [ ] Navegador abre automaticamente
- [ ] Login funciona
- [ ] Todas as páginas carregam

**Se todos os itens estão marcados, a instalação foi bem-sucedida!** ✅

---

## 🏍️ Bom Uso!

Agora você está pronto para usar o **Sistema de Oficina de Motos**!

Para qualquer dúvida, consulte este manual ou entre em contato com o suporte.

**Desenvolvido com ❤️ para oficinas de motos**
