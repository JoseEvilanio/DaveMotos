import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface TipoServico {
  id: string
  nome: string
  descricao: string | null
  preco_base: number
  tempo_estimado: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useTiposServicos = () => {
  const [tiposServicos, setTiposServicos] = useState<TipoServico[]>([])
  const [loading, setLoading] = useState(true)
  

  const resolveServiceTypesTable = async (): Promise<'tipos_servicos' | 'service_types' | null> => {
    // Primeiro tenta a tabela em português
    const { error: ptError } = await supabase
      .from('tipos_servicos')
      .select('id')
      .limit(1)

    if (!ptError) {
      return 'tipos_servicos'
    }

    // Se não existir, tenta a tabela em inglês
    const { error: enError } = await supabase
      .from('service_types')
      .select('id')
      .limit(1)

    if (!enError) {
      return 'service_types'
    }

    // Nenhuma das tabelas existe
    return null
  }

  const fetchTiposServicos = async () => {
    try {
      setLoading(true)
      const tableNome = await resolveServiceTypesTable()

      if (!tableNome) {
        toast.error('Tabela de Tipos de Serviço não encontrada (tipos_servicos/service_types)')
        setTiposServicos([])
        return
      }

      if (tableNome === 'tipos_servicos') {
        const { data, error } = await supabase
          .from('tipos_servicos')
          .select('*')
          .eq('is_active', true)
          .order('nome', { ascending: true })

        if (error) throw error
        setTiposServicos(Array.isArray(data) ? (data as any) : [])
      } else {
        const { data, error } = await supabase
          .from('service_types')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) throw error
        const mapped = (Array.isArray(data) ? data : []).map((row: any) => ({
          id: row.id,
          nome: row.name,
          descricao: row.description ?? null,
          preco_base: Number(row.base_price ?? 0),
          tempo_estimado: row.estimated_time ?? null,
          is_active: !!row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at,
        })) as TipoServico[]
        setTiposServicos(mapped)
      }
    } catch (error: any) {
      toast.error('Erro ao carregar tipos de serviços')
      console.error(error)
      setTiposServicos([])
    } finally {
      setLoading(false)
    }
  }

  const createTipoServico = async (tipoServico: Partial<TipoServico>) => {
    try {
      const tableNome = await resolveServiceTypesTable()
      if (!tableNome) throw new Error('Tabela de Tipos de Serviço não existe no banco')
      const isEnglish = tableNome === 'service_types'
      const teVal = (tipoServico as any).tempo_estimado
      const teHas = !(teVal === null || teVal === undefined || teVal === '')
      const teNumber = teHas ? Number(teVal) : null
      const payload = isEnglish
        ? [{
            name: tipoServico.nome!,
            description: tipoServico.descricao ?? null,
            base_price: Number(tipoServico.preco_base ?? 0),
            estimated_time: teNumber,
            is_active: true,
          }]
        : [{
            nome: tipoServico.nome!,
            descricao: tipoServico.descricao ?? null,
            preco_base: Number(tipoServico.preco_base ?? 0),
            tempo_estimado: teNumber,
            is_active: true,
          }]
      // Tenta inserir normalmente; se ocorrer PGRST204 (coluna não existe), reenvia sem tempo_estimado
      const { data, error } = await supabase
        .from(isEnglish ? 'service_types' : 'tipos_servicos')
        .insert(payload)
        .select('*')

      let insertedData: any = data
      if (error) {
        const code = (error as any).code
        const msg = String((error as any).message || '')
        if (!isEnglish && (code === 'PGRST204' || msg.toLowerCase().includes('tempo_estimado'))) {
          const payloadSemTempo = [{
            nome: (payload[0] as any).nome,
            descricao: (payload[0] as any).descricao,
            preco_base: (payload[0] as any).preco_base,
            is_active: (payload[0] as any).is_active,
          }]
          const { data: data2, error: err2 } = await supabase
            .from('tipos_servicos')
            .insert(payloadSemTempo)
            .select('*')
          if (err2) throw err2
          insertedData = data2
          toast('Banco sem coluna tempo_estimado em tipos_servicos. Salvando sem essa informação.')
        } else {
          throw error
        }
      }

      toast.success('Tipo de serviço cadastrado com sucesso!')
      await fetchTiposServicos()
      return insertedData
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar tipo de serviço')
      throw error
    }
  }

  const updateTipoServico = async (id: string, tipoServico: Partial<TipoServico>) => {
    try {
      const tableNome = await resolveServiceTypesTable()
      if (!tableNome) throw new Error('Tabela de Tipos de Serviço não existe no banco')
      const isEnglish = tableNome === 'service_types'
      const teValUp = (tipoServico as any).tempo_estimado
      const teHasUp = !(teValUp === null || teValUp === undefined || teValUp === '')
      const teNumberUp = teHasUp ? Number(teValUp) : null
      const updatePayload = isEnglish
        ? {
            name: tipoServico.nome,
            description: tipoServico.descricao ?? null,
            base_price: Number(tipoServico.preco_base ?? 0),
            estimated_time: teNumberUp,
          }
        : {
            nome: tipoServico.nome,
            descricao: tipoServico.descricao ?? null,
            preco_base: Number(tipoServico.preco_base ?? 0),
            tempo_estimado: teNumberUp,
          }
      // Tenta atualizar; se PGRST204, reenvia sem tempo_estimado
      const { error } = await supabase
        .from(isEnglish ? 'service_types' : 'tipos_servicos')
        .update(updatePayload)
        .eq('id', id)

      if (error) {
        const code = (error as any).code
        const msg = String((error as any).message || '')
        if (!isEnglish && (code === 'PGRST204' || msg.toLowerCase().includes('tempo_estimado'))) {
          const { tempo_estimado, ...semTempo } = updatePayload as any
          const { error: err2 } = await supabase
            .from('tipos_servicos')
            .update(semTempo)
            .eq('id', id)
          if (err2) throw err2
          toast('Banco sem coluna tempo_estimado em tipos_servicos. Atualizando demais campos.')
        } else {
          throw error
        }
      }

      toast.success('Tipo de serviço atualizado com sucesso!')
      await fetchTiposServicos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar tipo de serviço')
      throw error
    }
  }

  const deleteTipoServico = async (id: string) => {
    try {
      const tableNome = await resolveServiceTypesTable()
      if (!tableNome) throw new Error('Tabela de Tipos de Serviço não existe no banco')
      const isEnglish = tableNome === 'service_types'
      const { error } = await supabase
        .from(isEnglish ? 'service_types' : 'tipos_servicos')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Tipo de serviço excluído com sucesso!')
      await fetchTiposServicos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir tipo de serviço')
      throw error
    }
  }

  useEffect(() => {
    fetchTiposServicos()
  }, [])

  return {
    tiposServicos,
    loading,
    fetchTiposServicos,
    createTipoServico,
    updateTipoServico,
    deleteTipoServico,
  }
}
