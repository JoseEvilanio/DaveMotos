# 🛠️ Comandos Úteis - Sistema PWA

## 📦 Instalação e Configuração

```bash
# Instalar dependências
npm install

# Instalar dependência específica
npm install nome-pacote

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Auditar segurança
npm audit
npm audit fix
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint (verificar código)
npm run lint
```

## 🌐 Deploy

### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (primeira vez)
npm run build
netlify deploy

# Deploy produção
npm run build
netlify deploy --prod --dir=dist

# Ver logs
netlify logs

# Abrir dashboard
netlify open
```

### Vercel

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy (primeira vez)
npm run build
vercel

# Deploy produção
npm run build
vercel --prod

# Ver logs
vercel logs

# Abrir dashboard
vercel open
```

## 🗄️ Supabase

### CLI

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Inicializar projeto
supabase init

# Linkar projeto
supabase link --project-ref seu-projeto-ref

# Gerar tipos TypeScript
supabase gen types typescript --project-id seu-projeto-id > src/types/database.ts

# Criar migration
supabase migration new nome_da_migration

# Aplicar migrations
supabase db push

# Reset database (cuidado!)
supabase db reset
```

### SQL Úteis

```sql
-- Ver todos os usuários
SELECT * FROM auth.users;

-- Ver perfis
SELECT * FROM profiles;

-- Promover usuário para admin
UPDATE profiles SET role = 'admin' WHERE id = 'uuid-do-usuario';

-- Ver últimas ordens de serviço
SELECT * FROM ordens_servico ORDER BY created_at DESC LIMIT 10;

-- Contar registros por tabela
SELECT 
  'clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'veiculos', COUNT(*) FROM veiculos
UNION ALL
SELECT 'ordens_servico', COUNT(*) FROM ordens_servico
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos;

-- Limpar dados de teste (cuidado!)
TRUNCATE TABLE os_itens CASCADE;
TRUNCATE TABLE ordens_servico CASCADE;
TRUNCATE TABLE veiculos CASCADE;
TRUNCATE TABLE clientes CASCADE;
```

## 🧹 Limpeza

```bash
# Limpar cache do Vite
rm -rf node_modules/.vite

# Limpar build
rm -rf dist

# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json dist
npm install

# Limpar cache do npm
npm cache clean --force
```

## 🔍 Debug

```bash
# Ver versões
node --version
npm --version

# Ver dependências instaladas
npm list

# Ver dependências de produção
npm list --prod

# Ver dependências desatualizadas
npm outdated

# Verificar configuração
npm config list
```

## 📊 Performance

```bash
# Analisar bundle size
npm run build
npx vite-bundle-visualizer

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

## 🔐 Segurança

```bash
# Auditar pacotes
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Corrigir forçadamente
npm audit fix --force

# Ver detalhes de vulnerabilidade
npm audit --json
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Service Worker não registra

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    console.log(registration);
  });
});

// Desregistrar todos
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
  });
});
```

### Erro: Cache não limpa

```javascript
// No console do navegador
caches.keys().then(keys => {
  keys.forEach(key => {
    caches.delete(key);
  });
});
```

### Erro: IndexedDB corrompido

```javascript
// No console do navegador
indexedDB.deleteDatabase('OficinaMotosDB');
// Depois recarregue a página
```

## 📱 PWA Debug

### Chrome DevTools

```
1. F12 (DevTools)
2. Application tab
3. Verificar:
   - Manifest
   - Service Workers
   - Cache Storage
   - IndexedDB
   - Storage
```

### Lighthouse

```
1. F12 (DevTools)
2. Lighthouse tab
3. Selecionar:
   - Performance
   - Progressive Web App
   - Best Practices
   - Accessibility
   - SEO
4. Generate report
```

### Service Worker Debug

```javascript
// Ver status
navigator.serviceWorker.controller

// Ver registrations
navigator.serviceWorker.getRegistrations()

// Atualizar SW
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.update();
  });
});
```

## 🔄 Git (Opcional)

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Transformação para PWA completa"

# Adicionar remote
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Push
git push -u origin main

# Ver status
git status

# Ver log
git log --oneline
```

## 📦 Backup

### Backup Supabase

```bash
# Via CLI
supabase db dump -f backup.sql

# Via pg_dump (se tiver acesso direto)
pg_dump -h db.seu-projeto.supabase.co -U postgres -d postgres > backup.sql
```

### Backup Local

```bash
# Backup completo do projeto
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Backup apenas do código
tar -czf backup-src-$(date +%Y%m%d).tar.gz src public index.html package.json
```

## 🎨 Personalização

### Gerar Ícones PWA

```bash
# Usando imagemagick
convert logo.png -resize 72x72 public/icons/icon-72x72.png
convert logo.png -resize 96x96 public/icons/icon-96x96.png
convert logo.png -resize 128x128 public/icons/icon-128x128.png
convert logo.png -resize 144x144 public/icons/icon-144x144.png
convert logo.png -resize 152x152 public/icons/icon-152x152.png
convert logo.png -resize 192x192 public/icons/icon-192x192.png
convert logo.png -resize 384x384 public/icons/icon-384x384.png
convert logo.png -resize 512x512 public/icons/icon-512x512.png
```

### Gerar Favicon

```bash
# Usando imagemagick
convert logo.png -resize 16x16 public/favicon-16x16.png
convert logo.png -resize 32x32 public/favicon-32x32.png
```

## 📈 Monitoramento

### Ver logs do Supabase

```bash
# Via CLI
supabase functions logs nome-da-funcao

# Via dashboard
# Ir em: Logs > Query Logs
```

### Ver logs do Netlify

```bash
netlify logs
netlify logs --function nome-da-funcao
```

## 🔧 Manutenção

### Atualizar Supabase

```bash
# Atualizar cliente
npm update @supabase/supabase-js

# Ver versão atual
npm list @supabase/supabase-js
```

### Atualizar React

```bash
npm update react react-dom
npm update @types/react @types/react-dom
```

### Atualizar Vite

```bash
npm update vite @vitejs/plugin-react
```

## 💡 Dicas

### Desenvolvimento mais rápido

```bash
# Usar --host para acessar de outros dispositivos
npm run dev -- --host

# Usar porta específica
npm run dev -- --port 8080

# Abrir automaticamente no navegador
npm run dev -- --open
```

### Build otimizado

```bash
# Build com análise
npm run build -- --mode production

# Build sem sourcemaps
npm run build -- --sourcemap false
```

## 🆘 Comandos de Emergência

```bash
# Resetar tudo
rm -rf node_modules package-lock.json dist .vite
npm install
npm run build

# Limpar cache do navegador
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Edge: Ctrl+Shift+Delete

# Desregistrar Service Worker
# DevTools > Application > Service Workers > Unregister

# Limpar IndexedDB
# DevTools > Application > IndexedDB > Delete database
```

---

## 📚 Referências Rápidas

- **Vite**: https://vitejs.dev/
- **React**: https://react.dev/
- **Supabase**: https://supabase.com/docs
- **PWA**: https://web.dev/progressive-web-apps/
- **Workbox**: https://developers.google.com/web/tools/workbox

---

**Mantenha este arquivo como referência rápida!** 📌
