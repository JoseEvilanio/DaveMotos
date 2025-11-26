<<<<<<< HEAD
# 🏍️ DaveMotos - Sistema de Gestão para Oficina de Motos

<div align="center">

![DaveMotos](https://img.shields.io/badge/DaveMotos-Sistema%20de%20Gestão-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript)
![Electron](https://img.shields.io/badge/Electron-33.2.1-47848F?style=for-the-badge&logo=electron)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)

**Sistema completo de gestão para oficinas de motos com suporte PWA e Desktop**

[Características](#-características) •
[Tecnologias](#-tecnologias) •
[Instalação](#-instalação) •
[Uso](#-uso) •
[Documentação](#-documentação)

</div>

---

## 📋 Sobre o Projeto

**DaveMotos** é um sistema completo de gestão desenvolvido especificamente para oficinas de motos. Oferece controle total sobre ordens de serviço, estoque, clientes, produtos, serviços e módulo fiscal integrado.

### 🎯 Principais Funcionalidades

- ✅ **Gestão de Ordens de Serviço (OS)** - Controle completo do fluxo de trabalho
- ✅ **Cadastro de Clientes** - Gerenciamento de dados de clientes
- ✅ **Controle de Estoque** - Produtos e peças
- ✅ **Catálogo de Serviços** - Serviços oferecidos pela oficina
- ✅ **Módulo Fiscal** - Emissão de NF-e e NFC-e
- ✅ **Dashboard Analítico** - Relatórios e estatísticas
- ✅ **Modo Offline** - Funciona sem conexão com internet (PWA)
- ✅ **Aplicativo Desktop** - Versão Electron para Windows/Linux/Mac

---

## 🚀 Características

### 💻 Multiplataforma
- **Web (PWA)**: Acesse de qualquer navegador moderno
- **Desktop**: Aplicativo nativo para Windows, macOS e Linux
- **Responsivo**: Interface adaptável para tablets e smartphones

### 🔒 Segurança
- Autenticação JWT
- Controle de permissões por usuário
- Criptografia de dados sensíveis
- Backup automático

### ⚡ Performance
- Interface rápida e fluida
- Carregamento otimizado
- Cache inteligente
- Modo offline funcional

### 🎨 Interface Moderna
- Design intuitivo e profissional
- Tema escuro/claro
- Componentes reutilizáveis
- Experiência de usuário otimizada

---

## 🛠️ Tecnologias

### Frontend
- **React 18.3.1** - Biblioteca UI
- **TypeScript 5.6.2** - Tipagem estática
- **Vite 6.0.1** - Build tool
- **TailwindCSS 3.4.17** - Estilização
- **Zustand** - Gerenciamento de estado
- **React Router** - Navegação
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Supabase** - Backend as a Service (opcional)

### Desktop
- **Electron 33.2.1** - Framework desktop
- **Electron Builder** - Empacotamento

### PWA
- **Workbox** - Service Worker
- **Web App Manifest** - Instalação PWA

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+ (ou conta Supabase)
- Git

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/JoseEvilanio/DaveMotos.git
cd DaveMotos
```

### 2️⃣ Instale as Dependências
```bash
npm install
```

### 3️⃣ Configure as Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Supabase (se usar)
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Backend Local (se usar)
VITE_API_URL=http://localhost:3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/davemotos
JWT_SECRET=seu_secret_jwt
```

### 4️⃣ Configure o Banco de Dados

#### Opção A: Usando Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL da pasta `database/`
3. Configure as variáveis de ambiente

#### Opção B: PostgreSQL Local
```bash
# Execute o script de criação do banco
psql -U postgres -f database/schema.sql
```

### 5️⃣ Inicie o Projeto

#### Modo Desenvolvimento (Web)
```bash
npm run dev
```
Acesse: http://localhost:5173

#### Modo Desktop (Electron)
```bash
npm run electron:dev
```

#### Backend (se usar local)
```bash
cd server
npm install
npm start
```

---

## 🎮 Uso

### Primeiro Acesso
1. Acesse o sistema
2. Crie uma conta de administrador
3. Configure os dados da oficina
4. Comece a cadastrar clientes e produtos

### Fluxo de Trabalho Típico
1. **Cadastrar Cliente** → Menu Clientes
2. **Criar OS** → Menu Ordens de Serviço
3. **Adicionar Produtos/Serviços** → Na OS
4. **Finalizar OS** → Gerar nota fiscal
5. **Emitir NF-e/NFC-e** → Módulo Fiscal

---

## 📚 Documentação

### Estrutura do Projeto
```
DaveMotos/
├── src/                    # Código fonte React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── stores/            # Gerenciamento de estado (Zustand)
│   ├── types/             # Definições TypeScript
│   └── lib/               # Utilitários e configurações
├── electron/              # Aplicação Electron
├── server/                # Backend Node.js
├── database/              # Scripts SQL
├── public/                # Arquivos estáticos
└── docs/                  # Documentação adicional

```

### Documentos Importantes
- [Como Usar](COMO-USAR.md) - Guia de uso do sistema
- [Guia de Produção](GUIA-PRODUCAO.md) - Deploy em produção
- [Manual Fiscal](MANUAL_FISCAL.md) - Módulo fiscal
- [Instalação](MANUAL-INSTALACAO.md) - Instalação detalhada

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run electron:dev     # Inicia em modo Electron

# Build
npm run build           # Build para produção (web)
npm run electron:build  # Build aplicativo desktop

# Testes
npm run test           # Executa testes

# Linting
npm run lint           # Verifica código
```

---

## 🏗️ Build para Produção

### Web (PWA)
```bash
npm run build
```
Os arquivos estarão em `dist/`

### Desktop (Electron)
```bash
npm run electron:build
```
Os instaladores estarão em `release-v3/`

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**José Evilânio**

- GitHub: [@JoseEvilanio](https://github.com/JoseEvilanio)

---

## 🙏 Agradecimentos

- Equipe React
- Comunidade Electron
- Supabase
- Todos os contribuidores

---

## 📞 Suporte

Se você tiver alguma dúvida ou problema:

1. Verifique a [documentação](docs/)
2. Abra uma [issue](https://github.com/JoseEvilanio/DaveMotos/issues)
3. Entre em contato

---

<div align="center">

**Desenvolvido com ❤️ para oficinas de motos**

⭐ Se este projeto foi útil, considere dar uma estrela!

</div>
=======
# DaveMotos
Gerenciamento de oficina para motos
>>>>>>> 77dc16f803ec5fc525248c7ef072fc132152edd8
