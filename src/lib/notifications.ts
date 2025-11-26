/**
 * Sistema de Notificações Push
 * 
 * Este módulo gerencia as notificações push do PWA
 * Requer configuração adicional no Supabase para funcionar completamente
 */

import toast from 'react-hot-toast'

// Verificar se notificações são suportadas
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// Verificar permissão atual
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

// Solicitar permissão para notificações
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    toast.error('Notificações não são suportadas neste navegador')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    toast.error('Permissão para notificações foi negada')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      toast.success('Notificações habilitadas!')
      return true
    } else {
      toast.error('Permissão para notificações negada')
      return false
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error)
    toast.error('Erro ao solicitar permissão para notificações')
    return false
  }
}

// Enviar notificação local
export async function sendLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notificações não suportadas')
    return
  }

  if (Notification.permission !== 'granted') {
    console.warn('Permissão para notificações não concedida')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      ...options
    })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
  }
}

// Tipos de notificações do sistema
export enum NotificationType {
  OS_CONCLUIDA = 'os_concluida',
  OS_CRIADA = 'os_criada',
  AGENDAMENTO_PROXIMO = 'agendamento_proximo',
  ESTOQUE_BAIXO = 'estoque_baixo',
  PAGAMENTO_VENCIDO = 'pagamento_vencido'
}

// Notificações específicas do sistema
export async function notifyOSConcluida(numeroOS: string, clienteNome: string) {
  await sendLocalNotification('Ordem de Serviço Concluída', {
    body: `OS #${numeroOS} do cliente ${clienteNome} foi concluída!`,
    tag: `os-${numeroOS}`,
    requireInteraction: true
  })
}

export async function notifyOSCriada(numeroOS: string, clienteNome: string) {
  await sendLocalNotification('Nova Ordem de Serviço', {
    body: `OS #${numeroOS} criada para ${clienteNome}`,
    tag: `os-${numeroOS}`
  })
}

export async function notifyAgendamentoProximo(
  clienteNome: string,
  dataHora: string
) {
  await sendLocalNotification('Agendamento Próximo', {
    body: `${clienteNome} tem agendamento em ${dataHora}`,
    tag: 'agendamento',
    requireInteraction: true
  })
}

export async function notifyEstoqueBaixo(produtoNome: string, quantidade: number) {
  await sendLocalNotification('Estoque Baixo', {
    body: `${produtoNome} está com apenas ${quantidade} unidades`,
    tag: 'estoque',
    requireInteraction: true
  })
}

export async function notifyPagamentoVencido(
  numeroOS: string,
  valor: number,
  diasVencido: number
) {
  await sendLocalNotification('Pagamento Vencido', {
    body: `OS #${numeroOS} - R$ ${valor.toFixed(2)} vencido há ${diasVencido} dias`,
    tag: `pagamento-${numeroOS}`,
    requireInteraction: true
  })
}

// Registrar para push notifications (requer configuração do servidor)
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    // VAPID key pública (você precisa gerar uma)
    // Use: npx web-push generate-vapid-keys
    const vapidPublicKey = 'SUA_VAPID_PUBLIC_KEY_AQUI'
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
    })
    
    // Enviar subscription para o servidor (Supabase Edge Function)
    // await supabase.functions.invoke('register-push', {
    //   body: { subscription }
    // })
    
    return subscription
  } catch (error) {
    console.error('Erro ao registrar push notifications:', error)
    return null
  }
}

// Cancelar inscrição de push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      
      // Remover do servidor
      // await supabase.functions.invoke('unregister-push', {
      //   body: { endpoint: subscription.endpoint }
      // })
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('Erro ao cancelar push notifications:', error)
    return false
  }
}

// Utilitário para converter VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

// Hook para usar em componentes React
export function useNotifications() {
  const isSupported = isNotificationSupported()
  const permission = getNotificationPermission()
  
  return {
    isSupported,
    permission,
    requestPermission: requestNotificationPermission,
    sendNotification: sendLocalNotification,
    subscribe: subscribeToPushNotifications,
    unsubscribe: unsubscribeFromPushNotifications,
    // Notificações específicas
    notifyOSConcluida,
    notifyOSCriada,
    notifyAgendamentoProximo,
    notifyEstoqueBaixo,
    notifyPagamentoVencido
  }
}
