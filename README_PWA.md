# 🏍️ Sistema PWA - Oficina de Motos

> Sistema Progressive Web App profissional para gerenciamento de oficinas de motocicletas

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

Crie o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
```

### 3. Executar Migrations

1. Acesse o SQL Editor no Supabase
2. Execute o script: `supabase/migrations/001_initial_schema.sql`

### 4. Iniciar Sistema

```bash
npm run dev
```

Acesse: http://localhost:3000

## ✨ Características

- ✅ **PWA**: Instalável em qualquer dispositivo
- ✅ **Offline**: Funciona sem internet
- ✅ **Sincronização**: Automática quando online
- ✅ **Seguro**: RLS e autenticação Supabase
- ✅ **Rápido**: Cache inteligente e otimizado
- ✅ **Moderno**: React + TypeScript + Tailwind

## 📱 Instalar como App

### Desktop
1. Abra no navegador
2. Clique no ícone de instalação
3. Confirme

### Mobile
1. Abra no navegador
2. Menu > "Adicionar à tela inicial"
3. Confirme

## 🌐 Deploy

### Netlify (Recomendado)

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Vercel

```bash
npm run build
vercel --prod
```

## 📚 Documentação Completa

Veja `GUIA_PWA_COMPLETO.md` para documentação detalhada.

## 🔒 Segurança

- ✅ Apenas chaves públicas no frontend
- ✅ RLS habilitado em todas as tabelas
- ✅ Autenticação JWT via Supabase
- ✅ HTTPS obrigatório em produção

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Offline**: Dexie (IndexedDB)
- **PWA**: Vite PWA Plugin + Workbox
- **Build**: Vite

## 📊 Funcionalidades

- Gestão de clientes e veículos
- Ordens de serviço completas
- Controle de estoque
- Gestão financeira
- Agendamentos
- Relatórios e dashboards
- Multi-usuário com permissões

---

**Sistema pronto para produção** 🚀
