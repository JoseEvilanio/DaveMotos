import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

import type { ProdutoTipo } from '@/types/database'

export interface Produto {
  id: string
  categoria_id: string | null
  codigo: string | null
  nome: string
  descricao: string | null
  tipo: ProdutoTipo
  unidade: string
  preco_custo: number | null
  preco_venda: number
  margem_lucro: number | null
  estoque_minimo: number
  estoque_atual: number
  foto_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  categoria_nome?: string
}

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const uploadImagem = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${crypto?.randomUUID ? crypto.randomUUID() : (Date.now().toString(36))}.${ext}`
    const env: any = (import.meta as any).env || {}
    const bucket = env?.VITE_PRODUCTS_BUCKET || 'produtos'
    const folder = env?.VITE_PRODUCTS_FOLDER || 'produtos'
    const path = `${folder}/${filename}`
    let { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      // If the bucket doesn't exist, we might want to try 'public' as a last resort, 
      // but for now let's stick to the plan of using 'produtos'.
      // If the user hasn't run the migration, this will still fail, which is expected until migration is run.
      console.error('Upload error:', error)
      throw error
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias_produtos: categoria_id (nome)
        `)
        .eq('is_active', true)

      if (error) throw error

      const produtosComCategoria = (data || []).map((produto: any) => ({
        ...produto,
        categoria_nome: produto.categoria_nome || produto.categorias_produtos?.nome || null
      }))
      setProdutos(produtosComCategoria)
    } catch (error: any) {
      toast.error('Erro ao carregar produtos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createProduto = async (produto: Partial<Produto> & { fotoFile?: File | null, fotoRemover?: boolean }) => {
    try {
      let payload: any = { ...produto }
      delete payload.fotoFile
      delete payload.fotoRemover
      if (produto.fotoFile) {
        const url = await uploadImagem(produto.fotoFile)
        payload.foto_url = url
      }
      const { data, error } = await (supabase as any)
        .from('produtos')
        .insert([payload as any])
        .select()
        .single()

      if (error) throw error

      toast.success('Produto cadastrado com sucesso!')
      await fetchProdutos()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar produto')
      throw error
    }
  }

  const updateProduto = async (id: string, produto: Partial<Produto> & { fotoFile?: File | null, fotoRemover?: boolean }) => {
    try {
      let payload: any = { ...produto }
      delete payload.fotoFile
      if (produto.fotoRemover) payload.foto_url = null
      delete payload.fotoRemover
      if (produto.fotoFile) {
        const url = await uploadImagem(produto.fotoFile)
        payload.foto_url = url
      }
      const { error } = await (supabase as any)
        .from('produtos')
        .update(payload as any)
        .eq('id', id)

      if (error) throw error

      toast.success('Produto atualizado com sucesso!')
      await fetchProdutos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar produto')
      throw error
    }
  }

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('produtos')
        .update({ is_active: false } as any)
        .eq('id', id)

      if (error) throw error

      toast.success('Produto excluído com sucesso!')
      await fetchProdutos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir produto')
      throw error
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  return {
    produtos,
    loading,
    fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
  }
}
