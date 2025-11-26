# 🧾 Módulo Fiscal - FocusNFe Integration

## 📋 Status da Implementação

### ✅ Fase 1 - Fundação (CONCLUÍDA)

#### Arquivos Criados:

1. **`src/types/fiscal.ts`** - Tipos TypeScript completos
   - Configuração fiscal
   - NFe e NFCe
   - Cliente, itens, formas de pagamento
   - Respostas da API
   - Armazenamento local

2. **`src/lib/focusnfe.ts`** - Serviço de integração
   - Classe `FocusNFeService`
   - Emissão de NFe/NFCe
   - Consulta por referência e chave
   - Cancelamento
   - Download de PDF/XML
   - Listagem e inutilização

3. **`src/stores/fiscalStore.ts`** - Gerenciamento de estado
   - Store Zustand com persistência
   - Configuração fiscal
   - Notas fiscais
   - Filtros e buscas
   - Hooks auxiliares

4. **`src/hooks/useEmissaoNota.ts`** - Hook customizado
   - Emissão de NFe/NFCe
   - Consulta de notas
   - Cancelamento
   - Download de arquivos
   - Tratamento de erros

5. **`src/pages/ConfiguracaoFiscal.tsx`** - Tela de configuração
   - Formulário de credenciais
   - Dados do emitente
   - Endereço
   - Teste de conexão
   - Validações

---

## 🎯 Próximos Passos

### Fase 2 - Emissão de NFC-e (Semana 2)

#### Arquivos a Criar:

1. **`src/pages/EmissaoNFCe.tsx`**
   - Formulário de emissão
   - Seleção de produtos/serviços
   - Formas de pagamento
   - Preview da nota
   - Botão de emitir

2. **`src/components/fiscal/FormularioNFCe.tsx`**
   - Componente reutilizável
   - Validações
   - Cálculo automático de totais

3. **`src/components/fiscal/QRCodeDisplay.tsx`**
   - Exibição do QR Code
   - Opção de impressão
   - Link de consulta

### Fase 3 - Emissão de NFe (Semana 3)

#### Arquivos a Criar:

1. **`src/pages/EmissaoNFe.tsx`**
   - Formulário completo de NFe
   - Dados do cliente (obrigatório)
   - Produtos e serviços
   - Impostos
   - Transporte

2. **`src/components/fiscal/FormularioNFe.tsx`**
   - Componente de formulário
   - Validações completas
   - Cálculo de impostos

3. **`src/components/fiscal/SeletorCliente.tsx`**
   - Busca de clientes
   - Cadastro rápido
   - Validação de CPF/CNPJ

### Fase 4 - Cancelamento (Semana 4)

#### Arquivos a Criar:

1. **`src/components/fiscal/ModalCancelamento.tsx`**
   - Modal de cancelamento
   - Campo de justificativa
   - Validação (mín. 15 caracteres)
   - Confirmação

### Fase 5 - Histórico e Consulta (Semana 5)

#### Arquivos a Criar:

1. **`src/pages/HistoricoNotas.tsx`**
   - Listagem de notas
   - Filtros (tipo, status, data, cliente)
   - Busca
   - Paginação

2. **`src/components/fiscal/TabelaNotas.tsx`**
   - Tabela de notas
   - Ações (visualizar, baixar, cancelar)
   - Status visual

3. **`src/components/fiscal/DetalhesNota.tsx`**
   - Modal com detalhes
   - Dados da nota
   - Cliente
   - Itens
   - Totais
   - Status SEFAZ

4. **`src/components/fiscal/FiltrosNotas.tsx`**
   - Componente de filtros
   - Data range picker
   - Seleção de tipo
   - Seleção de status

---

## 🗄️ Banco de Dados

### Tabelas Necessárias:

```sql
-- Configuração Fiscal
CREATE TABLE configuracao_fiscal (
  id SERIAL PRIMARY KEY,
  token_focusnfe TEXT NOT NULL,
  ambiente VARCHAR(20) NOT NULL CHECK (ambiente IN ('homologacao', 'producao')),
  cnpj_emitente VARCHAR(18) NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  inscricao_estadual VARCHAR(20) NOT NULL,
  regime_tributario VARCHAR(1) NOT NULL,
  endereco JSONB NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Notas Fiscais
CREATE TABLE notas_fiscais (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('nfe', 'nfce')),
  referencia VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL,
  chave VARCHAR(44),
  numero VARCHAR(20),
  serie VARCHAR(10),
  protocolo VARCHAR(50),
  cliente_nome VARCHAR(255),
  cliente_cpf_cnpj VARCHAR(18),
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_desconto DECIMAL(10, 2),
  caminho_xml TEXT,
  caminho_pdf TEXT,
  qrcode TEXT,
  qrcode_url TEXT,
  url_consulta TEXT,
  json_enviado TEXT NOT NULL,
  json_resposta TEXT,
  cancelada BOOLEAN DEFAULT false,
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMP,
  data_emissao TIMESTAMP NOT NULL,
  ordem_servico_id INTEGER REFERENCES ordens_servico(id),
  venda_id INTEGER,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Log Fiscal
CREATE TABLE logs_fiscais (
  id SERIAL PRIMARY KEY,
  nota_fiscal_id INTEGER REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  dados_json TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notas_referencia ON notas_fiscais(referencia);
CREATE INDEX idx_notas_chave ON notas_fiscais(chave);
CREATE INDEX idx_notas_status ON notas_fiscais(status);
CREATE INDEX idx_notas_data_emissao ON notas_fiscais(data_emissao);
CREATE INDEX idx_logs_nota_id ON logs_fiscais(nota_fiscal_id);
```

---

## 🔌 Integração com Sistema Existente

### 1. Adicionar Rotas no App.tsx

```tsx
import ConfiguracaoFiscal from './pages/ConfiguracaoFiscal';
import EmissaoNFCe from './pages/EmissaoNFCe';
import EmissaoNFe from './pages/EmissaoNFe';
import HistoricoNotas from './pages/HistoricoNotas';

// Adicionar rotas:
<Route path="/fiscal/configuracao" element={<ConfiguracaoFiscal />} />
<Route path="/fiscal/nfce" element={<EmissaoNFCe />} />
<Route path="/fiscal/nfe" element={<EmissaoNFe />} />
<Route path="/fiscal/historico" element={<HistoricoNotas />} />
```

### 2. Adicionar Menu no Sidebar

```tsx
{
  name: 'Fiscal',
  icon: FileText,
  children: [
    { name: 'Configuração', path: '/fiscal/configuracao' },
    { name: 'Emitir NFC-e', path: '/fiscal/nfce' },
    { name: 'Emitir NF-e', path: '/fiscal/nfe' },
    { name: 'Histórico', path: '/fiscal/historico' },
  ],
}
```

### 3. Integrar com Ordens de Serviço

No componente de finalização de OS, adicionar botão:

```tsx
import { useEmissaoNota } from '../hooks/useEmissaoNota';

const { emitirNFe } = useEmissaoNota();

const handleEmitirNota = async () => {
  const dados = {
    natureza_operacao: 'VENDA',
    cliente: {
      nome: os.cliente.nome,
      cpf: os.cliente.cpf,
      // ... outros dados
    },
    itens: os.itens.map(item => ({
      descricao: item.descricao,
      quantidade_comercial: item.quantidade,
      valor_unitario_comercial: item.valor_unitario,
      // ... outros dados
    })),
  };

  await emitirNFe(dados, `OS-${os.id}`);
};
```

---

## 📦 Dependências

Todas as dependências já estão instaladas:
- ✅ `zustand` - Gerenciamento de estado
- ✅ `react-hot-toast` - Notificações
- ✅ `lucide-react` - Ícones

---

## 🧪 Testes

### Teste Manual - Homologação

1. **Configurar Token**
   - Ir em `/fiscal/configuracao`
   - Inserir token de homologação
   - Selecionar ambiente "Homologação"
   - Clicar em "Testar Conexão"

2. **Emitir NFC-e de Teste**
   - Ir em `/fiscal/nfce`
   - Preencher dados
   - Emitir nota
   - Verificar QR Code

3. **Consultar Nota**
   - Ir em `/fiscal/historico`
   - Localizar nota emitida
   - Verificar status

4. **Cancelar Nota**
   - Selecionar nota
   - Clicar em "Cancelar"
   - Inserir justificativa
   - Confirmar

---

## 📝 Notas Importantes

### Ambiente de Homologação
- Todas as notas emitidas em homologação são **TESTES**
- Não têm validade fiscal
- Use para validar integração

### Ambiente de Produção
- Notas emitidas são **REAIS**
- Têm validade fiscal
- Só migre após testes completos

### Certificado Digital
- **NÃO é necessário** certificado A1
- FocusNFe gerencia isso
- Apenas configure o token

### Limites da API
- Verifique seu plano na FocusNFe
- Respeite rate limits
- Implemente retry logic se necessário

---

## 🚀 Como Continuar

### Próximo Arquivo a Criar:
**`src/pages/EmissaoNFCe.tsx`**

Este será o formulário para emitir NFC-e, incluindo:
- Seleção de produtos/serviços
- Formas de pagamento
- Cliente (opcional para NFC-e)
- Preview da nota
- Botão de emissão
- Exibição do QR Code após emissão

### Exemplo de Uso:

```tsx
import { useEmissaoNota } from '../hooks/useEmissaoNota';

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
    // Exibir QR Code
    // Imprimir DANFe
  }
};
```

---

## 📚 Documentação FocusNFe

- [API Reference](https://focusnfe.com.br/doc/)
- [Exemplos de JSON](https://focusnfe.com.br/doc/#introducao_exemplo-de-json)
- [Códigos de Erro](https://focusnfe.com.br/doc/#introducao_codigos-de-erro)
- [Status das Notas](https://focusnfe.com.br/doc/#introducao_status-das-notas)

---

## ✅ Checklist de Implementação

### Fase 1 - Fundação ✅
- [x] Tipos TypeScript
- [x] Serviço FocusNFe
- [x] Store Zustand
- [x] Hook de emissão
- [x] Página de configuração

### Fase 2 - NFC-e ⏳
- [ ] Página de emissão NFC-e
- [ ] Componente de formulário
- [ ] Componente QR Code
- [ ] Integração com vendas

### Fase 3 - NFe ⏳
- [ ] Página de emissão NFe
- [ ] Componente de formulário
- [ ] Seletor de cliente
- [ ] Integração com OS

### Fase 4 - Cancelamento ⏳
- [ ] Modal de cancelamento
- [ ] Validações
- [ ] Confirmação

### Fase 5 - Histórico ⏳
- [ ] Página de histórico
- [ ] Tabela de notas
- [ ] Filtros
- [ ] Detalhes da nota

### Fase 6 - Ajustes UX/UI ⏳
- [ ] Melhorias visuais
- [ ] Feedback ao usuário
- [ ] Loading states
- [ ] Error handling

### Fase 7 - Produção ⏳
- [ ] Testes completos
- [ ] Migração de ambiente
- [ ] Documentação final
- [ ] Treinamento

---

**Desenvolvido para Sistema de Oficina de Motos**
**Integração: FocusNFe API v2**
**Versão: 1.0.0**
