# 🏍️ Sistema PWA de Oficina de Motos - Guia Completo

## 📋 Visão Geral

Sistema Progressive Web App (PWA) profissional para gerenciamento de oficinas de motocicletas, com funcionalidade offline completa, sincronização automática e instalação nativa em qualquer dispositivo.

## ✨ Características Principais

### 🚀 Progressive Web App (PWA)
- ✅ Instalável em Windows, Mac, Linux, Android e iOS
- ✅ Funciona offline com IndexedDB
- ✅ Sincronização automática quando online
- ✅ Atualizações automáticas
- ✅ Notificações push
- ✅ Performance otimizada com cache inteligente

### 🔒 Segurança
- ✅ Autenticação via Supabase Auth
- ✅ Row Level Security (RLS) no banco de dados
- ✅ Apenas chaves públicas no frontend
- ✅ HTTPS obrigatório em produção
- ✅ Tokens JWT seguros

### 💼 Funcionalidades
- ✅ Gestão de clientes e veículos
- ✅ Ordens de serviço completas
- ✅ Controle de estoque
- ✅ Gestão financeira
- ✅ Agendamentos
- ✅ Relatórios e dashboards
- ✅ Multi-usuário com permissões

## 🛠️ Instalação e Configuração

### 1️⃣ Pré-requisitos

```bash
# Node.js 18+ e npm
node --version  # v18.0.0 ou superior
npm --version   # 9.0.0 ou superior
```

### 2️⃣ Configurar Projeto Supabase

1. **Criar conta no Supabase**: https://supabase.com
2. **Criar novo projeto**
3. **Copiar credenciais**:
   - Project URL: `https://seu-projeto.supabase.co`
   - Anon Key: `eyJhbGc...` (chave pública)

### 3️⃣ Instalar Dependências

```bash
# Instalar todas as dependências
npm install

# Dependências principais instaladas:
# - @supabase/supabase-js (cliente Supabase)
# - dexie (IndexedDB para offline)
# - vite-plugin-pwa (PWA)
# - workbox (Service Worker)
# - react, react-router-dom, etc.
```

### 4️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon-key
```

⚠️ **IMPORTANTE**: 
- Nunca exponha a `service_role_key` no frontend
- Use apenas a `anon_key` (chave pública)
- A segurança é garantida pelo RLS do Supabase

### 5️⃣ Executar Migrations no Supabase

1. Acesse o **SQL Editor** no dashboard do Supabase
2. Copie o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Execute o script completo
4. Verifique se todas as tabelas foram criadas

### 6️⃣ Criar Primeiro Usuário Admin

No SQL Editor do Supabase:

```sql
-- Após criar usuário via Supabase Auth, promova para admin:
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'uuid-do-usuario';
```

## 🚀 Executar o Sistema

### Modo Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

### Preview da Build

```bash
npm run preview
```

## 📱 Instalação como PWA

### Desktop (Windows/Mac/Linux)

1. Abra o sistema no navegador (Chrome, Edge, Firefox)
2. Clique no ícone de instalação na barra de endereços
3. Ou vá em Menu > Instalar aplicativo
4. O app será instalado como aplicativo nativo

### Mobile (Android/iOS)

**Android (Chrome):**
1. Abra o sistema no Chrome
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

**iOS (Safari):**
1. Abra o sistema no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Confirme

## 🌐 Deploy em Produção

### Opção 1: Netlify (Recomendado)

1. **Instalar Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Deploy**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

4. **Configurar variáveis de ambiente** no dashboard da Netlify

### Opção 2: Vercel

1. **Instalar Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
npm run build
vercel --prod
```

3. **Configurar variáveis de ambiente** no dashboard da Vercel

### Opção 3: Servidor Próprio

1. **Build**:
```bash
npm run build
```

2. **Servir com nginx**:
```nginx
server {
    listen 443 ssl http2;
    server_name oficina.seudominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/oficina/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔄 Funcionalidade Offline

### Como Funciona

1. **Primeira visita**: Dados são baixados do Supabase
2. **Armazenamento local**: Dados salvos no IndexedDB
3. **Modo offline**: Sistema usa dados locais
4. **Sincronização**: Ao voltar online, dados são sincronizados automaticamente

### Dados Armazenados Offline

- ✅ Clientes
- ✅ Veículos
- ✅ Produtos
- ✅ Serviços
- ✅ Mecânicos
- ✅ Ordens de serviço
- ✅ Fila de sincronização

### Sincronização Automática

- Sincroniza a cada 5 minutos quando online
- Sincroniza imediatamente ao recuperar conexão
- Fila de operações pendentes
- Retry automático em caso de falha

## 🔔 Notificações Push

### Configurar no Supabase

1. Acesse **Project Settings > API**
2. Copie a **Service Role Key** (apenas para backend)
3. Configure webhook para eventos:
   - Ordem de serviço concluída
   - Agendamento próximo
   - Estoque baixo

### Implementação (futuro)

```typescript
// Solicitar permissão
const permission = await Notification.requestPermission()

if (permission === 'granted') {
  // Registrar para push notifications
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'sua-vapid-key'
  })
}
```

## 📊 Monitoramento

### Verificar Status do Service Worker

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations))
```

### Verificar Cache

```javascript
// No console do navegador
caches.keys().then(keys => console.log(keys))
```

### Verificar IndexedDB

1. Abra DevTools (F12)
2. Vá em Application > Storage > IndexedDB
3. Expanda "OficinaMotosDB"

## 🎨 Personalização

### Cores e Tema

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#DC2626',  // Vermelho moto
      secondary: '#0F172A', // Azul escuro
      // Adicione suas cores
    }
  }
}
```

### Ícones e Logo

Substitua os arquivos em `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Manifest

Edite `vite.config.ts` na seção `manifest`:

```typescript
manifest: {
  name: 'Sua Oficina',
  short_name: 'Oficina',
  description: 'Sua descrição',
  theme_color: '#SuaCor',
  // ...
}
```

## 🔧 Manutenção

### Atualizar Dependências

```bash
npm update
npm audit fix
```

### Limpar Cache

```bash
# Limpar cache de build
rm -rf dist node_modules/.vite

# Reinstalar dependências
npm install
```

### Backup do Banco

No Supabase:
1. Project Settings > Database
2. Connection pooling > Download backup
3. Ou use pg_dump via CLI

## 📈 Performance

### Métricas Esperadas

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90

### Otimizações Implementadas

- ✅ Code splitting automático
- ✅ Lazy loading de rotas
- ✅ Compressão de assets
- ✅ Cache agressivo de assets estáticos
- ✅ Preload de recursos críticos

## 🐛 Troubleshooting

### Service Worker não registra

```bash
# Limpar cache do navegador
# Verificar se está em HTTPS (ou localhost)
# Verificar console para erros
```

### Sincronização não funciona

```bash
# Verificar conexão com Supabase
# Verificar RLS policies
# Verificar console para erros de autenticação
```

### Build falha

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Dexie.js](https://dexie.org/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## 🤝 Suporte

Para dúvidas e suporte:
1. Verifique a documentação
2. Consulte os logs do console
3. Verifique o status do Supabase

## 📄 Licença

Sistema proprietário - Todos os direitos reservados

---

**Desenvolvido com ❤️ para oficinas de motocicletas**
