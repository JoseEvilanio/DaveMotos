// ============================================================================
// TIPOS PARA INTEGRAÇÃO FISCAL COM FOCUSNFE
// ============================================================================

export type AmbienteFiscal = 'homologacao' | 'producao';

export type StatusNota =
    | 'pendente'
    | 'processando'
    | 'autorizada'
    | 'cancelada'
    | 'erro'
    | 'rejeitada'
    | 'denegada';

export type TipoNota = 'nfce' | 'nfe';

export type FormaPagamento =
    | '01' // Dinheiro
    | '02' // Cheque
    | '03' // Cartão de Crédito
    | '04' // Cartão de Débito
    | '05' // Crédito Loja
    | '10' // Vale Alimentação
    | '11' // Vale Refeição
    | '12' // Vale Presente
    | '13' // Vale Combustível
    | '15' // Boleto Bancário
    | '16' // Depósito Bancário
    | '17' // PIX
    | '18' // Transferência bancária
    | '19' // Programa de fidelidade
    | '90' // Sem pagamento
    | '99'; // Outros

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface ConfiguracaoFiscal {
    id?: number;
    token_focusnfe: string;
    ambiente: AmbienteFiscal;
    cnpj_emitente: string;
    razao_social: string;
    nome_fantasia: string;
    inscricao_estadual: string;
    regime_tributario: '1' | '2' | '3'; // 1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal
    endereco: EnderecoEmitente;
    ativo: boolean;
    criado_em?: string;
    atualizado_em?: string;
}

export interface EnderecoEmitente {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    codigo_municipio: string;
    telefone?: string;
    email?: string;
}

// ============================================================================
// CLIENTE
// ============================================================================

export interface ClienteNota {
    nome: string;
    cpf?: string;
    cnpj?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
    codigo_municipio?: string;
    inscricao_estadual?: string;
}

// ============================================================================
// ITENS DA NOTA
// ============================================================================

export interface ItemNota {
    numero_item?: string;
    codigo_produto?: string;
    codigo_ncm?: string;
    descricao: string;
    cfop: string;
    unidade_comercial: string;
    quantidade_comercial: string | number;
    valor_unitario_comercial: string | number;
    valor_bruto?: string | number;
    valor_desconto?: string | number;

    // Impostos
    icms_situacao_tributaria?: string;
    icms_origem?: string;
    pis_situacao_tributaria?: string;
    cofins_situacao_tributaria?: string;

    // Informações adicionais
    informacoes_adicionais_item?: string;
}

// ============================================================================
// FORMAS DE PAGAMENTO
// ============================================================================

export interface FormaPagamentoNota {
    forma_pagamento: FormaPagamento;
    valor_pagamento: string | number;
    nome_credenciadora?: string;
    bandeira_operadora?: string;
    numero_autorizacao?: string;
}

// ============================================================================
// REQUISIÇÃO NFCE
// ============================================================================

export interface RequisicaoNFCe {
    natureza_operacao?: string;
    data_emissao?: string;
    tipo_documento?: '1'; // 1=Saída
    finalidade_emissao?: '1'; // 1=Normal
    cnpj_emitente?: string;

    cliente?: ClienteNota;

    itens: ItemNota[];

    formas_pagamento: FormaPagamentoNota[];

    informacoes_adicionais_contribuinte?: string;
    informacoes_complementares?: string;
}

// ============================================================================
// REQUISIÇÃO NFE
// ============================================================================

export interface RequisicaoNFe {
    natureza_operacao: string;
    data_emissao?: string;
    tipo_documento?: '1'; // 1=Saída
    finalidade_emissao?: '1' | '2' | '3' | '4'; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    cnpj_emitente?: string;

    cliente: ClienteNota;

    itens: ItemNota[];

    formas_pagamento?: FormaPagamentoNota[];

    informacoes_adicionais_contribuinte?: string;
    informacoes_complementares?: string;

    // Transporte
    modalidade_frete?: '0' | '1' | '2' | '3' | '4' | '9'; // 0=Por conta do emitente, 1=Por conta do destinatário, 9=Sem frete
}

// ============================================================================
// RESPOSTA DA FOCUSNFE
// ============================================================================

export interface RespostaFocusNFe {
    status: string;
    status_sefaz?: string;
    mensagem_sefaz?: string;
    serie?: string;
    numero?: string;
    cnpj_emitente?: string;
    ref?: string;
    chave_nfe?: string;
    caminho_xml_nota_fiscal?: string;
    caminho_danfe?: string;
    qrcode?: string;
    qrcode_url?: string;
    url_consulta_nfe?: string;
    protocolo?: string;
    data_emissao?: string;
    modelo?: string;

    // Erros
    codigo?: string;
    erro?: string;
    erros?: Array<{
        codigo: string;
        mensagem: string;
        campo?: string;
    }>;
}

// ============================================================================
// CANCELAMENTO
// ============================================================================

export interface RequisicaoCancelamento {
    justificativa: string; // Mínimo 15 caracteres
}

export interface RespostaCancelamento {
    status: string;
    status_sefaz?: string;
    mensagem_sefaz?: string;
    caminho_xml_cancelamento?: string;
    protocolo?: string;

    // Erros
    codigo?: string;
    erro?: string;
}

// ============================================================================
// ARMAZENAMENTO LOCAL
// ============================================================================

export interface NotaFiscal {
    id?: number;
    tipo: TipoNota;
    referencia: string; // ID interno único
    status: StatusNota;

    // Dados da nota
    chave?: string;
    numero?: string;
    serie?: string;
    protocolo?: string;

    // Cliente
    cliente_nome?: string;
    cliente_cpf_cnpj?: string;

    // Valores
    valor_total: number;
    valor_desconto?: number;

    // Arquivos
    caminho_xml?: string;
    caminho_pdf?: string;
    qrcode?: string;
    qrcode_url?: string;
    url_consulta?: string;

    // JSON
    json_enviado: string; // JSON.stringify da requisição
    json_resposta?: string; // JSON.stringify da resposta

    // Cancelamento
    cancelada: boolean;
    motivo_cancelamento?: string;
    data_cancelamento?: string;

    // Datas
    data_emissao: string;
    criado_em?: string;
    atualizado_em?: string;

    // Relacionamentos
    ordem_servico_id?: number;
    venda_id?: number;
}

// ============================================================================
// HISTÓRICO / LOG
// ============================================================================

export interface LogFiscal {
    id?: number;
    nota_fiscal_id: number;
    tipo_evento: 'emissao' | 'consulta' | 'cancelamento' | 'erro' | 'download';
    descricao: string;
    dados_json?: string;
    criado_em?: string;
}
