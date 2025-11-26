import { supabase } from './supabase'
import { db, addToSyncQueue, getPendingSyncItems, clearSyncedData } from './db'
import toast from 'react-hot-toast'

// Estado de conexão
let isOnline = navigator.onLine
let syncInProgress = false

// Listener para mudanças de conexão
window.addEventListener('online', () => {
  isOnline = true
  toast.success('Conexão restaurada! Sincronizando dados...')
  syncData()
})

window.addEventListener('offline', () => {
  isOnline = false
  toast.error('Sem conexão. Trabalhando offline.')
})

// Função principal de sincronização
export async function syncData() {
  if (!isOnline || syncInProgress) return
  
  syncInProgress = true
  
  try {
    // 1. Sincronizar dados pendentes locais para o Supabase
    await syncLocalToRemote()
    
    // 2. Buscar dados atualizados do Supabase
    await syncRemoteToLocal()
    
    // 3. Limpar fila de sincronização
    await clearSyncedData()
    
    toast.success('Dados sincronizados com sucesso!')
  } catch (error) {
    console.error('Erro na sincronização:', error)
    toast.error('Erro ao sincronizar dados')
  } finally {
    syncInProgress = false
  }
}

// Sincronizar dados locais para o Supabase
async function syncLocalToRemote() {
  const pendingItems = await getPendingSyncItems()
  
  for (const item of pendingItems) {
    try {
      switch (item.operation) {
        case 'insert':
          await handleInsert(item)
          break
        case 'update':
          await handleUpdate(item)
          break
        case 'delete':
          await handleDelete(item)
          break
      }
      
      // Marcar como sincronizado
      await db.sync_queue.update(item.id!, { synced: true })
    } catch (error) {
      console.error(`Erro ao sincronizar item ${item.id}:`, error)
      await db.sync_queue.update(item.id!, { 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }
}

// Handlers para cada operação
async function handleInsert(item: any) {
  const { data, error } = await supabase
    .from(item.table_name)
    .insert(item.data)
    .select()
    .single()
  
  if (error) throw error
  
  // Atualizar ID local com ID do Supabase
  if (data) {
    const localTable = (db as any)[item.table_name]
    await localTable.update(item.record_id, {
      supabase_id: data.id,
      synced: true
    })
  }
}

async function handleUpdate(item: any) {
  const { error } = await supabase
    .from(item.table_name)
    .update(item.data)
    .eq('id', item.data.supabase_id || item.data.id)
  
  if (error) throw error
  
  // Marcar como sincronizado localmente
  const localTable = (db as any)[item.table_name]
  await localTable.update(item.record_id, { synced: true })
}

async function handleDelete(item: any) {
  const { error } = await supabase
    .from(item.table_name)
    .delete()
    .eq('id', item.data.supabase_id || item.data.id)
  
  if (error) throw error
}

// Sincronizar dados do Supabase para local
async function syncRemoteToLocal() {
  // Sincronizar clientes
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1000)
  
  if (clientes) {
    for (const cliente of clientes) {
      await db.clientes.put({
        ...cliente,
        supabase_id: cliente.id,
        synced: true
      })
    }
  }
  
  // Sincronizar veículos
  const { data: veiculos } = await supabase
    .from('veiculos')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1000)
  
  if (veiculos) {
    for (const veiculo of veiculos) {
      await db.veiculos.put({
        ...veiculo,
        supabase_id: veiculo.id,
        cliente_supabase_id: veiculo.cliente_id,
        synced: true
      })
    }
  }
  
  // Sincronizar ordens de serviço
  const { data: ordens } = await supabase
    .from('ordens_servico')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500)
  
  if (ordens) {
    for (const ordem of ordens) {
      await db.ordens_servico.put({
        ...ordem,
        supabase_id: ordem.id,
        cliente_supabase_id: ordem.cliente_id,
        veiculo_supabase_id: ordem.veiculo_id,
        mecanico_supabase_id: ordem.mecanico_id,
        synced: true
      })
    }
  }
  
  // Sincronizar produtos
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1000)
  
  if (produtos) {
    for (const produto of produtos) {
      await db.produtos.put({
        ...produto,
        supabase_id: produto.id,
        synced: true
      })
    }
  }
  
  // Sincronizar serviços
  const { data: servicos } = await supabase
    .from('servicos')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500)
  
  if (servicos) {
    for (const servico of servicos) {
      await db.servicos.put({
        ...servico,
        supabase_id: servico.id,
        synced: true
      })
    }
  }
  
  // Sincronizar mecânicos
  const { data: mecanicos } = await supabase
    .from('mecanicos')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200)
  
  if (mecanicos) {
    for (const mecanico of mecanicos) {
      await db.mecanicos.put({
        ...mecanico,
        supabase_id: mecanico.id,
        synced: true
      })
    }
  }
}

// Função para verificar se está online
export function checkOnlineStatus() {
  return isOnline
}

// Iniciar sincronização automática a cada 5 minutos
export function startAutoSync() {
  // Sincronizar imediatamente
  if (isOnline) {
    syncData()
  }
  
  // Sincronizar a cada 5 minutos
  setInterval(() => {
    if (isOnline) {
      syncData()
    }
  }, 5 * 60 * 1000)
}
