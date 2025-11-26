import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  full_name?: string
  role?: string
}

interface AuthState {
  user: User | null
  profile: any | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login com Supabase:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Erro no login:', error.message)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Usuário não encontrado')
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ Perfil não encontrado, criando...', profileError)
      }

      console.log('✅ Login bem-sucedido:', data.user.email)

      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
          full_name: profile?.full_name || data.user.email,
          role: profile?.role || 'atendente',
        },
        profile: profile || null,
        isAuthenticated: true,
        loading: false,
      })
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      console.log('🚪 Fazendo logout...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
      })
      
      console.log('✅ Logout bem-sucedido')
    } catch (error: any) {
      console.error('❌ Erro no logout:', error)
      throw error
    }
  },

  initialize: async () => {
    try {
      console.log('🔄 Inicializando autenticação Supabase...')
      
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ Erro ao obter sessão:', error)
        set({ loading: false })
        return
      }

      if (!session) {
        console.log('ℹ️ Nenhuma sessão ativa')
        set({ loading: false })
        return
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('✅ Sessão restaurada:', session.user.email)

      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name || session.user.email,
          role: profile?.role || 'atendente',
        },
        profile: profile || null,
        isAuthenticated: true,
        loading: false,
      })

      // Listener para mudanças de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 Auth state changed:', event)
        
        if (event === 'SIGNED_OUT') {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          })
        } else if (event === 'SIGNED_IN' && session) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
            },
            isAuthenticated: true,
          })
        }
      })
    } catch (error) {
      console.error('❌ Erro ao inicializar autenticação:', error)
      set({ loading: false })
    }
  },
}))
