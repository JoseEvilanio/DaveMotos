export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'mecanico' | 'atendente'
export type OsStatus = 'aberta' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada'
export type PaymentStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado'
export type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'cheque'
export type TransactionType = 'entrada' | 'saida' | 'ajuste'
export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado'
export type ProdutoTipo = 'produto' | 'servico'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
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
          created_by: string | null
        }
        Insert: {
          id?: string
          nome: string
          cpf?: string | null
          rg?: string | null
          data_nascimento?: string | null
          telefone: string
          celular?: string | null
          email?: string | null
          endereco?: string | null
          numero?: string | null
          complemento?: string | null
          bairro?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          foto_url?: string | null
          observacoes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          nome?: string
          cpf?: string | null
          rg?: string | null
          data_nascimento?: string | null
          telefone?: string
          celular?: string | null
          email?: string | null
          endereco?: string | null
          numero?: string | null
          complemento?: string | null
          bairro?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          foto_url?: string | null
          observacoes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      fornecedores: {
        Row: {
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
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['fornecedores']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['fornecedores']['Insert']>
      }
      mecanicos: {
        Row: {
          id: string
          user_id: string | null
          nome: string
          cpf: string | null
          telefone: string
          celular: string | null
          email: string | null
          especialidades: string[] | null
          data_admissao: string | null
          salario: number | null
          comissao_percentual: number | null
          foto_url: string | null
          observacoes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['mecanicos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['mecanicos']['Insert']>
      }
      veiculos: {
        Row: {
          id: string
          cliente_id: string
          marca: string
          modelo: string
          ano: number | null
          cor: string | null
          placa: string
          chassi: string | null
          renavam: string | null
          km_atual: number | null
          fotos_urls: string[] | null
          observacoes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['veiculos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['veiculos']['Insert']>
      }
      categorias_produtos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categorias_produtos']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['categorias_produtos']['Insert']>
      }
      produtos: {
        Row: {
          id: string
          categoria_id: string | null
          codigo: string
          nome: string
          descricao: string | null
          tipo: ProdutoTipo
          unidade: string
          preco_custo: number
          preco_venda: number
          margem_lucro: number | null
          estoque_minimo: number
          estoque_atual: number
          localizacao: string | null
          foto_url: string | null
          is_servico: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['produtos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['produtos']['Insert']>
      }
      servicos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          preco_base: number
          tempo_estimado: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['servicos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['servicos']['Insert']>
      }
      ordens_servico: {
        Row: {
          id: string
          numero_os: number
          cliente_id: string
          veiculo_id: string
          mecanico_id: string | null
          status: OsStatus
          data_abertura: string
          data_previsao: string | null
          data_conclusao: string | null
          km_entrada: number | null
          defeito_reclamado: string
          defeito_constatado: string | null
          servicos_executados: string | null
          observacoes: string | null
          fotos_urls: string[] | null
          valor_pecas: number
          valor_servicos: number
          valor_desconto: number
          valor_total: number
          forma_pagamento: PaymentMethod | null
          status_pagamento: PaymentStatus
          garantia_dias: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['ordens_servico']['Row'], 'id' | 'numero_os' | 'created_at' | 'updated_at'> & {
          id?: string
          numero_os?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['ordens_servico']['Insert']>
      }
      os_itens: {
        Row: {
          id: string
          os_id: string
          produto_id: string | null
          tipo: 'produto' | 'servico'
          descricao: string
          quantidade: number
          preco_unitario: number
          desconto: number
          subtotal: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['os_itens']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['os_itens']['Insert']>
      }
      vendas: {
        Row: {
          id: string
          numero_venda: number
          cliente_id: string | null
          data_venda: string
          valor_produtos: number
          valor_desconto: number
          valor_total: number
          forma_pagamento: PaymentMethod
          status_pagamento: PaymentStatus
          observacoes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['vendas']['Row'], 'id' | 'numero_venda' | 'created_at'> & {
          id?: string
          numero_venda?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vendas']['Insert']>
      }
      agendamentos: {
        Row: {
          id: string
          cliente_id: string
          veiculo_id: string | null
          mecanico_id: string | null
          data_agendamento: string
          duracao_estimada: number
          servico_descricao: string
          status: AppointmentStatus
          observacoes: string | null
          lembrete_enviado: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['agendamentos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['agendamentos']['Insert']>
      }
      configuracoes: {
        Row: {
          id: string
          chave: string
          valor: string | null
          descricao: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['configuracoes']['Row'], 'id' | 'updated_at'> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['configuracoes']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      os_status: OsStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      transaction_type: TransactionType
      appointment_status: AppointmentStatus
      produto_tipo: ProdutoTipo
    }
  }
}
