// ============================================================================
// PÁGINA DE CONFIGURAÇÃO FISCAL
// ============================================================================

import { useState, useEffect } from 'react';
import { useConfiguracaoFiscal, useFiscalUI } from '../stores/fiscalStore';
import type { ConfiguracaoFiscal, AmbienteFiscal } from '../types/fiscal';
import toast from 'react-hot-toast';
import { Settings, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';

export default function ConfiguracaoFiscalPage() {
    const { configuracao, configurado, setConfiguracao, testarConexao } = useConfiguracaoFiscal();
    const { loading } = useFiscalUI();

    const [formData, setFormData] = useState<ConfiguracaoFiscal>({
        token_focusnfe: '',
        ambiente: 'homologacao',
        cnpj_emitente: '',
        razao_social: '',
        nome_fantasia: '',
        inscricao_estadual: '',
        regime_tributario: '1',
        endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            municipio: '',
            uf: '',
            cep: '',
            codigo_municipio: '',
            telefone: '',
            email: '',
        },
        ativo: true,
    });

    const [testando, setTestando] = useState(false);
    const [testeRealizado, setTesteRealizado] = useState(false);
    const [testeSucesso, setTesteSucesso] = useState(false);

    // Carregar configuração existente
    useEffect(() => {
        if (configuracao) {
            setFormData(configuracao);
        }
    }, [configuracao]);

    // ==========================================================================
    // HANDLERS
    // ==========================================================================

    const handleChange = (field: string, value: string) => {
        if (field.startsWith('endereco.')) {
            const enderecoField = field.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    [enderecoField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleTestarConexao = async () => {
        if (!formData.token_focusnfe) {
            toast.error('Informe o token da FocusNFe');
            return;
        }

        setTestando(true);
        setTesteRealizado(false);

        // Salvar temporariamente para testar
        setConfiguracao(formData);

        const sucesso = await testarConexao();

        setTestando(false);
        setTesteRealizado(true);
        setTesteSucesso(sucesso);

        if (sucesso) {
            toast.success('Conexão estabelecida com sucesso!');
        } else {
            toast.error('Falha ao conectar. Verifique o token e tente novamente.');
        }
    };

    const handleSalvar = () => {
        // Validações básicas
        if (!formData.token_focusnfe) {
            toast.error('Informe o token da FocusNFe');
            return;
        }

        if (!formData.cnpj_emitente) {
            toast.error('Informe o CNPJ do emitente');
            return;
        }

        if (!formData.razao_social) {
            toast.error('Informe a razão social');
            return;
        }

        setConfiguracao(formData);
        toast.success('Configuração salva com sucesso!');
    };

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Configuração Fiscal</h1>
                </div>
                <p className="text-gray-600">
                    Configure a integração com FocusNFe para emissão de notas fiscais
                </p>
            </div>

            {/* Status da Configuração */}
            {configurado && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-900">Módulo Fiscal Configurado</p>
                        <p className="text-sm text-green-700">
                            Ambiente: <span className="font-medium">{configuracao?.ambiente}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Formulário */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Seção 1: FocusNFe */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                        Credenciais FocusNFe
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Token FocusNFe *
                            </label>
                            <input
                                type="password"
                                value={formData.token_focusnfe}
                                onChange={(e) => handleChange('token_focusnfe', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Insira seu token da FocusNFe"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Obtenha seu token em{' '}
                                <a
                                    href="https://focusnfe.com.br"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    focusnfe.com.br
                                </a>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ambiente *
                            </label>
                            <select
                                value={formData.ambiente}
                                onChange={(e) => handleChange('ambiente', e.target.value as AmbienteFiscal)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="homologacao">Homologação (Testes)</option>
                                <option value="producao">Produção</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Use Homologação para testes. Produção emite notas reais.
                            </p>
                        </div>

                        <button
                            onClick={handleTestarConexao}
                            disabled={testando || !formData.token_focusnfe}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {testando ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testando...
                                </>
                            ) : (
                                <>
                                    {testeRealizado ? (
                                        testeSucesso ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )
                                    ) : null}
                                    Testar Conexão
                                </>
                            )}
                        </button>

                        {testeRealizado && (
                            <div
                                className={`p-3 rounded-lg ${testeSucesso
                                        ? 'bg-green-50 border border-green-200 text-green-800'
                                        : 'bg-red-50 border border-red-200 text-red-800'
                                    }`}
                            >
                                {testeSucesso
                                    ? '✓ Conexão estabelecida com sucesso!'
                                    : '✗ Falha na conexão. Verifique o token e tente novamente.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção 2: Dados do Emitente */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                        Dados do Emitente
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CNPJ *
                            </label>
                            <input
                                type="text"
                                value={formData.cnpj_emitente}
                                onChange={(e) => handleChange('cnpj_emitente', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inscrição Estadual *
                            </label>
                            <input
                                type="text"
                                value={formData.inscricao_estadual}
                                onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="000.000.000.000"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Razão Social *
                            </label>
                            <input
                                type="text"
                                value={formData.razao_social}
                                onChange={(e) => handleChange('razao_social', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="EMPRESA LTDA"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome Fantasia
                            </label>
                            <input
                                type="text"
                                value={formData.nome_fantasia}
                                onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Minha Empresa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Regime Tributário *
                            </label>
                            <select
                                value={formData.regime_tributario}
                                onChange={(e) => handleChange('regime_tributario', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="1">Simples Nacional</option>
                                <option value="2">Simples Nacional - Excesso</option>
                                <option value="3">Regime Normal</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção 3: Endereço */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                        Endereço
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logradouro
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.logradouro}
                                onChange={(e) => handleChange('endereco.logradouro', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Rua, Avenida, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.numero}
                                onChange={(e) => handleChange('endereco.numero', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Complemento
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.complemento}
                                onChange={(e) => handleChange('endereco.complemento', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Sala, Andar, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bairro
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.bairro}
                                onChange={(e) => handleChange('endereco.bairro', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Centro"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Município
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.municipio}
                                onChange={(e) => handleChange('endereco.municipio', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="São Paulo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                UF
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.uf}
                                onChange={(e) => handleChange('endereco.uf', e.target.value)}
                                maxLength={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="SP"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CEP
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.cep}
                                onChange={(e) => handleChange('endereco.cep', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="00000-000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telefone
                            </label>
                            <input
                                type="text"
                                value={formData.endereco.telefone}
                                onChange={(e) => handleChange('endereco.telefone', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="(00) 0000-0000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail
                            </label>
                            <input
                                type="email"
                                value={formData.endereco.email}
                                onChange={(e) => handleChange('endereco.email', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="contato@empresa.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Botão Salvar */}
                <div className="flex justify-end pt-4 border-t">
                    <button
                        onClick={handleSalvar}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        <Save className="w-5 h-5" />
                        Salvar Configuração
                    </button>
                </div>
            </div>
        </div>
    );
}
