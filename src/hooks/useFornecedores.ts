import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface Fornecedor {
  id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  inscricao_estadual: string | null
  telefone: string
  celular: string | null
  email: string | null
  site: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  contato_nome: string | null
  contato_telefone: string | null
  observacoes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFornecedores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('is_active', true)
        .order('razao_social', { ascending: true })
      
      if (error) throw error
      
      setFornecedores(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createFornecedor = async (fornecedor: Partial<Fornecedor>) => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([fornecedor])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Fornecedor cadastrado com sucesso!')
      await fetchFornecedores()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar fornecedor')
      throw error
    }
  }

  const updateFornecedor = async (id: string, fornecedor: Partial<Fornecedor>) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .update(fornecedor)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Fornecedor atualizado com sucesso!')
      await fetchFornecedores()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar fornecedor')
      throw error
    }
  }

  const deleteFornecedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Fornecedor excluído com sucesso!')
      await fetchFornecedores()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir fornecedor')
      throw error
    }
  }

  useEffect(() => {
    fetchFornecedores()
  }, [])

  return {
    fornecedores,
    loading,
    fetchFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
  }
}
