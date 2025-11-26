# 🚀 INÍCIO RÁPIDO - Módulo Fiscal

## ⚡ 5 Minutos para Começar

### 1️⃣ Criar Tabelas no Banco (1 min)

```bash
psql -U postgres -d seu_banco -f database/fiscal_schema.sql
```

### 2️⃣ Adicionar Rota no App.tsx (1 min)

```tsx
// No topo do arquivo
import ConfiguracaoFiscal from './pages/ConfiguracaoFiscal';

// Dentro de <Routes>
<Route path="/fiscal/configuracao" element={<ConfiguracaoFiscal />} />
```

### 3️⃣ Adicionar Link no Menu (1 min)

No seu componente de Sidebar/Menu, adicione:

```tsx
<Link to="/fiscal/configuracao">
  <Settings className="w-5 h-5" />
  Configuração Fiscal
</Link>
```

### 4️⃣ Obter Token FocusNFe (2 min)

1. Acesse: https://focusnfe.com.br
2. Crie uma conta (gratuita para testes)
3. Copie seu token de API

### 5️⃣ Configurar no Sistema (1 min)

1. Acesse: `http://localhost:5173/fiscal/configuracao`
2. Cole o token
3. Selecione "Homologação"
4. Preencha CNPJ e Razão Social
5. Clique "Testar Conexão"
6. Se OK, clique "Salvar"

---

## ✅ Pronto!

Agora você pode:

```tsx
import { useEmissaoNota } from './hooks/useEmissaoNota';

function TesteNota() {
  const { emitirNFCe } = useEmissaoNota();

  const testar = async () => {
    const nota = await emitirNFCe({
      itens: [{
        descricao: 'TESTE DE EMISSAO',
        cfop: '5102',
        unidade_comercial: 'UN',
        quantidade_comercial: '1',
        valor_unitario_comercial: '10.00',
      }],
      formas_pagamento: [{
        forma_pagamento: '17', // PIX
        valor_pagamento: '10.00',
      }],
    });
    
    if (nota) {
      alert('Nota emitida! Chave: ' + nota.chave);
    }
  };

  return <button onClick={testar}>Emitir Nota Teste</button>;
}
```

---

## 📖 Documentação Completa

- **Técnica**: `docs/MODULO_FISCAL_FOCUSNFE.md`
- **Uso**: `docs/FISCAL_README.md`
- **Exemplos**: `docs/FISCAL_EXEMPLOS_JSON.md`
- **Resumo**: `FISCAL_FASE1_CONCLUIDA.md`

---

## 🆘 Problemas?

### Erro: "Token inválido"
→ Verifique se copiou o token corretamente

### Erro: "Tabela não existe"
→ Execute o script SQL: `database/fiscal_schema.sql`

### Erro: "Módulo não encontrado"
→ Verifique se criou todos os arquivos da Fase 1

### Página não carrega
→ Adicione a rota no `App.tsx`

---

**Boa sorte! 🎉**
