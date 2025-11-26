import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface Agendamento {
  id: string
  cliente_id: string
  veiculo_id: string | null
  mecanico_id: string | null
  data_agendamento: string
  duracao_estimada: number
  servico_descricao: string
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado'
  observacoes: string | null
  lembrete_enviado: boolean
  created_at: string
  updated_at: string
  // Campos relacionados (joins)
  cliente_nome?: string
  veiculo_descricao?: string
  mecanico_nome?: string
}

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgendamentos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clientes!cliente_id (nome),
          veiculos!veiculo_id (marca, modelo, placa),
          mecanicos!mecanico_id (nome)
        `)
        .order('data_agendamento', { ascending: true })
      
      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }
      
      // Formatar os dados para incluir os nomes relacionados
      const agendamentosFormatados = data?.map((ag: any) => ({
        ...ag,
        cliente_nome: ag.clientes?.nome || '-',
        veiculo_descricao: ag.veiculos 
          ? `${ag.veiculos.marca} ${ag.veiculos.modelo} - ${ag.veiculos.placa}`
          : '-',
        mecanico_nome: ag.mecanicos?.nome || '-'
      })) || []
      
      setAgendamentos(agendamentosFormatados)
    } catch (error: any) {
      toast.error('Erro ao carregar agendamentos')
      console.error('Erro completo:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAgendamento = async (agendamento: Partial<Agendamento>) => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      const payload = { ...agendamento, created_by: authData?.user?.id || null }

      const { data, error } = await supabase
        .from('agendamentos')
        .insert([payload as any])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Agendamento criado com sucesso!')
      await fetchAgendamentos()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar agendamento')
      throw error
    }
  }

  const updateAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update(agendamento as any)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Agendamento atualizado com sucesso!')
      await fetchAgendamentos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar agendamento')
      throw error
    }
  }

  const deleteAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Agendamento excluído com sucesso!')
      await fetchAgendamentos()
    } catch (error: any) {
      try {
        const { error: updError } = await supabase
          .from('agendamentos')
          .update({ status: 'cancelado' } as any)
          .eq('id', id)

        if (updError) throw updError
        toast('Exclusão bloqueada; agendamento foi cancelado.', { icon: '⚠️' })
        await fetchAgendamentos()
      } catch (fallbackErr: any) {
        toast.error(error.message || 'Erro ao excluir agendamento')
        throw fallbackErr
      }
    }
  }

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  return {
    agendamentos,
    loading,
    fetchAgendamentos,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
  }
}
