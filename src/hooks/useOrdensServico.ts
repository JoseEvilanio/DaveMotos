import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface OrdemServico {
  id: string
  numero_os: number
  cliente_id: string
  veiculo_id: string
  mecanico_id: string | null
  status: 'aberta' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada'
  data_abertura: string
  data_previsao: string | null
  data_conclusao: string | null
  km_entrada: number | null
  defeito_reclamado: string
  defeito_constatado: string | null
  servicos_executados: string | null
  observacoes: string | null
  fotos_urls: string[] | null
  valor_pecas: number
  valor_servicos: number
  valor_desconto: number
  valor_total: number
  forma_pagamento: string | null
  status_pagamento: string
  garantia_dias: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Campos relacionados (joins)
  cliente_nome?: string
  veiculo_descricao?: string
  mecanico_nome?: string
}

export interface OrdemServicoItem {
  id: string
  os_id: string
  produto_id: string | null
  tipo: 'produto' | 'servico'
  descricao: string
  quantidade: number
  preco_unitario: number
  desconto: number
  subtotal: number
  created_at: string
}

export const useOrdensServico = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)

  // Resolve dinamicamente a tabela de serviços da OS.
  // Alguns ambientes têm `os_servicos`; outros usam itens genéricos em `os_itens` com tipo 'servico'.
  const resolveOsServicosTable = async (): Promise<'os_servicos' | 'os_itens'> => {
    try {
      const { error } = await supabase.from('os_servicos').select('id').limit(1)
      if (!error) return 'os_servicos'
      return 'os_itens'
    } catch {
      return 'os_itens'
    }
  }

  const fetchOrdens = async () => {
    try {
      setLoading(true)
      // Buscar diretamente do Supabase com joins para nomes relacionados
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clientes!cliente_id (nome),
          veiculos!veiculo_id (marca, modelo, placa),
          mecanicos!mecanico_id (nome)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatadas = (data || []).map((os: any) => ({
        ...os,
        cliente_nome: os?.clientes?.nome || '-',
        veiculo_descricao: os?.veiculos
          ? `${os.veiculos.marca} ${os.veiculos.modelo} - ${os.veiculos.placa}`
          : '-',
        mecanico_nome: os?.mecanicos?.nome || '-',
        status: mapEnglishToPortugueseStatus(os.status || 'draft'),
      }))

      setOrdens(formatadas)
    } catch (error: any) {
      toast.error('Erro ao carregar ordens de serviço')
      console.error('Erro completo:', error)
    } finally {
      setLoading(false)
    }
  }

  // Definindo interfaces para os itens
  interface ServicoItem {
    tipo_servico_id: string;
    quantidade: number;
    preco_unitario: number;
    subtotal?: number;
    observacoes?: string;
    tipo_servico_nome?: string;
  }

  interface PecaItem {
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    subtotal?: number;
    produto_nome?: string;
  }

  const createOrdem = async (ordem: Partial<OrdemServico> & { servicos?: ServicoItem[]; pecas?: PecaItem[] }) => {
    try {
      // Separar itens da OS
      const { servicos = [], pecas = [], ...ordemBase } = ordem

      // Calcular totais
      const totalServicos = (servicos || []).reduce((acc, s) => acc + Number(s.subtotal ?? Number(s.quantidade || 1) * Number(s.preco_unitario || 0)), 0)
      const totalPecas = (pecas || []).reduce((acc, p) => acc + Number(p.subtotal ?? Number(p.quantidade || 1) * Number(p.preco_unitario || 0)), 0)
      const desconto = Number((ordemBase as any).valor_desconto || 0)
      const totalGeral = totalServicos + totalPecas - desconto

      // Inserir OS na tabela principal
      const { data: osInsert, error: osErr } = await supabase
        .from('ordens_servico')
        .insert([{ 
          cliente_id: (ordemBase as any).cliente_id,
          veiculo_id: (ordemBase as any).veiculo_id,
          mecanico_id: (ordemBase as any).mecanico_id || null,
          defeito_reclamado: (ordemBase as any).defeito_reclamado,
          observacoes: (ordemBase as any).observacoes || null,
          status: mapPortugueseToEnglishStatus((ordemBase as any).status || 'aberta'),
          valor_servicos: totalServicos,
          valor_pecas: totalPecas,
          valor_desconto: desconto,
          valor_total: totalGeral,
          is_active: true,
        } as any])
        .select()
        .single()

      if (osErr) throw osErr
      const os = osInsert as any

      // Inserir serviços na tabela correta
      if (servicos?.length) {
        const tableServ = await resolveOsServicosTable()
        if (tableServ === 'os_servicos') {
          const servicosPayload = servicos.map((s) => ({
            os_id: os.id,
            tipo_servico_id: s.tipo_servico_id || null,
            quantidade: Number(s.quantidade || 1),
            preco_unitario: Number(s.preco_unitario || 0),
            subtotal: Number(s.subtotal ?? Number(s.quantidade || 1) * Number(s.preco_unitario || 0)),
            observacoes: s.observacoes || null,
          }))
          const { error: servErr } = await supabase.from('os_servicos').insert(servicosPayload as any)
          if (servErr) throw servErr
        } else {
          const itensServ = servicos.map((s) => ({
            os_id: os.id,
            tipo: 'servico',
            descricao: s.tipo_servico_nome || '',
            quantidade: Number(s.quantidade || 1),
            preco_unitario: Number(s.preco_unitario || 0),
            desconto: 0,
            subtotal: Number(s.subtotal ?? Number(s.quantidade || 1) * Number(s.preco_unitario || 0)),
          }))
          const { error: itensServErr } = await supabase.from('os_itens').insert(itensServ as any)
          if (itensServErr) throw itensServErr
        }
      }

      // Inserir peças preferindo os_itens; fallback para os_pecas
      if (pecas?.length) {
        const itensPecas = pecas.map((p) => ({
          os_id: os.id,
          tipo: 'produto',
          descricao: p.produto_nome || '',
          quantidade: Number(p.quantidade || 1),
          preco_unitario: Number(p.preco_unitario || 0),
          desconto: 0,
          subtotal: Number(p.subtotal ?? Number(p.quantidade || 1) * Number(p.preco_unitario || 0)),
        }))
        const { error: itensPecasErr } = await supabase.from('os_itens').insert(itensPecas as any)
        if (itensPecasErr) {
          const pecasPayload = pecas.map((p) => ({
            os_id: os.id,
            produto_id: p.produto_id || null,
            quantidade: Number(p.quantidade || 1),
            preco_unitario: Number(p.preco_unitario || 0),
            subtotal: Number(p.subtotal ?? Number(p.quantidade || 1) * Number(p.preco_unitario || 0)),
          }))
          const { error: pecErr } = await supabase.from('os_pecas').insert(pecasPayload as any)
          if (pecErr) throw pecErr
        }
      }

      toast.success('Ordem de Serviço criada com sucesso!')
      await fetchOrdens()
      return os
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar ordem de serviço')
      throw error
    }
  }

  const updateOrdem = async (id: string, ordem: Partial<OrdemServico> & { servicos?: ServicoItem[]; pecas?: PecaItem[] }) => {
    try {
      const { servicos = [], pecas = [], ...ordemBase } = ordem

      // Recalcular totais
      const totalServicos = (servicos || []).reduce((acc, s) => acc + Number(s.subtotal ?? Number(s.quantidade || 1) * Number(s.preco_unitario || 0)), 0)
      const totalPecas = (pecas || []).reduce((acc, p) => acc + Number(p.subtotal ?? Number(p.quantidade || 1) * Number(p.preco_unitario || 0)), 0)
      const desconto = Number((ordemBase as any).valor_desconto || 0)
      const totalGeral = totalServicos + totalPecas - desconto

      // Atualizar OS
      const { error: osUpdErr } = await supabase
        .from('ordens_servico')
        .update({
          cliente_id: (ordemBase as any).cliente_id,
          veiculo_id: (ordemBase as any).veiculo_id,
          mecanico_id: (ordemBase as any).mecanico_id || null,
          defeito_reclamado: (ordemBase as any).defeito_reclamado,
          observacoes: (ordemBase as any).observacoes || null,
          status: mapPortugueseToEnglishStatus((ordemBase as any).status || 'aberta'),
          valor_servicos: totalServicos,
          valor_pecas: totalPecas,
          valor_desconto: desconto,
          valor_total: totalGeral,
        } as any)
        .eq('id', id)

      if (osUpdErr) throw osUpdErr

      // Atualizar serviços na tabela correta
      if (servicos) {
        const tableServ = await resolveOsServicosTable()
        if (tableServ === 'os_servicos') {
          const { error: delServErr } = await supabase.from('os_servicos').delete().eq('os_id', id)
          if (delServErr) throw delServErr
          if (servicos.length) {
            const servicosPayload = servicos.map((s) => ({
              os_id: id,
              tipo_servico_id: s.tipo_servico_id || null,
              quantidade: Number(s.quantidade || 1),
              preco_unitario: Number(s.preco_unitario || 0),
              subtotal: Number(s.subtotal ?? Number(s.quantidade || 1) * Number(s.preco_unitario || 0)),
              observacoes: s.observacoes || null,
            }))
            const { error: insServErr } = await supabase.from('os_servicos').insert(servicosPayload as any)
            if (insServErr) throw insServErr
          }
        } else {
          const { error: delItensServErr } = await supabase.from('os_itens').delete().eq('os_id', id).eq('tipo', 'servico')
          if (delItensServErr) throw delItensServErr
          if (servicos.length) {
            const itensServ = servicos.map((s) => ({
              os_id: id,
              tipo: 'servico',
              descricao: s.tipo_servico_nome || '',
              quantidade: Number(s.quantidade || 1),
              preco_unitario: Number(s.preco_unitario || 0),
              desconto: 0,
              subtotal: Number(s.subtotal ?? Number(s.quantidade || 1) * Number(s.preco_unitario || 0)),
            }))
            const { error: insItensServErr } = await supabase.from('os_itens').insert(itensServ as any)
            if (insItensServErr) throw insItensServErr
          }
        }
      }

      // Atualizar peças: preferir os_itens; fallback para os_pecas
      if (pecas) {
        const { error: delItensPecasErr } = await supabase
          .from('os_itens')
          .delete()
          .eq('os_id', id)
          .eq('tipo', 'produto')
        if (delItensPecasErr) {
          const { error: delPecasErr } = await supabase.from('os_pecas').delete().eq('os_id', id)
          if (delPecasErr) throw delPecasErr
        }
        if (pecas.length) {
          const itensPecas = pecas.map((p) => ({
            os_id: id,
            tipo: 'produto',
            descricao: p.produto_nome || '',
            quantidade: Number(p.quantidade || 1),
            preco_unitario: Number(p.preco_unitario || 0),
            desconto: 0,
            subtotal: Number(p.subtotal ?? Number(p.quantidade || 1) * Number(p.preco_unitario || 0)),
          }))
          const { error: insItensPecasErr } = await supabase.from('os_itens').insert(itensPecas as any)
          if (insItensPecasErr) {
            const pecasPayload = pecas.map((p) => ({
              os_id: id,
              produto_id: p.produto_id || null,
              quantidade: Number(p.quantidade || 1),
              preco_unitario: Number(p.preco_unitario || 0),
              subtotal: Number(p.subtotal ?? Number(p.quantidade || 1) * Number(p.preco_unitario || 0)),
            }))
            const { error: insPecasErr } = await supabase.from('os_pecas').insert(pecasPayload as any)
            if (insPecasErr) throw insPecasErr
          }
        }
      }

      toast.success('Ordem de Serviço atualizada com sucesso!')
      await fetchOrdens()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar ordem de serviço')
      throw error
    }
  }

  const deleteOrdem = async (id: string) => {
    try {
      // Exclusão lógica via Supabase
      const { error } = await (supabase as any)
        .from('ordens_servico')
        .update({ is_active: false } as any)
        .eq('id', id)

      if (error) throw error

      toast.success('Ordem de Serviço excluída com sucesso!')
      await fetchOrdens()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir ordem de serviço')
      console.error('Erro completo:', error)
      throw error
    }
  }

  const getOrdemById = async (id: string) => {
    try {
      console.log('Buscando OS completa com ID:', id)

      // Buscar dados básicos da OS via Supabase (com joins para nomes)
      const { data: sbData, error: sbOsErr } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clientes!cliente_id (nome),
          veiculos!veiculo_id (marca, modelo, placa),
          mecanicos!mecanico_id (nome)
        `)
        .eq('id', id)
        .single()

      if (sbOsErr) {
        console.error('Erro do Supabase ao buscar OS:', sbOsErr)
        throw sbOsErr
      }

      // Buscar serviços relacionados usando a tabela correta
      let servicosData: any[] = []
      {
        const tableServ = await resolveOsServicosTable()
        if (tableServ === 'os_servicos') {
          const { data: sbServicos, error: sbServErr } = await supabase
            .from('os_servicos')
            .select('*')
            .eq('os_id', id)
          if (sbServErr) {
            console.warn('Supabase serviços falhou:', sbServErr?.message || sbServErr)
            servicosData = []
          } else {
            servicosData = sbServicos || []
            // Enriquecer nomes dos tipos, se a tabela existir
            try {
              const tipoIds = (servicosData || [])
                .map((s: any) => s?.tipo_servico_id)
                .filter((v: any) => !!v)
              if (tipoIds.length) {
                const { data: tipos, error: tiposErr } = await supabase
                  .from('tipos_servicos')
                  .select('id,nome')
                  .in('id', tipoIds as any)
                if (!tiposErr && Array.isArray(tipos)) {
                  const map = new Map<string, string>()
                  tipos.forEach((t: any) => map.set(t.id, t.nome))
                  servicosData = servicosData.map((s: any) => ({
                    ...s,
                    tipo_servico_nome: map.get(s.tipo_servico_id) || s.descricao || ''
                  }))
                }
              }
            } catch (e) {
              console.warn('Enriquecimento tipos_servicos falhou (seguindo sem nomes):', (e as any)?.message || e)
            }
          }
        } else {
          const { data: itensServ, error: itensServErr } = await supabase
            .from('os_itens')
            .select('*')
            .eq('os_id', id)
            .eq('tipo', 'servico')
          if (itensServErr) {
            console.warn('Fallback os_itens servicos falhou:', itensServErr?.message || itensServErr)
            servicosData = []
          } else {
            servicosData = itensServ || []
          }
        }
      }

      // Buscar peças relacionadas preferindo os_itens; fallback para os_pecas
      let pecasData: any[] = []
      {
        const { data: itensPecas, error: itensPecasErr } = await supabase
          .from('os_itens')
          .select('*')
          .eq('os_id', id)
          .eq('tipo', 'produto')
        if (itensPecasErr) {
          console.warn('Supabase os_itens peças falhou:', itensPecasErr?.message || itensPecasErr)
          const { data: sbPecas, error: sbPecasErr } = await supabase
            .from('os_pecas')
            .select('*')
            .eq('os_id', id)
          if (sbPecasErr) {
            console.warn('Fallback os_pecas peças falhou:', sbPecasErr?.message || sbPecasErr)
            pecasData = []
          } else {
            pecasData = sbPecas || []
          }
        } else {
          pecasData = itensPecas || []
        }

        // Enriquecer nomes dos produtos, se a tabela existir
        try {
          const prodIds = (pecasData || [])
            .map((p: any) => p?.produto_id)
            .filter((v: any) => !!v)
          if (prodIds.length) {
            const { data: produtos, error: prodErr } = await supabase
              .from('produtos')
              .select('id,nome')
              .in('id', prodIds as any)
            if (!prodErr && Array.isArray(produtos)) {
              const map = new Map<string, string>()
              produtos.forEach((t: any) => map.set(t.id, t.nome))
              pecasData = pecasData.map((p: any) => ({
                ...p,
                produto_nome: map.get(p.produto_id) || p.descricao || ''
              }))
            }
          }
        } catch (e) {
          console.warn('Enriquecimento produtos falhou (seguindo sem nomes):', (e as any)?.message || e)
        }
      }
      
      // Formatar serviços - garantir que seja um array
      let servicos: ServicoItem[] = []
      if (servicosData && Array.isArray(servicosData)) {
        servicos = servicosData.map((s: any) => ({
          id: s.id,
          // Fallback para registros vindos de os_itens: não possuem tipo_servico_id
          tipo_servico_id: s.tipo_servico_id || '',
          tipo_servico_nome: s.tipo_servico_nome || s.tipos_servicos?.nome || s.descricao || '',
          quantidade: Number(s.quantidade || 1),
          preco_unitario: Number(s.preco_unitario || 0),
          subtotal: Number(s.subtotal || 0),
          observacoes: s.observacoes || ''
        }))
      }
      
      console.log('Serviços formatados:', servicos)
      
      // Formatar peças - garantir que seja um array
      let pecas: PecaItem[] = []
      if (pecasData && Array.isArray(pecasData)) {
        pecas = pecasData.map((p: any) => ({
          id: p.id,
          produto_id: p.produto_id || null,
          produto_nome: p.produto_nome || p.produtos?.nome || p.descricao || '',
          quantidade: Number(p.quantidade || 1),
          preco_unitario: Number(p.preco_unitario || 0),
          subtotal: Number(p.subtotal || 0)
        }))
      }
      
      console.log('Peças formatadas:', pecas)
      
      const osData = sbData as any
      const osCompleta = {
        ...osData,
        cliente_nome: osData.clientes?.nome || '-',
        veiculo_descricao: osData.veiculos 
          ? `${osData.veiculos.marca} ${osData.veiculos.modelo} - ${osData.veiculos.placa}`
          : '-',
        mecanico_nome: osData.mecanicos?.nome || '-',
        status: mapEnglishToPortugueseStatus(osData.status || 'draft'),
        servicos: servicos,
        pecas: pecas
      }
      
      console.log('OS completa montada:', osCompleta)
      console.log('Verificação final - servicos é array?', Array.isArray(osCompleta.servicos), 'Quantidade:', osCompleta.servicos.length)
      console.log('Verificação final - pecas é array?', Array.isArray(osCompleta.pecas), 'Quantidade:', osCompleta.pecas.length)
      
      return osCompleta
    } catch (error: any) {
      toast.error('Erro ao carregar ordem de serviço')
      console.error('Erro completo:', error)
      throw error
    }
  }

  // Gerenciar itens da OS
  const addItem = async (osId: string, item: Partial<OrdemServicoItem>) => {
    try {
      const { error } = await supabase
        .from('os_itens')
        .insert([{ ...item, os_id: osId } as any] as any)

      if (error) throw error
      
      toast.success('Item adicionado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar item')
      throw error
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('os_itens')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      toast.success('Item removido com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover item')
      throw error
    }
  }

  const getItens = async (osId: string) => {
    try {
      const { data, error } = await supabase
        .from('os_itens')
        .select('*')
        .eq('os_id', osId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      return data || []
    } catch (error: any) {
      toast.error('Erro ao carregar itens')
      throw error
    }
  }

  useEffect(() => {
    fetchOrdens()
  }, [])

  return {
    ordens,
    loading,
    fetchOrdens,
    createOrdem,
    updateOrdem,
    deleteOrdem,
    getOrdemById,
    addItem,
    removeItem,
    getItens,
  }
}

// Função para mapear status do Português para Inglês (banco de dados)
const mapPortugueseToEnglishStatus = (portugueseStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'aberta': 'draft',
    'em_andamento': 'in_progress',
    'aguardando_pecas': 'waiting_parts',
    'concluida': 'completed',
    'cancelada': 'cancelled'
  }
  return statusMap[portugueseStatus] || portugueseStatus
}

// Função para mapear status do Inglês para Português (aplicação)
const mapEnglishToPortugueseStatus = (englishStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'draft': 'aberta',
    'in_progress': 'em_andamento',
    'waiting_parts': 'aguardando_pecas',
    'completed': 'concluida',
    'cancelled': 'cancelada'
  }
  return statusMap[englishStatus] || englishStatus
}
