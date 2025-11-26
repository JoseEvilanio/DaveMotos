import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export interface Venda {
  id: string
  numero_venda: number
  cliente_id: string | null
  data_venda: string
  valor_produtos: number
  valor_desconto: number
  valor_total: number
  forma_pagamento: string
  status_pagamento: string
  observacoes: string | null
  created_at: string
  // Campos relacionados (joins)
  cliente_nome?: string
}

export interface VendaItem {
  id: string
  venda_id: string
  produto_id: string
  descricao: string
  quantidade: number
  preco_unitario: number
  desconto: number
  subtotal: number
  created_at: string
}

export const useVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVendas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          clientes!cliente_id (nome)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }
      
      // Formatar os dados para incluir os nomes relacionados
      const vendasFormatadas = data?.map((venda: any) => ({
        ...venda,
        cliente_nome: venda.clientes?.nome || 'Cliente Avulso'
      })) || []
      
      setVendas(vendasFormatadas)
    } catch (error: any) {
      toast.error('Erro ao carregar vendas')
      console.error('Erro completo:', error)
    } finally {
      setLoading(false)
    }
  }

  const createVenda = async (venda: Partial<Venda>) => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .insert([venda as any])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Venda criada com sucesso!')
      await fetchVendas()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar venda')
      throw error
    }
  }

  const updateVenda = async (id: string, venda: Partial<Venda>) => {
    try {
      const { error } = await supabase
        .from('vendas')
        .update(venda as any)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Venda atualizada com sucesso!')
      await fetchVendas()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar venda')
      throw error
    }
  }

  const deleteVenda = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Venda excluída com sucesso!')
      await fetchVendas()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir venda')
      throw error
    }
  }

  const getVendaById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          clientes!cliente_id (nome)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }
      
      const vendaData = data as any
      return {
        ...vendaData,
        cliente_nome: vendaData.clientes?.nome || 'Cliente Avulso'
      }
    } catch (error: any) {
      toast.error('Erro ao carregar venda')
      console.error('Erro completo:', error)
      throw error
    }
  }

  // Gerenciar itens da venda
  const addItem = async (vendaId: string, item: Partial<VendaItem>) => {
    try {
      const { error } = await supabase
        .from('vendas_itens')
        .insert([{ ...item, venda_id: vendaId } as any])

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
        .from('vendas_itens')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      toast.success('Item removido com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover item')
      throw error
    }
  }

  const getItens = async (vendaId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendas_itens')
        .select('*')
        .eq('venda_id', vendaId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      return data || []
    } catch (error: any) {
      toast.error('Erro ao carregar itens')
      throw error
    }
  }

  useEffect(() => {
    fetchVendas()
  }, [])

  return {
    vendas,
    loading,
    fetchVendas,
    createVenda,
    updateVenda,
    deleteVenda,
    getVendaById,
    addItem,
    removeItem,
    getItens,
  }
}
