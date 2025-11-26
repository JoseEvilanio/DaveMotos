const API_URL = 'http://localhost:3001/api'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'mecanico' | 'atendente'
  phone: string | null
  avatar_url: string | null
  is_active: boolean
}

export interface AuthResponse {
  user: User | null
  session: {
    access_token: string
    user: User
  } | null
  error: Error | null
}

// Simular JWT simples (em produção, use biblioteca adequada)
function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
  }
  return btoa(JSON.stringify(payload))
}

function verifyToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export const auth = {
  // Login
  signInWithPassword: async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          user: null,
          session: null,
          error: new Error(error.error || 'Credenciais inválidas')
        }
      }

      const { user, token } = await response.json()

      // Salvar no localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))

      return {
        user,
        session: {
          access_token: token,
          user
        },
        error: null
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: new Error('Erro ao conectar ao servidor')
      }
    }
  },

  // Logout
  signOut: async () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return { error: null }
  },

  // Obter sessão atual
  getSession: async (): Promise<AuthResponse> => {
    try {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) {
        return {
          user: null,
          session: null,
          error: null
        }
      }

      const payload = verifyToken(token)
      if (!payload) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        return {
          user: null,
          session: null,
          error: new Error('Sessão expirada')
        }
      }

      const user = JSON.parse(userStr)

      return {
        user,
        session: {
          access_token: token,
          user
        },
        error: null
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error
      }
    }
  },

  // Listener de mudanças de autenticação
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Verificar sessão inicial
    auth.getSession().then(({ session }) => {
      if (session) {
        callback('SIGNED_IN', session)
      } else {
        callback('SIGNED_OUT', null)
      }
    })

    // Retornar função de cleanup
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}
