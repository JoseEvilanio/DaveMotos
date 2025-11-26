// ============================================================================
// SERVIÇO DE INTEGRAÇÃO COM FOCUSNFE
// ============================================================================

import type {
    AmbienteFiscal,
    RequisicaoNFCe,
    RequisicaoNFe,
    RequisicaoCancelamento,
    RespostaFocusNFe,
    RespostaCancelamento,
} from '../types/fiscal';

// ============================================================================
// CONFIGURAÇÃO BASE
// ============================================================================

const BASE_URLS = {
    homologacao: 'https://homologacao.focusnfe.com.br',
    producao: 'https://api.focusnfe.com.br',
} as const;

// ============================================================================
// CLASSE DE SERVIÇO
// ============================================================================

export class FocusNFeService {
    private token: string;
    private ambiente: AmbienteFiscal;
    private baseUrl: string;

    constructor(token: string, ambiente: AmbienteFiscal = 'homologacao') {
        this.token = token;
        this.ambiente = ambiente;
        this.baseUrl = BASE_URLS[ambiente];
    }

    // ==========================================================================
    // MÉTODOS PRIVADOS - REQUISIÇÕES HTTP
    // ==========================================================================

    private async request<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'DELETE' = 'GET',
        body?: unknown
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Authorization': `Basic ${btoa(this.token + ':')}`,
            'Content-Type': 'application/json',
        };

        const options: RequestInit = {
            method,
            headers,
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || data.mensagem || 'Erro na requisição');
            }

            return data as T;
        } catch (error) {
            console.error('Erro na requisição FocusNFe:', error);
            throw error;
        }
    }

    // ==========================================================================
    // TESTE DE CONEXÃO
    // ==========================================================================

    async testarConexao(): Promise<boolean> {
        try {
            // Tenta listar notas para validar o token
            await this.request('/v2/nfce', 'GET');
            return true;
        } catch (error) {
            console.error('Erro ao testar conexão:', error);
            return false;
        }
    }

    // ==========================================================================
    // EMISSÃO DE NFC-E
    // ==========================================================================

    async emitirNFCe(
        referencia: string,
        dados: RequisicaoNFCe
    ): Promise<RespostaFocusNFe> {
        const endpoint = `/v2/nfce?ref=${encodeURIComponent(referencia)}`;
        return this.request<RespostaFocusNFe>(endpoint, 'POST', dados);
    }

    // ==========================================================================
    // EMISSÃO DE NF-E
    // ==========================================================================

    async emitirNFe(
        referencia: string,
        dados: RequisicaoNFe
    ): Promise<RespostaFocusNFe> {
        const endpoint = `/v2/nfe?ref=${encodeURIComponent(referencia)}`;
        return this.request<RespostaFocusNFe>(endpoint, 'POST', dados);
    }

    // ==========================================================================
    // CONSULTA POR REFERÊNCIA
    // ==========================================================================

    async consultarPorReferencia(
        referencia: string,
        tipo: 'nfce' | 'nfe' = 'nfce'
    ): Promise<RespostaFocusNFe> {
        const endpoint = `/v2/${tipo}/${encodeURIComponent(referencia)}`;
        return this.request<RespostaFocusNFe>(endpoint, 'GET');
    }

    // ==========================================================================
    // CONSULTA POR CHAVE
    // ==========================================================================

    async consultarPorChave(
        chave: string,
        tipo: 'nfce' | 'nfe' = 'nfce'
    ): Promise<RespostaFocusNFe> {
        const endpoint = `/v2/${tipo}/${chave}`;
        return this.request<RespostaFocusNFe>(endpoint, 'GET');
    }

    // ==========================================================================
    // CANCELAMENTO
    // ==========================================================================

    async cancelarNota(
        referencia: string,
        justificativa: string,
        tipo: 'nfce' | 'nfe' = 'nfce'
    ): Promise<RespostaCancelamento> {
        if (justificativa.length < 15) {
            throw new Error('A justificativa deve ter no mínimo 15 caracteres');
        }

        const endpoint = `/v2/${tipo}/${encodeURIComponent(referencia)}/cancelar`;
        const dados: RequisicaoCancelamento = { justificativa };

        return this.request<RespostaCancelamento>(endpoint, 'POST', dados);
    }

    // ==========================================================================
    // DOWNLOAD DE PDF
    // ==========================================================================

    async downloadPDF(
        referencia: string,
        tipo: 'nfce' | 'nfe' = 'nfce'
    ): Promise<Blob> {
        const url = `${this.baseUrl}/v2/${tipo}/${encodeURIComponent(referencia)}.pdf`;

        const headers: HeadersInit = {
            'Authorization': `Basic ${btoa(this.token + ':')}`,
        };

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error('Erro ao baixar PDF');
        }

        return response.blob();
    }

    // ==========================================================================
    // DOWNLOAD DE XML
    // ==========================================================================

    async downloadXML(
        referencia: string,
        tipo: 'nfce' | 'nfe' = 'nfce'
    ): Promise<string> {
        const url = `${this.baseUrl}/v2/${tipo}/${encodeURIComponent(referencia)}.xml`;

        const headers: HeadersInit = {
            'Authorization': `Basic ${btoa(this.token + ':')}`,
        };

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error('Erro ao baixar XML');
        }

        return response.text();
    }

    // ==========================================================================
    // LISTAR NOTAS
    // ==========================================================================

    async listarNotas(
        tipo: 'nfce' | 'nfe' = 'nfce',
        parametros?: {
            cnpj?: string;
            data_inicio?: string;
            data_fim?: string;
        }
    ): Promise<RespostaFocusNFe[]> {
        let endpoint = `/v2/${tipo}`;

        if (parametros) {
            const params = new URLSearchParams();
            if (parametros.cnpj) params.append('cnpj', parametros.cnpj);
            if (parametros.data_inicio) params.append('data_inicio', parametros.data_inicio);
            if (parametros.data_fim) params.append('data_fim', parametros.data_fim);

            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
        }

        return this.request<RespostaFocusNFe[]>(endpoint, 'GET');
    }

    // ==========================================================================
    // INUTILIZAR NUMERAÇÃO
    // ==========================================================================

    async inutilizarNumeracao(
        serie: string,
        numeroInicial: string,
        numeroFinal: string,
        justificativa: string,
        tipo: 'nfce' | 'nfe' = 'nfce'
    ): Promise<RespostaFocusNFe> {
        if (justificativa.length < 15) {
            throw new Error('A justificativa deve ter no mínimo 15 caracteres');
        }

        const endpoint = `/v2/${tipo}/inutilizacao`;
        const dados = {
            serie,
            numero_inicial: numeroInicial,
            numero_final: numeroFinal,
            justificativa,
        };

        return this.request<RespostaFocusNFe>(endpoint, 'POST', dados);
    }

    // ==========================================================================
    // ATUALIZAR CONFIGURAÇÃO
    // ==========================================================================

    setToken(token: string): void {
        this.token = token;
    }

    setAmbiente(ambiente: AmbienteFiscal): void {
        this.ambiente = ambiente;
        this.baseUrl = BASE_URLS[ambiente];
    }

    getAmbiente(): AmbienteFiscal {
        return this.ambiente;
    }
}

// ============================================================================
// INSTÂNCIA SINGLETON (será gerenciada pelo store)
// ============================================================================

let focusNFeInstance: FocusNFeService | null = null;

export function getFocusNFeService(
    token?: string,
    ambiente?: AmbienteFiscal
): FocusNFeService {
    if (!focusNFeInstance && token) {
        focusNFeInstance = new FocusNFeService(token, ambiente);
    } else if (focusNFeInstance && token) {
        focusNFeInstance.setToken(token);
        if (ambiente) {
            focusNFeInstance.setAmbiente(ambiente);
        }
    }

    if (!focusNFeInstance) {
        throw new Error('FocusNFe não configurado. Configure o token primeiro.');
    }

    return focusNFeInstance;
}

export function resetFocusNFeService(): void {
    focusNFeInstance = null;
}
