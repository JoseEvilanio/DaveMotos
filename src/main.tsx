/// <reference types="vite-plugin-pwa/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { registerSW } from 'virtual:pwa-register'
import toast from 'react-hot-toast'
import { requestNotificationPermission, subscribeToPushNotifications } from './lib/notifications'
import './index.css'
import { startAutoSync } from './lib/sync'

console.log('🚀 Iniciando Sistema de Oficina de Motos PWA...')

const isProd = (import.meta as any).env?.PROD

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 2,
    }
  },
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('❌ Elemento root não encontrado!')
  throw new Error('Root element not found')
}

console.log('✅ Root encontrado, montando aplicação...')

// Iniciar sincronização automática
startAutoSync()

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

console.log('✅ Aplicação montada com sucesso!')

// Registrar Service Worker e gerenciar atualizações
const isSecure = (typeof window !== 'undefined') && (window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost')
const isElectron = typeof process !== 'undefined' && (process as any).versions?.electron
// Em Electron (file://), não registrar SW
if (isProd && 'serviceWorker' in navigator && isSecure && !isElectron) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Nova versão disponível</span>
          <button
            onClick={() => {
              updateSW(true)
              toast.dismiss(t.id)
            }}
            className="btn btn-primary btn-sm"
          >
            Atualizar
          </button>
        </div>
      ))
    },
    onOfflineReady() {
      toast.success('App pronto para uso offline')
    },
    onRegistered(registration) {
      console.log('SW registrado', registration)
      // Verificar atualizações em segundo plano
      setInterval(() => {
        registration && registration.update && registration.update()
      }, 60 * 60 * 1000)
      // Solicitar notificações e registrar push (se configurado)
      requestNotificationPermission().then(async (granted) => {
        if (granted) {
          await subscribeToPushNotifications()
        }
      })
    },
    onRegisterError(error) {
      console.error('Erro ao registrar SW:', error)
    }
  })
}
