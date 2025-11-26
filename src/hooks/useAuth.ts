import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
  const { user, profile, loading, signIn, signOut, initialize } = useAuthStore()

  useEffect(() => {
    // Inicializar autenticação ao montar o componente
    initialize()
  }, [initialize])

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isMecanico: profile?.role === 'mecanico',
    isAtendente: profile?.role === 'atendente',
  }
}
