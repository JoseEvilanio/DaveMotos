# 🧾 Módulo Fiscal - Integração FocusNFe

## 📖 Visão Geral

Este módulo implementa a integração completa com a API da **FocusNFe** para emissão de notas fiscais eletrônicas (NFe e NFC-e) no sistema de gerenciamento de oficinas de motos.

### ✨ Funcionalidades

- ✅ Emissão de **NFC-e** (Nota Fiscal de Consumidor Eletrônica - Modelo 65)
- ✅ Emissão de **NFe** (Nota Fiscal Eletrônica - Modelo 55)
- ✅ **Cancelamento** de notas fiscais
- ✅ **Consulta** de status de notas
- ✅ **Download** de PDF (DANFe)
- ✅ **Download** de XML
- ✅ **Histórico** completo de notas emitidas
- ✅ Suporte a **Homologação** e **Produção**

---

## 🚀 Início Rápido

### 1. Criar Conta na FocusNFe

1. Acesse [focusnfe.com.br](https://focusnfe.com.br)
2. Crie uma conta
3. Obtenha seu **token de API**
4. Configure seu certificado digital (FocusNFe gerencia isso)

### 2. Executar Script do Banco de Dados

```bash
# PostgreSQL
psql -U seu_usuario -d seu_banco -f database/fiscal_schema.sql
```

### 3. Configurar o Módulo

1. Acesse o sistema
2. Vá em **Fiscal > Configuração**
3. Insira seu token da FocusNFe
4. Selecione o ambiente (Homologação para testes)
5. Preencha os dados do emitente
6. Clique em **Testar Conexão**
7. Se OK, clique em **Salvar Configuração**

---

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   └── fiscal.ts                    # Tipos TypeScript
├── lib/
│   └── focusnfe.ts                  # Serviço de integração
├── stores/
│   └── fiscalStore.ts               # Store Zustand
├── hooks/
│   └── useEmissaoNota.ts            # Hook customizado
├── pages/
│   ├── ConfiguracaoFiscal.tsx       # Tela de configuração
│   ├── EmissaoNFCe.tsx              # Emissão de NFC-e (a criar)
│   ├── EmissaoNFe.tsx               # Emissão de NFe (a criar)
│   └── HistoricoNotas.tsx           # Histórico (a criar)
└── components/
    └── fiscal/
        ├── FormularioNFCe.tsx       # Formulário NFC-e (a criar)
        ├── FormularioNFe.tsx        # Formulário NFe (a criar)
        ├── QRCodeDisplay.tsx        # Exibição QR Code (a criar)
        ├── TabelaNotas.tsx          # Tabela de notas (a criar)
        ├── DetalhesNota.tsx         # Detalhes da nota (a criar)
        └── ModalCancelamento.tsx    # Modal cancelamento (a criar)

database/
└── fiscal_schema.sql                # Schema do banco

docs/
└── MODULO_FISCAL_FOCUSNFE.md       # Documentação completa
```

---

## 🔧 Como Usar

### Emitir NFC-e

```tsx
import { useEmissaoNota } from '../hooks/useEmissaoNota';

function MeuComponente() {
  const { emitirNFCe, emitindo } = useEmissaoNota();

  const handleEmitir = async () => {
    const dados = {
      itens: [
        {
          descricao: 'TROCA DE ÓLEO',
          cfop: '5102',
          unidade_comercial: 'UN',
          quantidade_comercial: '1',
          valor_unitario_comercial: '120.00',
        },
      ],
      formas_pagamento: [
        {
          forma_pagamento: '17', // PIX
          valor_pagamento: '120.00',
        },
      ],
    };

    const nota = await emitirNFCe(dados);
    
    if (nota) {
      console.log('Nota emitida:', nota.chave);
      console.log('QR Code:', nota.qrcode_url);
    }
  };

  return (
    <button onClick={handleEmitir} disabled={emitindo}>
      {emitindo ? 'Emitindo...' : 'Emitir NFC-e'}
    </button>
  );
}
```

### Emitir NFe

```tsx
const { emitirNFe } = useEmissaoNota();

const dados = {
  natureza_operacao: 'VENDA',
  cliente: {
    nome: 'JOÃO DA SILVA',
    cpf: '111.222.333-44',
    endereco: 'Rua X',
    numero: '123',
    bairro: 'Centro',
    municipio: 'São Paulo',
    uf: 'SP',
    cep: '01000-000',
  },
  itens: [
    {
      codigo: '001',
      descricao: 'PNEU TRASEIRO',
      cfop: '5102',
      unidade_comercial: 'UN',
      quantidade_comercial: '1',
      valor_unitario_comercial: '350.00',
    },
  ],
};

const nota = await emitirNFe(dados);
```

### Consultar Nota

```tsx
const { consultarNota } = useEmissaoNota();

await consultarNota('REF123456789', 'nfce');
```

### Cancelar Nota

```tsx
const { cancelarNota } = useEmissaoNota();

const sucesso = await cancelarNota(
  'REF123456789',
  'Cancelamento solicitado pelo cliente',
  'nfce'
);
```

### Download de PDF

```tsx
const { downloadPDF } = useEmissaoNota();

await downloadPDF('REF123456789', 'nfce');
```

---

## 🎨 Componentes

### Store Zustand

```tsx
import { useFiscalStore } from '../stores/fiscalStore';

// Hooks auxiliares
import { 
  useConfiguracaoFiscal,
  useNotasFiscais,
  useFiscalUI 
} from '../stores/fiscalStore';

// Exemplo
const { configuracao, configurado } = useConfiguracaoFiscal();
const { notas, filtrarNotas } = useNotasFiscais();
const { loading, erro } = useFiscalUI();
```

### Serviço FocusNFe

```tsx
import { getFocusNFeService } from '../lib/focusnfe';

const service = getFocusNFeService(token, ambiente);

// Métodos disponíveis
await service.emitirNFCe(referencia, dados);
await service.emitirNFe(referencia, dados);
await service.consultarPorReferencia(referencia, tipo);
await service.cancelarNota(referencia, justificativa, tipo);
await service.downloadPDF(referencia, tipo);
await service.downloadXML(referencia, tipo);
```

---

## 📊 Banco de Dados

### Tabelas

#### `configuracao_fiscal`
Armazena as configurações de integração.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | ID único |
| token_focusnfe | TEXT | Token da API |
| ambiente | VARCHAR(20) | homologacao ou producao |
| cnpj_emitente | VARCHAR(18) | CNPJ do emitente |
| razao_social | VARCHAR(255) | Razão social |
| endereco | JSONB | Dados do endereço |

#### `notas_fiscais`
Armazena todas as notas emitidas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | ID único |
| tipo | VARCHAR(10) | nfe ou nfce |
| referencia | VARCHAR(100) | Referência interna única |
| status | VARCHAR(20) | Status da nota |
| chave | VARCHAR(44) | Chave de acesso |
| valor_total | DECIMAL(10,2) | Valor total |
| json_enviado | TEXT | JSON enviado |
| json_resposta | TEXT | JSON da resposta |

#### `logs_fiscais`
Registro de eventos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | ID único |
| nota_fiscal_id | INTEGER | FK para notas_fiscais |
| tipo_evento | VARCHAR(50) | Tipo do evento |
| descricao | TEXT | Descrição do evento |

---

## 🔐 Segurança

### Boas Práticas

1. **Token Seguro**: Nunca exponha o token no frontend
2. **HTTPS**: Todas as requisições usam HTTPS
3. **Validação**: Valide todos os dados antes de enviar
4. **Logs**: Não registre dados sensíveis em logs
5. **Ambiente**: Use homologação para testes

### Armazenamento

- Token é armazenado criptografado no banco
- Store Zustand persiste dados localmente
- JSON completo é armazenado para auditoria

---

## 🧪 Testes

### Ambiente de Homologação

```tsx
// Configurar para homologação
setConfiguracao({
  ...config,
  ambiente: 'homologacao',
});

// Emitir nota de teste
const nota = await emitirNFCe(dadosTeste);

// Verificar
console.log('Status:', nota.status);
console.log('Chave:', nota.chave);
```

### Checklist de Testes

- [ ] Configuração salva corretamente
- [ ] Teste de conexão funciona
- [ ] NFC-e é emitida com sucesso
- [ ] QR Code é gerado
- [ ] PDF pode ser baixado
- [ ] XML pode ser baixado
- [ ] Consulta retorna status correto
- [ ] Cancelamento funciona
- [ ] Histórico exibe notas
- [ ] Filtros funcionam

---

## 📝 Formas de Pagamento

| Código | Descrição |
|--------|-----------|
| 01 | Dinheiro |
| 02 | Cheque |
| 03 | Cartão de Crédito |
| 04 | Cartão de Débito |
| 17 | PIX |
| 99 | Outros |

[Lista completa na documentação da FocusNFe](https://focusnfe.com.br/doc/)

---

## 🐛 Troubleshooting

### Erro: "Token inválido"
- Verifique se o token está correto
- Confirme se está usando o ambiente correto

### Erro: "CNPJ não autorizado"
- Verifique se o CNPJ está cadastrado na FocusNFe
- Confirme se o certificado está válido

### Erro: "Nota já existe"
- Use uma referência única para cada nota
- Consulte a nota existente antes de reemitir

### Erro ao cancelar
- Verifique se a nota está autorizada
- Confirme se está dentro do prazo (24h)
- Justificativa deve ter mínimo 15 caracteres

---

## 📚 Recursos

### Documentação Oficial
- [FocusNFe - Documentação da API](https://focusnfe.com.br/doc/)
- [FocusNFe - Exemplos](https://focusnfe.com.br/doc/#introducao_exemplo-de-json)
- [SEFAZ - Legislação](http://www.nfe.fazenda.gov.br/)

### Suporte
- [FocusNFe - Suporte](https://focusnfe.com.br/suporte/)
- Email: suporte@focusnfe.com.br

---

## 🗺️ Roadmap

### ✅ Fase 1 - Fundação (Concluída)
- [x] Tipos TypeScript
- [x] Serviço de API
- [x] Store Zustand
- [x] Hook de emissão
- [x] Página de configuração
- [x] Schema do banco

### ⏳ Fase 2 - NFC-e (Em Andamento)
- [ ] Página de emissão
- [ ] Componente de formulário
- [ ] Exibição de QR Code
- [ ] Impressão de DANFe

### ⏳ Fase 3 - NFe
- [ ] Página de emissão
- [ ] Seletor de cliente
- [ ] Cálculo de impostos

### ⏳ Fase 4 - Cancelamento
- [ ] Modal de cancelamento
- [ ] Validações

### ⏳ Fase 5 - Histórico
- [ ] Listagem de notas
- [ ] Filtros avançados
- [ ] Detalhes da nota

### ⏳ Fase 6 - Produção
- [ ] Testes completos
- [ ] Migração para produção
- [ ] Treinamento

---

## 👥 Contribuindo

Para adicionar novas funcionalidades:

1. Crie os tipos em `src/types/fiscal.ts`
2. Adicione métodos no serviço `src/lib/focusnfe.ts`
3. Atualize o store se necessário
4. Crie componentes em `src/components/fiscal/`
5. Adicione páginas em `src/pages/`
6. Atualize a documentação

---

## 📄 Licença

Este módulo faz parte do Sistema de Gerenciamento de Oficinas de Motos.

---

**Desenvolvido com ❤️ para oficinas de motos**
**Integração: FocusNFe API v2**
**Versão: 1.0.0**
