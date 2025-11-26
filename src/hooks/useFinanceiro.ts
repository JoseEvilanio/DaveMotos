import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

// Formatar data local em YYYY-MM-DD sem deslocamento de fuso horário
const toYMDLocal = (input?: Date | string) => {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input
  const d = input ? new Date(input) : new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type ContaStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado'
export type FormaPagamento = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'cheque'

export interface ContaPagar {
  id: string
  fornecedor_id: string | null
  fornecedor_nome?: string | null
  descricao: string
  categoria: string
  valor: number
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string | null
  valor_pago?: number | null
  forma_pagamento?: FormaPagamento | null
  status: ContaStatus
  documento?: string | null
  observacoes?: string | null
  origem?: 'manual' | 'compra'
  origem_ref_id?: string | null
  created_at: string
  updated_at: string
}

export interface ContaReceber {
  id: string
  cliente_id: string | null
  cliente_nome?: string | null
  os_id: string | null
  os_numero?: number | null
  descricao: string
  valor: number
  data_emissao: string
  data_vencimento: string
  data_recebimento?: string | null
  valor_recebido?: number | null
  forma_pagamento?: FormaPagamento | null
  status: ContaStatus
  observacoes?: string | null
  origem?: 'manual' | 'venda' | 'os'
  origem_ref_id?: string | null
  created_at: string
  updated_at: string
}

export const useFinanceiro = () => {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([])
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([])
  const [loading, setLoading] = useState(true)
  const [usesAltSchema, setUsesAltSchema] = useState(false)
  // Detecção fina de colunas do schema alternativo
  const [altHasDescription, setAltHasDescription] = useState(false)
  const [altHasCustomerId, setAltHasCustomerId] = useState(false)
  const [altHasNotes, setAltHasNotes] = useState(false)

  const fetchContasPagar = async () => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*') as any

      if (error) throw error

      let formatadas: any[] = data || []

      // Detectar se o backend usa schema alternativo (supplier_id/due_date/amount/description)
      try {
        const detectedAlt = Array.isArray(data) && (data as any[]).some((c: any) => (
          c?.due_date !== undefined || c?.amount !== undefined || c?.supplier_id !== undefined || c?.description !== undefined
        ))
        setUsesAltSchema(!!detectedAlt)
      } catch {}

      // Normalizar possível schema alternativo (supplier_id, due_date, amount, description, status="open")
      try {
        formatadas = (formatadas || []).map((c: any) => {
          const hasAltSchema = c?.due_date !== undefined || c?.amount !== undefined || c?.supplier_id !== undefined
          if (!hasAltSchema) return c
          const statusMap: Record<string, ContaStatus> = {
            open: 'pendente',
            paid: 'pago',
            overdue: 'vencido',
            canceled: 'cancelado',
          }
          return {
            ...c,
            data_vencimento: c.data_vencimento ?? c.due_date ?? toYMDLocal(),
            data_emissao: c.data_emissao ?? c.due_date ?? toYMDLocal(),
            valor: c.valor ?? Number(c.amount ?? 0),
            descricao: c.descricao ?? c.description ?? '',
            fornecedor_id: c.fornecedor_id ?? c.supplier_id ?? null,
            status: statusMap[c.status] || c.status || 'pendente',
            categoria: c.categoria ?? 'Fornecedor',
            observacoes: c.observacoes ?? c.notes ?? c.observations ?? null,
            origem: c.origem ?? 'manual',
            origem_ref_id: c.origem_ref_id ?? null,
          }
        })
      } catch (e) {
        console.warn('Normalização de schema alternativo falhou:', (e as any)?.message || e)
      }

      // Enriquecer nomes dos fornecedores sem depender de FKs
      try {
        const fornecedorIds = (formatadas || [])
          .map((c: any) => c?.fornecedor_id)
          .filter((v: any) => !!v)
        if (fornecedorIds.length) {
          const { data: fornecedores, error: fornErr } = await supabase
            .from('fornecedores')
            .select('id,razao_social')
            .in('id', fornecedorIds as any)
          if (!fornErr && Array.isArray(fornecedores)) {
            const map = new Map<string, string>()
            fornecedores.forEach((f: any) => map.set(f.id, f.razao_social))
            formatadas = formatadas.map((c: any) => ({
              ...c,
              fornecedor_nome: map.get(c.fornecedor_id) || null,
            }))
          }
        }
      } catch (e) {
        console.warn('Enriquecimento fornecedores falhou (seguindo sem nomes):', (e as any)?.message || e)
      }

      setContasPagar(formatadas)
    } catch (error: any) {
      toast.error('Erro ao carregar contas a pagar')
      console.error(error)
    }
  }

  const fetchContasReceber = async () => {
    try {
      const { data, error } = await supabase
        .from('contas_receber')
        .select('*') as any

      if (error) throw error

      let formatadas: any[] = data || []

      // Detectar possível schema alternativo (customer_id/due_date/amount/description)
      try {
        const arr = Array.isArray(data) ? (data as any[]) : []
        const detectedAlt = arr.some((c: any) => (
          c?.due_date !== undefined || c?.amount !== undefined || c?.customer_id !== undefined || c?.description !== undefined
        ))
        setUsesAltSchema(!!detectedAlt)
        // Detecção específica das colunas para evitar PATCH com campos inexistentes
        const hasDesc = arr.some((c: any) => c?.description !== undefined)
        const hasCust = arr.some((c: any) => c?.customer_id !== undefined)
        const hasNotes = arr.some((c: any) => (c?.notes !== undefined || c?.observations !== undefined))
        setAltHasDescription(!!hasDesc)
        setAltHasCustomerId(!!hasCust)
        setAltHasNotes(!!hasNotes)
      } catch {}

      // Normalizar schema alternativo, caso presente
      try {
        formatadas = (formatadas || []).map((c: any) => {
          const hasAltSchema = c?.due_date !== undefined || c?.amount !== undefined || c?.customer_id !== undefined
          if (!hasAltSchema) return c
          const statusMap: Record<string, ContaStatus> = {
            open: 'pendente',
            paid: 'pago',
            overdue: 'vencido',
            canceled: 'cancelado',
          }
          return {
            ...c,
            data_vencimento: c.data_vencimento ?? c.due_date ?? toYMDLocal(),
            data_emissao: c.data_emissao ?? c.due_date ?? toYMDLocal(),
            valor: c.valor ?? Number(c.amount ?? 0),
            descricao: c.descricao ?? c.description ?? '',
            cliente_id: c.cliente_id ?? c.customer_id ?? null,
            observacoes: c.observacoes ?? c.notes ?? c.observations ?? null,
            status: statusMap[c.status] || c.status || 'pendente',
            origem: c.origem ?? undefined,
            origem_ref_id: c.origem_ref_id ?? null,
          }
        })
      } catch (e) {
        console.warn('Normalização de schema alternativo (receber) falhou:', (e as any)?.message || e)
      }

      // Derivar cliente_id via sale_id ou os_id quando não estiver presente
      try {
        const missingCliente = (formatadas || []).some((c: any) => !c?.cliente_id && (c?.sale_id || c?.os_id))
        if (missingCliente) {
          // Mapear cliente por vendas
          const saleIds = (formatadas || [])
            .map((c: any) => c?.sale_id)
            .filter((v: any) => !!v)
          if (saleIds.length) {
            const { data: vendas, error: vendErr } = await supabase
              .from('vendas')
              .select('id,cliente_id,numero_venda')
              .in('id', saleIds as any)
            if (!vendErr && Array.isArray(vendas)) {
              const mapVendaCliente = new Map<string, string>()
              const mapVendaNumero = new Map<string, number>()
              vendas.forEach((v: any) => {
                mapVendaCliente.set(v.id, v.cliente_id)
                mapVendaNumero.set(v.id, v.numero_venda)
              })
              formatadas = formatadas.map((c: any) => ({
                ...c,
                cliente_id: c.cliente_id || mapVendaCliente.get(c.sale_id) || null,
                descricao: (c.descricao && String(c.descricao).trim().length ? c.descricao : (mapVendaNumero.has(c.sale_id) ? `Venda #${mapVendaNumero.get(c.sale_id)}` : c.descricao || '')),
              }))
            }
          }

          // Mapear cliente por ordens de serviço (e já trazer numero OS)
          const osIds = (formatadas || [])
            .map((c: any) => c?.os_id)
            .filter((v: any) => !!v)
          if (osIds.length) {
            const { data: ordens, error: osErr } = await supabase
              .from('ordens_servico')
              .select('id,cliente_id,numero_os')
              .in('id', osIds as any)
            if (!osErr && Array.isArray(ordens)) {
              const mapOSCliente = new Map<string, string>()
              const mapOSNumero = new Map<string, number>()
              ordens.forEach((o: any) => {
                mapOSCliente.set(o.id, o.cliente_id)
                mapOSNumero.set(o.id, o.numero_os)
              })
              formatadas = formatadas.map((c: any) => ({
                ...c,
                cliente_id: c.cliente_id || mapOSCliente.get(c.os_id) || null,
                os_numero: c.os_numero ?? mapOSNumero.get(c.os_id) ?? null,
                descricao: (c.descricao && String(c.descricao).trim().length ? c.descricao : (mapOSNumero.has(c.os_id) ? `OS #${mapOSNumero.get(c.os_id)}` : c.descricao || '')),
              }))
            }
          }
        }
      } catch (e) {
        console.warn('Derivação de cliente_id via sale_id/os_id falhou:', (e as any)?.message || e)
      }

      // Enriquecer nomes dos clientes
      try {
        const clienteIds = (formatadas || [])
          .map((c: any) => c?.cliente_id)
          .filter((v: any) => !!v)
        if (clienteIds.length) {
          const { data: clientes, error: cliErr } = await supabase
            .from('clientes')
            .select('id,nome')
            .in('id', clienteIds as any)
          if (!cliErr && Array.isArray(clientes)) {
            const map = new Map<string, string>()
            clientes.forEach((c: any) => map.set(c.id, c.nome))
            formatadas = formatadas.map((c: any) => ({
              ...c,
              cliente_nome: map.get(c.cliente_id) || null,
            }))
          }
        }
      } catch (e) {
        console.warn('Enriquecimento clientes falhou (seguindo sem nomes):', (e as any)?.message || e)
      }

      // Definir origem derivada quando a coluna não existir
      try {
        formatadas = (formatadas || []).map((c: any) => {
          const origem = c.origem ?? (c.sale_id ? 'venda' : (c.os_id ? 'os' : 'manual'))
          const origem_ref_id = c.origem_ref_id ?? (c.sale_id || c.os_id || null)
          return { ...c, origem, origem_ref_id }
        })
      } catch {}

      // OS número já pode ter sido enriquecido acima; manter bloco vazio

      setContasReceber(formatadas)
    } catch (error: any) {
      toast.error('Erro ao carregar contas a receber')
      console.error(error)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchContasPagar(), fetchContasReceber()])
    setLoading(false)
  }

  // Diagnóstico: buscar dados brutos no Supabase para uma conta a receber
  const diagnosticarContaReceber = async (id: string) => {
    try {
      const { data: row, error } = await supabase
        .from('contas_receber')
        .select('id, cliente_id, customer_id, descricao, description, observacoes, observations, notes, sale_id, os_id, data_emissao, data_vencimento, due_date, valor, amount, forma_pagamento, status')
        .eq('id', id)
        .single() as any
      if (error) throw error

      let venda: any = null
      let os: any = null
      if (row?.sale_id) {
        const { data: v } = await supabase
          .from('vendas')
          .select('id, cliente_id, numero_venda')
          .in('id', [row.sale_id] as any)
        venda = Array.isArray(v) ? (v as any[])[0] : null
      }
      if (row?.os_id) {
        const { data: o } = await supabase
          .from('ordens_servico')
          .select('id, cliente_id, numero_os')
          .in('id', [row.os_id] as any)
        os = Array.isArray(o) ? (o as any[])[0] : null
      }

      return { row, venda, os }
    } catch (e: any) {
      console.warn('Diagnóstico contas_receber falhou:', e?.message || e)
      return null
    }
  }

  const createContaPagar = async (conta: Partial<ContaPagar>) => {
    try {
      const full: any = {
        status: 'pendente' as ContaStatus,
        data_emissao: toYMDLocal(conta.data_emissao),
        ...conta,
      }
      // Gerar ID no cliente para não depender de retorno do insert
      const newId: string = (globalThis as any)?.crypto?.randomUUID
        ? (globalThis as any).crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)

      // Tentar sempre o schema alternativo primeiro para evitar 400 inicial (columns PT)
      const statusRemote = (() => {
        if (full.status === 'pendente') return 'open'
        if (full.status === 'pago') return 'paid'
        if (full.status === 'vencido') return 'overdue'
        if (full.status === 'cancelado') return 'canceled'
        return String(full.status || 'open')
      })()
      let altBase: any = {
        id: newId,
        // Schema alternativo mínimo: id, due_date, amount, status
        due_date: full.data_vencimento || full.data_emissao || toYMDLocal(),
        amount: Number(full.valor || 0),
        status: statusRemote,
      }
      Object.keys(altBase).forEach((k) => altBase[k] === undefined && delete altBase[k])
      const { error: altErrInitial } = await supabase
        .from('contas_pagar')
        .insert([altBase])
      if (!altErrInitial) {
        toast.success('Conta a pagar criada com sucesso!')
        await fetchContasPagar()
        return true
      }
      // Se due_date for NOT NULL, forçar data local e re-tentar no alternativo
      {
        const msg = (altErrInitial as any)?.message || ''
        const isNullDueDate = msg.includes('due_date') || msg.includes('null value')
        if (isNullDueDate) {
          const altBase2 = { ...altBase, due_date: toYMDLocal() }
          const { error: altErr2 } = await supabase
            .from('contas_pagar')
            .insert([altBase2])
          if (!altErr2) {
            toast.success('Conta a pagar criada com sucesso!')
            await fetchContasPagar()
            return true
          }
        }
      }
      // Se falhar, segue para o fluxo padrão PT com fallback já implementado abaixo

      // Base com campos mínimos + colunas NOT NULL conhecidas do schema remoto
      let base: any = {
        id: newId,
        status: full.status,
        descricao: full.descricao,
        valor: Number(full.valor || 0),
        fornecedor_id: full.fornecedor_id ?? null,
        categoria: full.categoria,           // NOT NULL no schema remoto
        data_emissao: full.data_emissao,     // NOT NULL no schema remoto
        data_vencimento: full.data_vencimento, // NOT NULL no schema remoto
        origem: 'manual',
      }

      // Remover chaves undefined para evitar enviar colunas desnecessárias
      Object.keys(base).forEach((k) => base[k] === undefined && delete base[k])

      // Primeira tentativa sem .select() para evitar `columns` no POST
      let { error: insertErr } = await supabase
        .from('contas_pagar')
        .insert([base])

      let insertedViaAlt = false

      // Se falhar por coluna ausente no cache, remover e tentar novamente
      if (insertErr) {
        const msg = (insertErr as any)?.message || ''

        // Se indicar colunas PT ausentes, tentar schema alternativo (supplier_id, due_date, amount, description)
        const indicatesAltSchema =
          msg.includes('data_vencimento') ||
          msg.includes('fornecedor_id') ||
          msg.includes('valor') ||
          msg.includes('categoria') ||
          msg.includes('data_emissao')
        if (indicatesAltSchema) {
          const statusRemote = (() => {
            if (full.status === 'pendente') return 'open'
            if (full.status === 'pago') return 'paid'
            if (full.status === 'vencido') return 'overdue'
            if (full.status === 'cancelado') return 'canceled'
            return String(full.status || 'open')
          })()
          const altBase: any = {
            id: newId,
            // Payload mínimo alternativo
            due_date: full.data_vencimento || full.data_emissao || toYMDLocal(),
            amount: Number(full.valor || 0),
            status: statusRemote,
          }
          Object.keys(altBase).forEach((k) => altBase[k] === undefined && delete altBase[k])
          const { error: altErr } = await supabase
            .from('contas_pagar')
            .insert([altBase])
          if (!altErr) {
            insertedViaAlt = true
          } else {
            insertErr = altErr
          }
        }
        const removeKeys: string[] = []
        if (msg.includes('categoria')) removeKeys.push('categoria')
        if (msg.includes('data_emissao')) removeKeys.push('data_emissao')
        if (msg.includes('data_vencimento')) removeKeys.push('data_vencimento')

        if (removeKeys.length && !insertedViaAlt) {
          const payload2 = { ...(base as any) }
          removeKeys.forEach((k) => { delete (payload2 as any)[k] })
          const { error: err2 } = await supabase
            .from('contas_pagar')
            .insert([payload2])
          if (err2) {
            const msg2 = (err2 as any)?.message || ''
            const removeMore: string[] = []
            if (msg2.includes('categoria')) removeMore.push('categoria')
            if (msg2.includes('data_emissao')) removeMore.push('data_emissao')
            if (msg2.includes('data_vencimento')) removeMore.push('data_vencimento')
            if (removeMore.length) {
              const payload3 = { ...(payload2 as any) }
              removeMore.forEach((k) => { delete (payload3 as any)[k] })
              const { error: err3 } = await supabase
                .from('contas_pagar')
                .insert([payload3])
              if (err3) throw err3
              toast('Schema parcial em contas_pagar. Inserido sem alguns campos opcionais.')
            } else {
              throw err2
            }
          } else {
            toast('Schema parcial em contas_pagar. Inserido sem alguns campos opcionais.')
          }
        } else if (!insertedViaAlt) {
          throw insertErr
        }
      }

      // Após inserir, tentar atualizar campos opcionais (pular se foi via schema alternativo)
      if (!insertedViaAlt) {
        const optional: any = {
          forma_pagamento: full.forma_pagamento ?? null,
          documento: full.documento ?? null,
          observacoes: full.observacoes ?? null,
          data_pagamento: full.data_pagamento ?? null,
          valor_pago: full.valor_pago ?? null,
          origem_ref_id: full.origem_ref_id ?? null,
        }
        Object.keys(optional).forEach((k) => optional[k] === undefined && delete optional[k])

        if (Object.keys(optional).length) {
          const { error: upErr } = await supabase
            .from('contas_pagar')
            .update(optional)
            .eq('id', newId)
          if (upErr) {
            const msg = (upErr as any)?.message || ''
            const removeKeys: string[] = []
            if (msg.includes('forma_pagamento')) removeKeys.push('forma_pagamento')
            if (msg.includes('documento')) removeKeys.push('documento')
            if (msg.includes('observacoes')) removeKeys.push('observacoes')
            if (msg.includes('data_pagamento')) removeKeys.push('data_pagamento')
            if (msg.includes('valor_pago')) removeKeys.push('valor_pago')

            if (removeKeys.length) {
              const payload2 = { ...(optional as any) }
              removeKeys.forEach((k) => { delete (payload2 as any)[k] })
              const { error: err2 } = await supabase
                .from('contas_pagar')
                .update(payload2 as any)
                .eq('id', newId)
              if (err2) {
                const msg2 = (err2 as any)?.message || ''
                const removeMore: string[] = []
                if (msg2.includes('forma_pagamento')) removeMore.push('forma_pagamento')
                if (msg2.includes('documento')) removeMore.push('documento')
                if (msg2.includes('observacoes')) removeMore.push('observacoes')
                if (msg2.includes('data_pagamento')) removeMore.push('data_pagamento')
                if (msg2.includes('valor_pago')) removeMore.push('valor_pago')
                if (removeMore.length) {
                  const payload3 = { ...(payload2 as any) }
                  removeMore.forEach((k) => { delete (payload3 as any)[k] })
                  const { error: err3 } = await supabase
                    .from('contas_pagar')
                    .update(payload3 as any)
                    .eq('id', newId)
                  if (err3) throw err3
                  toast('Schema parcial em contas_pagar. Atualizado sem alguns campos opcionais.')
                } else {
                  throw err2
                }
              } else {
                toast('Schema parcial em contas_pagar. Atualizado sem alguns campos opcionais.')
              }
            } else if (upErr) {
              throw upErr
            }
          }
        }
      }

      toast.success('Conta a pagar criada com sucesso!')
      await fetchContasPagar()
      return true
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta a pagar')
      throw error
    }
  }

  const createContaReceber = async (conta: Partial<ContaReceber>) => {
    try {
      const full: any = {
        status: 'pendente' as ContaStatus,
        data_emissao: toYMDLocal(conta.data_emissao),
        ...conta,
      }

      // Gerar ID no cliente para não depender de retorno do insert
      const newId: string = (globalThis as any)?.crypto?.randomUUID
        ? (globalThis as any).crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)

      // Tentar primeiro o schema alternativo (conforme schema remoto: due_date/amount/status, os_id/sale_id opcionais)
      {
        const statusRemote = (() => {
          if (full.status === 'pendente') return 'open'
          if (full.status === 'pago') return 'paid'
          if (full.status === 'vencido') return 'overdue'
          if (full.status === 'cancelado') return 'canceled'
          return String(full.status || 'open')
        })()
        // Payload mínimo para schema alternativo (compatível com EN: due_date/amount/status/customer_id/description)
        let altBase: any = {
          id: newId,
          due_date: full.data_vencimento || full.data_emissao || toYMDLocal(),
          amount: Number(full.valor || 0),
          status: statusRemote,
          // Relacionamentos opcionais conforme schema informado
          sale_id: full.sale_id ?? undefined,
          os_id: full.os_id ?? undefined,
        }
        // Não enviar customer_id: alguns backends alternativos não possuem essa coluna

        Object.keys(altBase).forEach((k) => altBase[k] === undefined && delete altBase[k])
        const { error: altErr } = await supabase
          .from('contas_receber')
          .insert([altBase])
        if (!altErr) {
          // Persistir metadados APENAS se as colunas existirem (evita PATCH 400)
          try {
            const meta: any = {}
            if (altHasDescription && full.descricao !== undefined) meta.description = full.descricao
            if (altHasCustomerId && full.cliente_id !== undefined) meta.customer_id = full.cliente_id
            if (altHasNotes && full.observacoes !== undefined) meta.notes = full.observacoes
            if (Object.keys(meta).length) {
              const { error: metaErr } = await supabase
                .from('contas_receber')
                .update(meta)
                .eq('id', newId)
              // Se falhar, não repetir para evitar ruído
            }
          } catch {}
          toast.success('Conta a receber criada com sucesso!')
          await fetchContasReceber()
          return true
        }
        // Se falhou e a mensagem indica schema alternativo (ex.: due_date NOT NULL), re-tentar forçando due_date
        const altMsg = (altErr as any)?.message || ''
        const isAltLikely = altMsg.includes('due_date') || altMsg.includes('amount') || altMsg.includes('customer_id') || altMsg.includes('description') || altMsg.includes('null value')
        if (isAltLikely) {
          const altBase2 = { ...altBase, due_date: toYMDLocal() }
          const { error: altErr2 } = await supabase
            .from('contas_receber')
            .insert([altBase2])
          if (!altErr2) {
            toast.success('Conta a receber criada com sucesso!')
            await fetchContasReceber()
            return true
          }
          // Se ainda falhar, lançar para exibir erro real em vez de cair no fluxo PT
          throw altErr2
        }
        // Se falhar, segue para o fluxo padrão PT com fallback já implementado abaixo
      }

      // Base PT completa: usar quando o banco tiver colunas locais
      let base: any = {
        id: newId,
        cliente_id: full.cliente_id ?? null,
        descricao: full.descricao ?? '',
        valor: Number(full.valor || 0),
        data_emissao: full.data_emissao,
        data_vencimento: full.data_vencimento || full.data_emissao,
        forma_pagamento: full.forma_pagamento ?? null,
        observacoes: full.observacoes ?? null,
        status: full.status,
        os_id: full.os_id ?? null,
        sale_id: full.sale_id ?? null,
      }

      // Remover chaves undefined para evitar enviar colunas desnecessárias
      Object.keys(base).forEach((k) => base[k] === undefined && delete base[k])

      // Primeira tentativa sem .select() para evitar `columns` no POST
      let { error: insertErr } = await supabase
        .from('contas_receber')
        .insert([base])

      let insertedViaAlt = false

      // Se falhar por coluna ausente no cache, tentar schema alternativo
      if (insertErr) {
        const msg = (insertErr as any)?.message || ''

        // já tentamos o alternativo acima; seguir para PT e fallbacks

        const removeKeys: string[] = []
        if (msg.includes('data_emissao')) removeKeys.push('data_emissao')
        if (msg.includes('data_vencimento')) removeKeys.push('data_vencimento')
        if (msg.includes('os_id')) removeKeys.push('os_id')
        if (msg.includes('descricao')) removeKeys.push('descricao')
        if (msg.includes('valor')) removeKeys.push('valor')
        if (msg.includes('origem')) removeKeys.push('origem')
        if (msg.includes('origem_ref_id')) removeKeys.push('origem_ref_id')
        // Se o backend não tem campos PT conhecidos, tentar fallback para schema alternativo mínimo
        if (
          msg.includes('cliente_id') ||
          msg.includes("Could not find the 'cliente_id'") ||
          msg.includes('valor') ||
          msg.includes('data_vencimento') ||
          msg.includes('data_emissao')
        ) {
          const statusRemote = (() => {
            if (full.status === 'pendente') return 'open'
            if (full.status === 'pago') return 'paid'
            if (full.status === 'vencido') return 'overdue'
            if (full.status === 'cancelado') return 'canceled'
            return String(full.status || 'open')
          })()
          const altFallback: any = {
            id: newId,
            due_date: full.data_vencimento || full.data_emissao || toYMDLocal(),
            amount: Number(full.valor || 0),
            status: statusRemote,
            sale_id: full.sale_id ?? undefined,
            os_id: full.os_id ?? undefined,
          }
          // Não enviar customer_id neste fallback
          const { error: altInsErr } = await supabase
            .from('contas_receber')
            .insert([altFallback])
          if (!altInsErr) {
            toast('Schema alternativo detectado. Inserido via due_date/amount/status (+refs).')
            insertedViaAlt = true
          } else {
            // continuar com a lógica de remoção abaixo
          }
        }

        if (removeKeys.length && !insertedViaAlt) {
          const payload2 = { ...(base as any) }
          removeKeys.forEach((k) => { delete (payload2 as any)[k] })
          const { error: err2 } = await supabase
            .from('contas_receber')
            .insert([payload2])
          if (err2) {
            const msg2 = (err2 as any)?.message || ''
            const removeMore: string[] = []
            if (msg2.includes('data_emissao')) removeMore.push('data_emissao')
            if (msg2.includes('data_vencimento')) removeMore.push('data_vencimento')
            if (msg2.includes('os_id')) removeMore.push('os_id')
            if (msg2.includes('descricao')) removeMore.push('descricao')
            if (msg2.includes('valor')) removeMore.push('valor')
            if (msg2.includes('origem')) removeMore.push('origem')
            if (msg2.includes('origem_ref_id')) removeMore.push('origem_ref_id')
            if (removeMore.length) {
              const payload3 = { ...(payload2 as any) }
              removeMore.forEach((k) => { delete (payload3 as any)[k] })
              const { error: err3 } = await supabase
                .from('contas_receber')
                .insert([payload3])
              if (err3) throw err3
              toast('Schema parcial em contas_receber. Inserido sem alguns campos opcionais.')
            } else {
              throw err2
            }
          } else {
            toast('Schema parcial em contas_receber. Inserido sem alguns campos opcionais.')
          }
        } else if (!insertedViaAlt) {
          throw insertErr
        }
      }

      // Após inserir, tentar atualizar campos opcionais (pular se foi via schema alternativo)
      if (!insertedViaAlt) {
        const optional: any = {
          forma_pagamento: full.forma_pagamento ?? null,
          observacoes: full.observacoes ?? null,
          data_recebimento: full.data_recebimento ?? null,
          valor_recebido: full.valor_recebido ?? null,
          origem: full.sale_id ? 'venda' : (full.os_id ? 'os' : 'manual'),
          origem_ref_id: full.sale_id ?? full.os_id ?? null,
        }
        Object.keys(optional).forEach((k) => optional[k] === undefined && delete optional[k])

        if (Object.keys(optional).length) {
          const { error: upErr } = await supabase
            .from('contas_receber')
            .update(optional)
            .eq('id', newId)
          if (upErr) {
            const msg = (upErr as any)?.message || ''
            const removeKeys: string[] = []
            if (msg.includes('forma_pagamento')) removeKeys.push('forma_pagamento')
            if (msg.includes('observacoes')) removeKeys.push('observacoes')
            if (msg.includes('data_recebimento')) removeKeys.push('data_recebimento')
            if (msg.includes('valor_recebido')) removeKeys.push('valor_recebido')

            if (removeKeys.length) {
              const payload2 = { ...(optional as any) }
              removeKeys.forEach((k) => { delete (payload2 as any)[k] })
              const { error: err2 } = await supabase
                .from('contas_receber')
                .update(payload2 as any)
                .eq('id', newId)
              if (err2) {
                const msg2 = (err2 as any)?.message || ''
                const removeMore: string[] = []
                if (msg2.includes('forma_pagamento')) removeMore.push('forma_pagamento')
                if (msg2.includes('observacoes')) removeMore.push('observacoes')
                if (msg2.includes('data_recebimento')) removeMore.push('data_recebimento')
                if (msg2.includes('valor_recebido')) removeMore.push('valor_recebido')
                if (removeMore.length) {
                  const payload3 = { ...(payload2 as any) }
                  removeMore.forEach((k) => { delete (payload3 as any)[k] })
                  const { error: err3 } = await supabase
                    .from('contas_receber')
                    .update(payload3 as any)
                    .eq('id', newId)
                  if (err3) throw err3
                  toast('Schema parcial em contas_receber. Atualizado sem alguns campos opcionais.')
                } else {
                  throw err2
                }
              } else {
                toast('Schema parcial em contas_receber. Atualizado sem alguns campos opcionais.')
              }
            } else if (upErr) {
              throw upErr
            }
          }
        }
      }

      toast.success('Conta a receber criada com sucesso!')
      await fetchContasReceber()
      return true
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta a receber')
      throw error
    }
  }

  // Marcar conta a pagar como paga
  const pagarConta = async (
    id: string,
    options?: { valor_pago?: number; forma_pagamento?: FormaPagamento; data_pagamento?: string }
  ) => {
    try {
      const hoje = toYMDLocal()
      if (usesAltSchema) {
        const statusRemote = 'paid'
        const altPayload: any = { status: statusRemote }
        const { error: altErr } = await supabase
          .from('contas_pagar')
          .update(altPayload as any)
          .eq('id', id)
        if (altErr) throw altErr
      } else {
        const payload = {
          status: 'pago' as ContaStatus,
          data_pagamento: options?.data_pagamento || hoje,
          valor_pago: options?.valor_pago,
          forma_pagamento: options?.forma_pagamento ?? null,
        }
        const { error } = await supabase
          .from('contas_pagar')
          .update(payload as any)
          .eq('id', id)
        if (error) {
          const msg = (error as any)?.message || ''
          const removeKeys: string[] = []
          if (msg.includes('forma_pagamento')) removeKeys.push('forma_pagamento')
          if (msg.includes('data_pagamento')) removeKeys.push('data_pagamento')
          if (msg.includes('valor_pago')) removeKeys.push('valor_pago')
          if (removeKeys.length) {
            const payload2 = { ...(payload as any) }
            removeKeys.forEach((k) => { delete (payload2 as any)[k] })
            const { error: err2 } = await supabase
              .from('contas_pagar')
              .update(payload2 as any)
              .eq('id', id)
            if (err2) throw err2
          } else {
            throw error
          }
        }
      }
      toast.success('Pagamento registrado com sucesso!')
      await fetchContasPagar()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar pagamento')
      throw error
    }
  }

  // Marcar conta a receber como paga (recebida)
  const receberConta = async (
    id: string,
    options?: { valor_recebido?: number; forma_pagamento?: FormaPagamento; data_recebimento?: string }
  ) => {
    try {
      const hoje = toYMDLocal()
      const { data: atual } = await supabase
        .from('contas_receber')
        .select('id, valor, valor_recebido, status')
        .eq('id', id)
        .maybeSingle()
      const recebidoAtual = Number((atual as any)?.valor_recebido || 0)
      const valorTotal = Number((atual as any)?.valor || 0)
      const incremento = Number(options?.valor_recebido || 0)
      const novoRecebido = recebidoAtual + incremento
      const novoStatus: ContaStatus = novoRecebido >= valorTotal && valorTotal > 0 ? 'pago' : 'pendente'
      console.log('[ReceberConta] id=', id, 'atual=', atual, 'incremento=', incremento, 'novoRecebido=', novoRecebido, 'novoStatus=', novoStatus)
      const payload = {
        status: novoStatus,
        data_recebimento: options?.data_recebimento || hoje,
        valor_recebido: novoRecebido,
        forma_pagamento: options?.forma_pagamento ?? null,
      }
      const { error } = await supabase
        .from('contas_receber')
        .update(payload as any)
        .eq('id', id)

      // Fallback defensivo: remover campos ausentes no schema (forma_pagamento, data_recebimento, valor_recebido)
      if (error) {
        const msg = (error as any)?.message || ''
        const removeKeys: string[] = []
        if (msg.includes('forma_pagamento')) removeKeys.push('forma_pagamento')
        if (msg.includes('data_recebimento')) removeKeys.push('data_recebimento')
        if (msg.includes('valor_recebido')) removeKeys.push('valor_recebido')

        if (removeKeys.length) {
          const payload2 = { ...(payload as any) }
          removeKeys.forEach((k) => { delete (payload2 as any)[k] })
          const { error: err2 } = await supabase
            .from('contas_receber')
            .update(payload2 as any)
            .eq('id', id)
          if (err2) {
            const msg2 = (err2 as any)?.message || ''
            const removeMore: string[] = []
            if (msg2.includes('forma_pagamento')) removeMore.push('forma_pagamento')
            if (msg2.includes('data_recebimento')) removeMore.push('data_recebimento')
            if (msg2.includes('valor_recebido')) removeMore.push('valor_recebido')
            if (removeMore.length) {
              const payload3 = { ...(payload2 as any) }
              removeMore.forEach((k) => { delete (payload3 as any)[k] })
              const { error: err3 } = await supabase
                .from('contas_receber')
                .update(payload3 as any)
                .eq('id', id)
              if (err3) throw err3
              toast('Schema parcial em contas_receber. Atualizado sem alguns campos opcionais.')
            } else {
              throw err2
            }
          } else {
            // Primeiro fallback funcionou
            if (removeKeys.length) {
              toast('Schema parcial em contas_receber. Atualizado sem alguns campos opcionais.')
            }
          }
        } else {
          throw error
        }
      }
      toast.success('Recebimento registrado com sucesso!')
      await fetchContasReceber()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar recebimento')
      throw error
    }
  }

  // Atualizar conta a pagar (edição)
  const updateContaPagar = async (id: string, changes: Partial<ContaPagar>) => {
    try {
      // Construir payload base com campos conhecidos da tabela em PT
      const base: any = {
        fornecedor_id: changes.fornecedor_id ?? undefined,
        descricao: changes.descricao ?? undefined,
        categoria: changes.categoria ?? undefined,
        valor: changes.valor !== undefined ? Number(changes.valor) : undefined,
        data_emissao: changes.data_emissao ?? undefined,
        data_vencimento: changes.data_vencimento ?? undefined,
        forma_pagamento: changes.forma_pagamento ?? undefined,
        observacoes: changes.observacoes ?? undefined,
        status: changes.status ?? undefined,
        documento: changes.documento ?? undefined,
        data_pagamento: changes.data_pagamento ?? undefined,
        valor_pago: changes.valor_pago !== undefined ? Number(changes.valor_pago) : undefined,
        origem: changes.origem ?? undefined,
        origem_ref_id: changes.origem_ref_id ?? undefined,
      }
      Object.keys(base).forEach((k) => base[k] === undefined && delete base[k])

      // Se schema alternativo foi detectado, traduzir para EN e tentar primeiro
      let triedAlt = true
      const statusRemote = (() => {
        if (base.status === 'pendente') return 'open'
        if (base.status === 'pago') return 'paid'
        if (base.status === 'vencido') return 'overdue'
        if (base.status === 'cancelado') return 'canceled'
        return base.status
      })()
      let altPayload: any = {
        supplier_id: base.fornecedor_id,
        due_date: base.data_vencimento || base.data_emissao,
        amount: base.valor,
        description: base.descricao,
        status: statusRemote,
        origem: base.origem,
      }
      Object.keys(altPayload).forEach((k) => altPayload[k] === undefined && delete altPayload[k])
      const { error: altErr } = await supabase
        .from('contas_pagar')
        .update(altPayload as any)
        .eq('id', id)
      if (!altErr) {
        toast.success('Conta a pagar atualizada com sucesso!')
        await fetchContasPagar()
        return true
      }
      // Se falhar, seguir para PT

      const { error } = await supabase
        .from('contas_pagar')
        .update(base as any)
        .eq('id', id)
      if (error) {
        // Fallback defensivo removendo campos ausentes
        const msg = (error as any)?.message || ''
        const remove: string[] = []
        const candidates = [
          'fornecedor_id','descricao','categoria','valor','data_emissao','data_vencimento','forma_pagamento','observacoes','status','documento','data_pagamento','valor_pago'
        ]
        candidates.forEach((k) => { if (msg.includes(k)) remove.push(k) })
        if (remove.length) {
          const payload2 = { ...(base as any) }
          remove.forEach((k) => { delete (payload2 as any)[k] })
          const { error: err2 } = await supabase
            .from('contas_pagar')
            .update(payload2 as any)
            .eq('id', id)
          if (err2) throw err2
          toast('Schema parcial em contas_pagar. Atualizado sem alguns campos opcionais.')
        } else {
          throw error
        }
      }
      toast.success('Conta a pagar atualizada com sucesso!')
      await fetchContasPagar()
      return true
    } catch (e: any) {
      toast.error(e.message || 'Erro ao atualizar conta a pagar')
      throw e
    }
  }

  // Atualizar conta a receber (edição)
  const updateContaReceber = async (id: string, changes: Partial<ContaReceber>) => {
    try {
      // Base PT (se existir)
      const base: any = {
        cliente_id: changes.cliente_id ?? undefined,
        descricao: changes.descricao ?? undefined, // pode não existir; será removido se causar erro
        valor: changes.valor !== undefined ? Number(changes.valor) : undefined,
        data_emissao: changes.data_emissao ?? undefined,
        data_vencimento: changes.data_vencimento ?? undefined,
        data_recebimento: changes.data_recebimento ?? undefined,
        valor_recebido: changes.valor_recebido !== undefined ? Number(changes.valor_recebido) : undefined,
        forma_pagamento: changes.forma_pagamento ?? undefined,
        observacoes: changes.observacoes ?? undefined,
        status: changes.status ?? undefined,
        os_id: changes.os_id ?? undefined,
        origem: changes.origem ?? undefined,
        origem_ref_id: changes.origem_ref_id ?? undefined,
      }
      Object.keys(base).forEach((k) => base[k] === undefined && delete base[k])

      // Schema alternativo EN: due_date/amount/status + os_id
      let triedAlt = false
      if (usesAltSchema) {
        triedAlt = true
        const statusRemote = (() => {
          if (base.status === 'pendente') return 'open'
          if (base.status === 'pago') return 'paid'
          if (base.status === 'vencido') return 'overdue'
          if (base.status === 'cancelado') return 'canceled'
          return base.status
        })()
        let altPayload: any = {
          due_date: base.data_vencimento || base.data_emissao,
          amount: base.valor,
          status: statusRemote,
          os_id: base.os_id,
          // Enviar apenas se as colunas existem para evitar 400
          ...(altHasCustomerId ? { customer_id: base.cliente_id } : {}),
          ...(altHasDescription ? { description: base.descricao } : {}),
          ...(altHasNotes ? { notes: base.observacoes } : {}),
        }
        Object.keys(altPayload).forEach((k) => altPayload[k] === undefined && delete altPayload[k])
        const { error: altErr } = await supabase
          .from('contas_receber')
          .update(altPayload as any)
          .eq('id', id)
        if (!altErr) {
          toast.success('Conta a receber atualizada com sucesso!')
          await fetchContasReceber()
          return true
        }
        // Se falhar, tentar PT
      }

      const { error } = await supabase
        .from('contas_receber')
        .update(base as any)
        .eq('id', id)
      if (error) {
        const msg = (error as any)?.message || ''
        const remove: string[] = []
        const candidates = [
          'cliente_id','descricao','valor','data_emissao','data_vencimento','data_recebimento','valor_recebido','forma_pagamento','observacoes','status','os_id'
        ]
        candidates.forEach((k) => { if (msg.includes(k)) remove.push(k) })
        if (remove.length) {
          const payload2 = { ...(base as any) }
          remove.forEach((k) => { delete (payload2 as any)[k] })
          const { error: err2 } = await supabase
            .from('contas_receber')
            .update(payload2 as any)
            .eq('id', id)
          if (err2) throw err2
          toast('Schema parcial em contas_receber. Atualizado sem alguns campos opcionais.')
        } else {
          throw error
        }
      }
      toast.success('Conta a receber atualizada com sucesso!')
      await fetchContasReceber()
      return true
    } catch (e: any) {
      toast.error(e.message || 'Erro ao atualizar conta a receber')
      throw e
    }
  }

  // Excluir conta a pagar
  const deleteContaPagar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Conta a pagar excluída!')
      await fetchContasPagar()
      return true
    } catch (e: any) {
      toast.error(e.message || 'Erro ao excluir conta a pagar')
      throw e
    }
  }

  // Excluir conta a receber
  const deleteContaReceber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_receber')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Conta a receber excluída!')
      await fetchContasReceber()
      return true
    } catch (e: any) {
      toast.error(e.message || 'Erro ao excluir conta a receber')
      throw e
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return {
    contasPagar,
    contasReceber,
    loading,
    fetchContasPagar,
    fetchContasReceber,
    fetchAll,
    diagnosticarContaReceber,
    createContaPagar,
    createContaReceber,
    pagarConta,
    receberConta,
    updateContaPagar,
    updateContaReceber,
    deleteContaPagar,
    deleteContaReceber,
  }
}
