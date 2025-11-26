# 📋 Exemplos de JSON para Testes - FocusNFe

Este arquivo contém exemplos prontos de JSON para testar a emissão de notas fiscais.

---

## 🧾 NFC-e - Exemplo Básico

### Venda Simples (Consumidor Não Identificado)

```json
{
  "natureza_operacao": "VENDA",
  "cliente": {
    "nome": "CONSUMIDOR NAO IDENTIFICADO"
  },
  "itens": [
    {
      "numero_item": "1",
      "codigo_produto": "001",
      "descricao": "TROCA DE OLEO",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "120.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    }
  ],
  "formas_pagamento": [
    {
      "forma_pagamento": "17",
      "valor_pagamento": "120.00"
    }
  ]
}
```

---

## 🧾 NFC-e - Venda com Múltiplos Itens

### Serviços + Produtos

```json
{
  "natureza_operacao": "VENDA",
  "cliente": {
    "nome": "CONSUMIDOR NAO IDENTIFICADO"
  },
  "itens": [
    {
      "numero_item": "1",
      "codigo_produto": "SRV001",
      "descricao": "TROCA DE OLEO",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "120.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    },
    {
      "numero_item": "2",
      "codigo_produto": "PRD001",
      "descricao": "OLEO LUBRIFICANTE 1L",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "45.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    },
    {
      "numero_item": "3",
      "codigo_produto": "PRD002",
      "descricao": "FILTRO DE OLEO",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "35.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    }
  ],
  "formas_pagamento": [
    {
      "forma_pagamento": "03",
      "valor_pagamento": "200.00"
    }
  ],
  "informacoes_complementares": "Servico realizado em 24/11/2025"
}
```

---

## 🧾 NFC-e - Venda com Desconto

```json
{
  "natureza_operacao": "VENDA",
  "cliente": {
    "nome": "CONSUMIDOR NAO IDENTIFICADO"
  },
  "itens": [
    {
      "numero_item": "1",
      "codigo_produto": "001",
      "descricao": "REVISAO COMPLETA",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "500.00",
      "valor_desconto": "50.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    }
  ],
  "formas_pagamento": [
    {
      "forma_pagamento": "17",
      "valor_pagamento": "450.00"
    }
  ],
  "informacoes_complementares": "Desconto de R$ 50,00 aplicado - Cliente fidelidade"
}
```

---

## 🧾 NFC-e - Pagamento Misto

```json
{
  "natureza_operacao": "VENDA",
  "cliente": {
    "nome": "CONSUMIDOR NAO IDENTIFICADO"
  },
  "itens": [
    {
      "numero_item": "1",
      "codigo_produto": "001",
      "descricao": "PNEU TRASEIRO",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "350.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    }
  ],
  "formas_pagamento": [
    {
      "forma_pagamento": "01",
      "valor_pagamento": "150.00"
    },
    {
      "forma_pagamento": "03",
      "valor_pagamento": "200.00"
    }
  ],
  "informacoes_complementares": "Pagamento: R$ 150,00 em dinheiro + R$ 200,00 no cartao"
}
```

---

## 📄 NF-e - Exemplo Completo

### Venda para Cliente Pessoa Física

```json
{
  "natureza_operacao": "VENDA",
  "tipo_documento": "1",
  "finalidade_emissao": "1",
  "cliente": {
    "nome": "JOAO DA SILVA",
    "cpf": "111.222.333-44",
    "email": "joao@email.com",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua das Flores",
    "numero": "123",
    "complemento": "Casa",
    "bairro": "Centro",
    "municipio": "Sao Paulo",
    "uf": "SP",
    "cep": "01000-000",
    "codigo_municipio": "3550308"
  },
  "itens": [
    {
      "numero_item": "1",
      "codigo_produto": "PRD001",
      "descricao": "PNEU DIANTEIRO MICHELIN",
      "codigo_ncm": "40114000",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "450.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    },
    {
      "numero_item": "2",
      "codigo_produto": "SRV001",
      "descricao": "INSTALACAO DE PNEU",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "1",
      "valor_unitario_comercial": "50.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    }
  ],
  "formas_pagamento": [
    {
      "forma_pagamento": "17",
      "valor_pagamento": "500.00"
    }
  ],
  "modalidade_frete": "9",
  "informacoes_complementares": "Ordem de Servico: OS-12345"
}
```

---

## 📄 NF-e - Venda para Pessoa Jurídica

```json
{
  "natureza_operacao": "VENDA",
  "tipo_documento": "1",
  "finalidade_emissao": "1",
  "cliente": {
    "nome": "EMPRESA EXEMPLO LTDA",
    "cnpj": "00.000.000/0001-00",
    "inscricao_estadual": "111.111.111.111",
    "email": "contato@empresa.com",
    "telefone": "(11) 3333-4444",
    "endereco": "Av. Paulista",
    "numero": "1000",
    "complemento": "Sala 100",
    "bairro": "Bela Vista",
    "municipio": "Sao Paulo",
    "uf": "SP",
    "cep": "01310-100",
    "codigo_municipio": "3550308"
  },
  "itens": [
    {
      "numero_item": "1",
      "codigo_produto": "PRD100",
      "descricao": "KIT REVISAO COMPLETA",
      "codigo_ncm": "87089900",
      "cfop": "5102",
      "unidade_comercial": "UN",
      "quantidade_comercial": "5",
      "valor_unitario_comercial": "800.00",
      "icms_situacao_tributaria": "102",
      "icms_origem": "0",
      "pis_situacao_tributaria": "07",
      "cofins_situacao_tributaria": "07"
    }
  ],
  "formas_pagamento": [
    {
      "forma_pagamento": "15",
      "valor_pagamento": "4000.00"
    }
  ],
  "modalidade_frete": "0",
  "informacoes_complementares": "Venda para revenda - Pedido: PED-2025-001"
}
```

---

## 🔧 Códigos Úteis

### CFOP Mais Comuns

| Código | Descrição |
|--------|-----------|
| 5102 | Venda de mercadoria adquirida ou recebida de terceiros |
| 5405 | Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária |
| 5933 | Prestação de serviço tributado pelo ISSQN |

### Situação Tributária ICMS (Simples Nacional)

| Código | Descrição |
|--------|-----------|
| 102 | Tributada pelo Simples Nacional sem permissão de crédito |
| 103 | Isenção do ICMS no Simples Nacional para faixa de receita bruta |
| 300 | Imune |
| 400 | Não tributada pelo Simples Nacional |

### Situação Tributária PIS/COFINS

| Código | Descrição |
|--------|-----------|
| 07 | Operação Isenta da Contribuição |
| 49 | Outras Operações de Saída |

### Formas de Pagamento

| Código | Descrição |
|--------|-----------|
| 01 | Dinheiro |
| 02 | Cheque |
| 03 | Cartão de Crédito |
| 04 | Cartão de Débito |
| 05 | Crédito Loja |
| 15 | Boleto Bancário |
| 16 | Depósito Bancário |
| 17 | PIX |
| 18 | Transferência bancária |
| 99 | Outros |

---

## 🧪 Testes Recomendados

### Sequência de Testes

1. **NFC-e Básica**
   - Usar exemplo "Venda Simples"
   - Verificar QR Code
   - Baixar PDF

2. **NFC-e com Múltiplos Itens**
   - Usar exemplo "Serviços + Produtos"
   - Verificar cálculo de totais

3. **NFC-e com Desconto**
   - Usar exemplo "Venda com Desconto"
   - Verificar valor final

4. **NFe Pessoa Física**
   - Usar exemplo "Venda para Cliente Pessoa Física"
   - Verificar dados do cliente

5. **NFe Pessoa Jurídica**
   - Usar exemplo "Venda para Pessoa Jurídica"
   - Verificar CNPJ e IE

6. **Consulta**
   - Consultar nota emitida
   - Verificar status

7. **Cancelamento**
   - Cancelar uma nota de teste
   - Verificar motivo

---

## 📝 Notas Importantes

### Homologação vs Produção

- **Homologação**: Todas as notas são de teste, não têm validade fiscal
- **Produção**: Notas reais, com validade fiscal

### Validações Importantes

1. **CPF/CNPJ**: Deve ser válido
2. **CEP**: Deve existir
3. **Código Município**: Deve ser do IBGE
4. **CFOP**: Deve ser adequado à operação
5. **NCM**: Obrigatório para produtos

### Campos Obrigatórios

#### NFC-e Mínimo
- `itens` (pelo menos 1)
- `formas_pagamento` (pelo menos 1)

#### NFe Mínimo
- `natureza_operacao`
- `cliente` (com dados completos)
- `itens` (pelo menos 1)

---

## 🔗 Links Úteis

- [FocusNFe - Documentação](https://focusnfe.com.br/doc/)
- [Tabela CFOP](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Iy/5Qol1YbE=)
- [Tabela NCM](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/nomenclatura-comum-do-mercosul-ncm)
- [Códigos de Município IBGE](https://www.ibge.gov.br/explica/codigos-dos-municipios.php)

---

**Use estes exemplos como base e adapte conforme sua necessidade!**
