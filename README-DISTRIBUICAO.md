# 🏍️ Sistema de Oficina de Motos - Versão 1.0.0

## 📦 Conteúdo do Pacote

Este pacote contém:

- ✅ **Instalador do Sistema** (`Sistema Oficina Motos Setup 1.0.0.exe`)
- ✅ **Scripts de Banco de Dados** (pasta `database/`)
- ✅ **Script de Preparação** (`preparar-cliente.bat`)
- ✅ **Manual de Instalação** (`MANUAL-INSTALACAO.pdf`)
- ✅ **Este arquivo** (`README.txt`)

---

## 🚀 Instalação Rápida (3 Passos)

### 1️⃣ Instalar PostgreSQL

**Download**: https://www.postgresql.org/download/windows/

- Execute o instalador
- Anote a senha do usuário `postgres`
- Mantenha a porta padrão `5432`

### 2️⃣ Preparar Ambiente

Execute: `preparar-cliente.bat`

Este script irá:
- Verificar se PostgreSQL está instalado
- Criar o banco de dados `moto`
- Executar os scripts SQL

### 3️⃣ Instalar o Sistema

Execute: `Sistema Oficina Motos Setup 1.0.0.exe`

- Siga o assistente de instalação
- Aguarde a conclusão
- Clique no atalho criado na área de trabalho

---

## 🔐 Primeiro Acesso

**Login Padrão**:
```
Usuário: admin
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere a senha após o primeiro acesso!

---

## 💻 Requisitos do Sistema

### Hardware Mínimo

- **Processador**: Intel Core i3 ou equivalente
- **Memória RAM**: 4 GB
- **Espaço em Disco**: 500 MB livres
- **Sistema Operacional**: Windows 10/11 (64-bit)

### Software Necessário

- **PostgreSQL** 14 ou superior (incluído no processo de instalação)

---

## 📚 Documentação

### Manuais Incluídos

- **MANUAL-INSTALACAO.pdf** - Guia completo de instalação
- **MANUAL-USUARIO.pdf** - Como usar o sistema
- **FAQ.pdf** - Perguntas frequentes

### Vídeos Tutoriais

Acesse: https://youtube.com/oficinamotos

---

## 🆘 Suporte

### Problemas Comuns

#### "PostgreSQL não encontrado"
**Solução**: Instale o PostgreSQL antes de instalar o sistema

#### "Erro ao conectar ao banco"
**Solução**: 
1. Verifique se o PostgreSQL está rodando
2. Execute `preparar-cliente.bat`
3. Verifique a senha do postgres

#### "Sistema não abre"
**Solução**:
1. Execute como Administrador
2. Verifique o antivírus
3. Reinstale o sistema

### Contato

- **Email**: suporte@oficinamotos.com
- **Telefone**: (11) 1234-5678
- **WhatsApp**: (11) 91234-5678
- **Horário**: Segunda a Sexta, 8h às 18h

---

## 🔄 Atualizações

Para atualizar o sistema:

1. Faça backup do banco de dados
2. Execute o novo instalador
3. O sistema será atualizado automaticamente
4. Seus dados serão preservados

### Backup do Banco

```bash
pg_dump -U postgres moto > backup_moto.sql
```

---

## 📋 Checklist de Instalação

- [ ] PostgreSQL instalado
- [ ] Banco de dados `moto` criado
- [ ] Scripts SQL executados
- [ ] Sistema instalado
- [ ] Atalho criado
- [ ] Login funcionando
- [ ] Senha alterada

---

## 🎯 Funcionalidades

### Gestão de Ordens de Serviço

- ✅ Criar, editar e excluir OS
- ✅ Controle de status
- ✅ Histórico completo
- ✅ Impressão de OS

### Cadastros

- ✅ Clientes
- ✅ Veículos (motos)
- ✅ Produtos e peças
- ✅ Serviços

### Financeiro

- ✅ Contas a pagar
- ✅ Contas a receber
- ✅ Fluxo de caixa
- ✅ Relatórios

### Relatórios

- ✅ Ordens de serviço
- ✅ Vendas
- ✅ Estoque
- ✅ Financeiro

---

## 🔐 Segurança

### Recomendações

1. ✅ Altere a senha padrão
2. ✅ Faça backup regular
3. ✅ Mantenha o sistema atualizado
4. ✅ Use senhas fortes
5. ✅ Limite o acesso ao banco de dados

### Backup Automático

Configure backup automático do banco de dados:

1. Crie um script de backup
2. Agende no Agendador de Tarefas do Windows
3. Execute diariamente

---

## 📊 Informações Técnicas

### Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Desktop**: Electron

### Portas Utilizadas

- **Frontend**: 3000
- **Backend**: 3001
- **PostgreSQL**: 5432

### Logs do Sistema

Localização: `C:\Users\[Usuario]\AppData\Roaming\moto-workshop-manager\logs\`

---

## 📝 Notas da Versão 1.0.0

### Novidades

- ✅ Interface moderna com tema de motos
- ✅ Dashboard com estatísticas
- ✅ Gestão completa de OS
- ✅ Controle financeiro
- ✅ Relatórios detalhados
- ✅ Aplicativo desktop nativo

### Melhorias Futuras

- 🔄 Sincronização em nuvem
- 🔄 App mobile
- 🔄 Integração com WhatsApp
- 🔄 Assinatura digital de OS

---

## ⚖️ Licença

Este software é proprietário e licenciado para uso comercial.

**Proibido**:
- ❌ Redistribuição
- ❌ Modificação
- ❌ Engenharia reversa
- ❌ Uso não autorizado

**Permitido**:
- ✅ Uso comercial (com licença)
- ✅ Instalação em múltiplos computadores (com licença)
- ✅ Backup para fins de segurança

---

## 🎉 Agradecimentos

Obrigado por escolher o **Sistema de Oficina de Motos**!

Estamos comprometidos em fornecer a melhor solução para gestão de oficinas.

**Equipe de Desenvolvimento**
Sistema de Oficina de Motos

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Build**: 20251029  

🏍️ **Desenvolvido com ❤️ para oficinas de motos** 🏍️
