import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface Cliente {
  id: string
  nome: string
  cpf: string | null
  rg: string | null
  data_nascimento: string | null
  telefone: string
  celular: string | null
  email: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  foto_url: string | null
  observacoes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      setClientes(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar clientes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createCliente = async (cliente: Partial<Cliente>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Cliente cadastrado com sucesso!')
      await fetchClientes()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar cliente')
      throw error
    }
  }

  const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Cliente atualizado com sucesso!')
      await fetchClientes()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar cliente')
      throw error
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      // Soft delete - apenas marca como inativo
      const { error } = await supabase
        .from('clientes')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Cliente excluído com sucesso!')
      await fetchClientes()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cliente')
      throw error
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return {
    clientes,
    loading,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  }
}
