# Guia de Atualização/Migração — PWA Oficina Motos

## O que mudou
- Registro manual do Service Worker com atualização em segundo plano
- Cache runtime para Supabase, storage público, fontes, imagens e assets
- Páginas carregadas sob demanda (reduz bundle inicial)
- Modo offline com Dexie e sincronização ao voltar a conexão
- Integração de permissões e inscrição para notificações push

## Passos de migração (se necessário)
1. Garantir HTTPS ou `localhost` para habilitar Service Worker
2. Servir o `dist/` com fallback SPA (Nginx/IIS) e `manifest.webmanifest` com MIME correto
3. (Opcional) Configurar VAPID keys e uma função de servidor para push (ex.: Supabase Edge Function)
4. Definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` antes do build caso use projeto diferente

## Verificação pós-update
- Abrir a aplicação, aceitar permissões de notificação
- Simular nova versão: verificar toast “Nova versão disponível” e aplicar “Atualizar”
- Offline: desligar rede, navegar nas páginas e confirmar dados locais
- Online: reconectar e observar sincronização automática e atualização de métricas

## Considerações
- Atualização não causa perda de dados; SW faz swap seguro
- Em caso de problemas de cache, limpar storage e recarregar