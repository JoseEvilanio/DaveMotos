import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type MecanicoRow = Database['public']['Tables']['mecanicos']['Row']
type MecanicoInsert = Database['public']['Tables']['mecanicos']['Insert']
type MecanicoUpdate = Database['public']['Tables']['mecanicos']['Update']

export type Mecanico = MecanicoRow

export const useMecanicos = () => {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [loading, setLoading] = useState(true)

  // Tipos já definidos acima

  const fetchMecanicos = async () => {
    try {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('mecanicos')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      setMecanicos((data as MecanicoRow[]) || [])
    } catch (error: any) {
      toast.error('Erro ao carregar mecânicos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createMecanico = async (mecanico: Partial<Mecanico>) => {
    try {
      const payload = mecanico as MecanicoInsert
      const { data, error } = await (supabase as any)
        .from('mecanicos')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      
      toast.success('Mecânico cadastrado com sucesso!')
      await fetchMecanicos()
      return data
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar mecânico')
      throw error
    }
  }

  const updateMecanico = async (id: string, mecanico: Partial<Mecanico>) => {
    try {
      const payload = mecanico as MecanicoUpdate
      const { error } = await (supabase as any)
        .from('mecanicos')
        .update(payload)
        .eq('id', id)

      if (error) throw error
      
      toast.success('Mecânico atualizado com sucesso!')
      await fetchMecanicos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar mecânico')
      throw error
    }
  }

  const deleteMecanico = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('mecanicos')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Mecânico excluído com sucesso!')
      await fetchMecanicos()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir mecânico')
      throw error
    }
  }

  useEffect(() => {
    fetchMecanicos()
  }, [])

  return {
    mecanicos,
    loading,
    fetchMecanicos,
    createMecanico,
    updateMecanico,
    deleteMecanico,
  }
}
