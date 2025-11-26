import Dexie, { Table } from 'dexie'

// Tipos para o banco de dados offline
export interface Cliente {
  id?: number
  supabase_id?: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
  created_at?: string
  updated_at?: string
  synced?: boolean
}

export interface Veiculo {
  id?: number
  supabase_id?: string
  cliente_id?: number
  cliente_supabase_id?: string
  placa: string
  marca: string
  modelo: string
  ano?: number
  cor?: string
  created_at?: string
  updated_at?: string
  synced?: boolean
}

export interface OrdemServico {
  id?: number
  supabase_id?: string
  cliente_id?: number
  cliente_supabase_id?: string
  veiculo_id?: number
  veiculo_supabase_id?: string
  mecanico_id?: number
  mecanico_supabase_id?: string
  numero_os: string
  data_entrada: string
  data_prevista?: string
  data_saida?: string
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  descricao_problema?: string
  observacoes?: string
  valor_total?: number
  valor_pago?: number
  created_at?: string
  updated_at?: string
  synced?: boolean
}

export interface Produto {
  id?: number
  supabase_id?: string
  codigo?: string
  nome: string
  descricao?: string
  categoria?: string
  preco_custo?: number
  preco_venda: number
  estoque_atual?: number
  estoque_minimo?: number
  created_at?: string
  updated_at?: string
  synced?: boolean
}

export interface Servico {
  id?: number
  supabase_id?: string
  nome: string
  descricao?: string
  preco: number
  tempo_estimado?: number
  created_at?: string
  updated_at?: string
  synced?: boolean
}

export interface Mecanico {
  id?: number
  supabase_id?: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  especialidade?: string
  created_at?: string
  updated_at?: string
  synced?: boolean
}

export interface SyncQueue {
  id?: number
  table_name: string
  operation: 'insert' | 'update' | 'delete'
  record_id: number
  data: any
  created_at: string
  synced: boolean
  error?: string
}

// Classe do banco de dados Dexie
export class OficinaDB extends Dexie {
  clientes!: Table<Cliente>
  veiculos!: Table<Veiculo>
  ordens_servico!: Table<OrdemServico>
  produtos!: Table<Produto>
  servicos!: Table<Servico>
  mecanicos!: Table<Mecanico>
  sync_queue!: Table<SyncQueue>

  constructor() {
    super('OficinaMotosDB')
    
    this.version(1).stores({
      clientes: '++id, supabase_id, nome, cpf, telefone, email, synced',
      veiculos: '++id, supabase_id, cliente_id, cliente_supabase_id, placa, marca, modelo, synced',
      ordens_servico: '++id, supabase_id, cliente_id, veiculo_id, numero_os, status, data_entrada, synced',
      produtos: '++id, supabase_id, codigo, nome, categoria, synced',
      servicos: '++id, supabase_id, nome, synced',
      mecanicos: '++id, supabase_id, nome, cpf, synced',
      sync_queue: '++id, table_name, operation, record_id, synced, created_at'
    })
  }
}

// Instância única do banco de dados
export const db = new OficinaDB()

// Função para adicionar item à fila de sincronização
export async function addToSyncQueue(
  tableName: string,
  operation: 'insert' | 'update' | 'delete',
  recordId: number,
  data: any
) {
  await db.sync_queue.add({
    table_name: tableName,
    operation,
    record_id: recordId,
    data,
    created_at: new Date().toISOString(),
    synced: false
  })
}

// Função para limpar dados sincronizados
export async function clearSyncedData() {
  await db.sync_queue.where('synced').equals(1).delete()
}

// Função para obter itens pendentes de sincronização
export async function getPendingSyncItems() {
  try {
    return await db.sync_queue.where('synced').equals(0).toArray()
  } catch (error) {
    console.error('Erro ao buscar itens pendentes:', error)
    return []
  }
}
