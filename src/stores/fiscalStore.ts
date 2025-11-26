// ============================================================================
// STORE ZUSTAND PARA MÓDULO FISCAL
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    ConfiguracaoFiscal,
    NotaFiscal,
    AmbienteFiscal,
    TipoNota,
    StatusNota,
} from '../types/fiscal';
import { getFocusNFeService, resetFocusNFeService } from '../lib/focusnfe';

// ============================================================================
// INTERFACE DO STORE
// ============================================================================

interface FiscalState {
    // Configuração
    configuracao: ConfiguracaoFiscal | null;
    configurado: boolean;

    // Notas
    notas: NotaFiscal[];
    notaSelecionada: NotaFiscal | null;

    // UI State
    loading: boolean;
    erro: string | null;

    // Actions - Configuração
    setConfiguracao: (config: ConfiguracaoFiscal) => void;
    limparConfiguracao: () => void;
    testarConexao: () => Promise<boolean>;

    // Actions - Notas
    adicionarNota: (nota: NotaFiscal) => void;
    atualizarNota: (id: number, dados: Partial<NotaFiscal>) => void;
    removerNota: (id: number) => void;
    selecionarNota: (nota: NotaFiscal | null) => void;
    buscarNotaPorReferencia: (referencia: string) => NotaFiscal | undefined;
    buscarNotaPorChave: (chave: string) => NotaFiscal | undefined;

    // Actions - Filtros
    filtrarNotas: (filtros: {
        tipo?: TipoNota;
        status?: StatusNota;
        dataInicio?: string;
        dataFim?: string;
        cliente?: string;
    }) => NotaFiscal[];

    // Actions - UI
    setLoading: (loading: boolean) => void;
    setErro: (erro: string | null) => void;
    limparErro: () => void;
}

// ============================================================================
// CRIAÇÃO DO STORE
// ============================================================================

export const useFiscalStore = create<FiscalState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            configuracao: null,
            configurado: false,
            notas: [],
            notaSelecionada: null,
            loading: false,
            erro: null,

            // =======================================================================
            // CONFIGURAÇÃO
            // =======================================================================

            setConfiguracao: (config: ConfiguracaoFiscal) => {
                set({
                    configuracao: config,
                    configurado: true,
                    erro: null,
                });

                // Inicializa o serviço FocusNFe
                try {
                    getFocusNFeService(config.token_focusnfe, config.ambiente);
                } catch (error) {
                    console.error('Erro ao configurar FocusNFe:', error);
                    set({ erro: 'Erro ao configurar serviço fiscal' });
                }
            },

            limparConfiguracao: () => {
                set({
                    configuracao: null,
                    configurado: false,
                    erro: null,
                });
                resetFocusNFeService();
            },

            testarConexao: async () => {
                const { configuracao } = get();

                if (!configuracao) {
                    set({ erro: 'Configuração não encontrada' });
                    return false;
                }

                set({ loading: true, erro: null });

                try {
                    const service = getFocusNFeService(
                        configuracao.token_focusnfe,
                        configuracao.ambiente
                    );

                    const sucesso = await service.testarConexao();

                    if (sucesso) {
                        set({ loading: false, erro: null });
                    } else {
                        set({ loading: false, erro: 'Falha ao conectar com FocusNFe' });
                    }

                    return sucesso;
                } catch (error) {
                    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
                    set({ loading: false, erro: mensagem });
                    return false;
                }
            },

            // =======================================================================
            // NOTAS
            // =======================================================================

            adicionarNota: (nota: NotaFiscal) => {
                set((state) => ({
                    notas: [...state.notas, { ...nota, id: Date.now() }],
                }));
            },

            atualizarNota: (id: number, dados: Partial<NotaFiscal>) => {
                set((state) => ({
                    notas: state.notas.map((nota) =>
                        nota.id === id
                            ? { ...nota, ...dados, atualizado_em: new Date().toISOString() }
                            : nota
                    ),
                }));
            },

            removerNota: (id: number) => {
                set((state) => ({
                    notas: state.notas.filter((nota) => nota.id !== id),
                    notaSelecionada:
                        state.notaSelecionada?.id === id ? null : state.notaSelecionada,
                }));
            },

            selecionarNota: (nota: NotaFiscal | null) => {
                set({ notaSelecionada: nota });
            },

            buscarNotaPorReferencia: (referencia: string) => {
                return get().notas.find((nota) => nota.referencia === referencia);
            },

            buscarNotaPorChave: (chave: string) => {
                return get().notas.find((nota) => nota.chave === chave);
            },

            // =======================================================================
            // FILTROS
            // =======================================================================

            filtrarNotas: (filtros) => {
                const { notas } = get();

                return notas.filter((nota) => {
                    // Filtro por tipo
                    if (filtros.tipo && nota.tipo !== filtros.tipo) {
                        return false;
                    }

                    // Filtro por status
                    if (filtros.status && nota.status !== filtros.status) {
                        return false;
                    }

                    // Filtro por data início
                    if (filtros.dataInicio) {
                        const dataEmissao = new Date(nota.data_emissao);
                        const dataInicio = new Date(filtros.dataInicio);
                        if (dataEmissao < dataInicio) {
                            return false;
                        }
                    }

                    // Filtro por data fim
                    if (filtros.dataFim) {
                        const dataEmissao = new Date(nota.data_emissao);
                        const dataFim = new Date(filtros.dataFim);
                        if (dataEmissao > dataFim) {
                            return false;
                        }
                    }

                    // Filtro por cliente
                    if (filtros.cliente) {
                        const termoBusca = filtros.cliente.toLowerCase();
                        const nomeCliente = nota.cliente_nome?.toLowerCase() || '';
                        const cpfCnpj = nota.cliente_cpf_cnpj?.toLowerCase() || '';

                        if (!nomeCliente.includes(termoBusca) && !cpfCnpj.includes(termoBusca)) {
                            return false;
                        }
                    }

                    return true;
                });
            },

            // =======================================================================
            // UI
            // =======================================================================

            setLoading: (loading: boolean) => {
                set({ loading });
            },

            setErro: (erro: string | null) => {
                set({ erro });
            },

            limparErro: () => {
                set({ erro: null });
            },
        }),
        {
            name: 'fiscal-storage',
            partialize: (state) => ({
                configuracao: state.configuracao,
                configurado: state.configurado,
                notas: state.notas,
            }),
        }
    )
);

// ============================================================================
// HOOKS AUXILIARES
// ============================================================================

export const useConfiguracaoFiscal = () => {
    const configuracao = useFiscalStore((state) => state.configuracao);
    const configurado = useFiscalStore((state) => state.configurado);
    const setConfiguracao = useFiscalStore((state) => state.setConfiguracao);
    const limparConfiguracao = useFiscalStore((state) => state.limparConfiguracao);
    const testarConexao = useFiscalStore((state) => state.testarConexao);

    return {
        configuracao,
        configurado,
        setConfiguracao,
        limparConfiguracao,
        testarConexao,
    };
};

export const useNotasFiscais = () => {
    const notas = useFiscalStore((state) => state.notas);
    const notaSelecionada = useFiscalStore((state) => state.notaSelecionada);
    const adicionarNota = useFiscalStore((state) => state.adicionarNota);
    const atualizarNota = useFiscalStore((state) => state.atualizarNota);
    const removerNota = useFiscalStore((state) => state.removerNota);
    const selecionarNota = useFiscalStore((state) => state.selecionarNota);
    const filtrarNotas = useFiscalStore((state) => state.filtrarNotas);

    return {
        notas,
        notaSelecionada,
        adicionarNota,
        atualizarNota,
        removerNota,
        selecionarNota,
        filtrarNotas,
    };
};

export const useFiscalUI = () => {
    const loading = useFiscalStore((state) => state.loading);
    const erro = useFiscalStore((state) => state.erro);
    const setLoading = useFiscalStore((state) => state.setLoading);
    const setErro = useFiscalStore((state) => state.setErro);
    const limparErro = useFiscalStore((state) => state.limparErro);

    return {
        loading,
        erro,
        setLoading,
        setErro,
        limparErro,
    };
};
