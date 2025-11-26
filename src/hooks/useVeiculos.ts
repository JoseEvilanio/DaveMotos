import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface Veiculo {
  id: string
  cliente_id: string
  marca: string
  modelo: string
  ano: number
  placa: string
  cor: string | null
  chassi: string | null
  renavam: string | null
  km_atual: number | null
  foto_url: string | null
  observacoes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  cliente_nome?: string
}

export const useVeiculos = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVeiculos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('veiculos')
        .select(`
          *,
          clientes!cliente_id (nome)
        `)
        .eq('is_active', true)

      if (error) throw error

      const veiculosFormatados = (data || []).map((veiculo: any) => ({
        ...veiculo,
        cliente_nome: veiculo.cliente_nome || veiculo.clientes?.nome || '-'
      }))
      setVeiculos(veiculosFormatados)
    } catch (error: any) {
      toast.error('Erro ao carregar veículos')
      console.error('Erro completo:', error)
    } finally {
      setLoading(false)
    }
  }

  const createVeiculo = async (veiculo: Partial<Veiculo>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('veiculos')
        .insert([veiculo as any])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Veículo cadastrado com sucesso!')
      await fetchVeiculos()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar veículo')
      throw error
    }
  }

  const updateVeiculo = async (id: string, veiculo: Partial<Veiculo>) => {
    try {
      const { error } = await (supabase as any)
        .from('veiculos')
        .update(veiculo as any)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Veículo atualizado com sucesso!')
      await fetchVeiculos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar veículo')
      throw error
    }
  }

  const deleteVeiculo = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('veiculos')
        .update({ is_active: false } as any)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Veículo excluído com sucesso!')
      await fetchVeiculos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir veículo')
      throw error
    }
  }

  useEffect(() => {
    fetchVeiculos()
  }, [])

  return {
    veiculos,
    loading,
    fetchVeiculos,
    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
  }
}
