# 🧪 GUIA DE TESTE MANUAL - Módulo Fiscal

## ⚠️ IMPORTANTE: Execute estes testes no seu navegador Chrome

Como o Jetski Browser não consegue acessar localhost, siga este guia passo a passo no seu navegador Chrome.

---

## 📋 PRÉ-REQUISITOS

1. ✅ Servidor rodando: `npm run dev` (já está rodando)
2. ✅ Arquivos criados (Fase 1 completa)
3. ✅ Rota adicionada ao App.tsx

---

## 🧪 TESTE 1: Acessar Página de Configuração

### Passo 1: Abrir a Página

No seu navegador Chrome, acesse:

```
http://localhost:5173/#/fiscal/configuracao
```

### Passo 2: Verificar se a Página Carregou

Você deve ver:
- ✅ Título: "Configuração Fiscal"
- ✅ Subtítulo: "Configure a integração com FocusNFe..."
- ✅ Ícone de engrenagem (Settings)
- ✅ Formulário com 3 seções

### Passo 3: Verificar Seções do Formulário

**Seção 1: Credenciais FocusNFe**
- [ ] Campo "Token FocusNFe" (tipo password)
- [ ] Campo "Ambiente" (select com Homologação/Produção)
- [ ] Botão "Testar Conexão"
- [ ] Link para focusnfe.com.br

**Seção 2: Dados do Emitente**
- [ ] Campo "CNPJ"
- [ ] Campo "Inscrição Estadual"
- [ ] Campo "Razão Social"
- [ ] Campo "Nome Fantasia"
- [ ] Campo "Regime Tributário" (select)

**Seção 3: Endereço**
- [ ] Campo "Logradouro"
- [ ] Campo "Número"
- [ ] Campo "Complemento"
- [ ] Campo "Bairro"
- [ ] Campo "Município"
- [ ] Campo "UF"
- [ ] Campo "CEP"
- [ ] Campo "Telefone"
- [ ] Campo "E-mail"

**Botão Final:**
- [ ] Botão "Salvar Configuração" (verde)

---

## 🧪 TESTE 2: Preencher Formulário (Dados de Teste)

### Preencha os seguintes dados:

**Credenciais FocusNFe:**
```
Token: SEU_TOKEN_AQUI (você precisa criar conta na FocusNFe)
Ambiente: Homologação
```

**Dados do Emitente:**
```
CNPJ: 11.222.333/0001-44
Inscrição Estadual: 111.222.333.444
Razão Social: OFICINA TESTE LTDA
Nome Fantasia: Oficina Teste
Regime Tributário: Simples Nacional
```

**Endereço:**
```
Logradouro: Rua Teste
Número: 123
Complemento: Sala 1
Bairro: Centro
Município: São Paulo
UF: SP
CEP: 01000-000
Telefone: (11) 98765-4321
E-mail: teste@oficina.com
```

---

## 🧪 TESTE 3: Testar Validações

### Teste 3.1: Salvar Sem Token

1. Deixe o campo "Token" vazio
2. Clique em "Salvar Configuração"
3. **Resultado Esperado**: Toast de erro "Informe o token da FocusNFe"

### Teste 3.2: Salvar Sem CNPJ

1. Preencha o Token
2. Deixe o CNPJ vazio
3. Clique em "Salvar Configuração"
4. **Resultado Esperado**: Toast de erro "Informe o CNPJ do emitente"

### Teste 3.3: Salvar Sem Razão Social

1. Preencha Token e CNPJ
2. Deixe Razão Social vazia
3. Clique em "Salvar Configuração"
4. **Resultado Esperado**: Toast de erro "Informe a razão social"

---

## 🧪 TESTE 4: Testar Conexão (Requer Token Real)

⚠️ **NOTA**: Para este teste, você precisa de um token real da FocusNFe.

### Como Obter Token de Teste:

1. Acesse: https://focusnfe.com.br
2. Crie uma conta gratuita
3. Vá em "Configurações" > "API"
4. Copie seu token de homologação

### Executar Teste:

1. Cole o token no campo "Token FocusNFe"
2. Selecione "Homologação"
3. Clique em "Testar Conexão"
4. **Resultado Esperado**: 
   - Botão mostra "Testando..." com spinner
   - Após alguns segundos, mostra mensagem de sucesso ou erro
   - Toast aparece com resultado

---

## 🧪 TESTE 5: Salvar Configuração

1. Preencha todos os campos obrigatórios
2. Clique em "Salvar Configuração"
3. **Resultado Esperado**:
   - Toast de sucesso: "Configuração salva com sucesso!"
   - Banner verde aparece no topo: "Módulo Fiscal Configurado"
   - Ambiente exibido no banner

---

## 🧪 TESTE 6: Persistência de Dados

1. Preencha e salve a configuração
2. Recarregue a página (F5)
3. **Resultado Esperado**:
   - Todos os dados permanecem preenchidos
   - Banner verde continua visível
   - Token continua salvo (aparece como •••••)

---

## 🧪 TESTE 7: Verificar Console do Navegador

### Abrir Console:

1. Pressione F12
2. Vá na aba "Console"

### Verificar:

- [ ] Não há erros em vermelho
- [ ] Não há warnings sobre imports
- [ ] Zustand está funcionando (pode ver logs de persist)

---

## 🧪 TESTE 8: Verificar LocalStorage

### No Console do Navegador:

```javascript
// Ver dados salvos
localStorage.getItem('fiscal-storage')

// Deve retornar um JSON com:
// - configuracao
// - configurado: true
// - notas: []
```

---

## 🧪 TESTE 9: Testar Responsividade

1. Redimensione a janela do navegador
2. **Resultado Esperado**:
   - Layout se adapta em telas menores
   - Grid de 2 colunas vira 1 coluna em mobile
   - Todos os campos permanecem acessíveis

---

## 🧪 TESTE 10: Teste de Emissão (Código)

### Abra o Console do Navegador e Execute:

```javascript
// Importar hook (se estiver disponível globalmente)
// Ou adicione este código em um componente de teste

const testeEmissao = async () => {
  // Dados de teste para NFC-e
  const dados = {
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
  };

  console.log('Dados preparados:', dados);
  console.log('Pronto para emitir!');
};

testeEmissao();
```

---

## ✅ CHECKLIST DE RESULTADOS

Marque conforme você testa:

### Página
- [ ] Página carrega sem erros
- [ ] Todos os campos estão visíveis
- [ ] Layout está correto
- [ ] Ícones aparecem

### Funcionalidades
- [ ] Validações funcionam
- [ ] Toast de erro aparece
- [ ] Toast de sucesso aparece
- [ ] Botão "Testar Conexão" funciona
- [ ] Botão "Salvar" funciona

### Persistência
- [ ] Dados são salvos
- [ ] Dados persistem após reload
- [ ] LocalStorage contém dados

### Console
- [ ] Sem erros no console
- [ ] Sem warnings críticos

---

## 📸 TIRE SCREENSHOTS

Por favor, tire screenshots de:

1. ✅ Página carregada (formulário completo)
2. ✅ Formulário preenchido
3. ✅ Toast de sucesso
4. ✅ Banner verde de "Módulo Configurado"
5. ❌ Qualquer erro que aparecer

---

## 🐛 PROBLEMAS COMUNS

### Problema: Página não carrega

**Solução:**
```bash
# Reiniciar servidor
Ctrl+C (no terminal do npm run dev)
npm run dev
```

### Problema: Erro de import

**Solução:**
- Verifique se todos os arquivos foram criados
- Verifique se não há erros de sintaxe
- Limpe o cache: Ctrl+Shift+R

### Problema: Store não funciona

**Solução:**
```javascript
// No console
localStorage.clear()
// Recarregue a página
```

---

## 📊 RELATÓRIO DE TESTE

Após executar todos os testes, preencha:

```
✅ Testes Passados: __/10
❌ Testes Falhados: __/10
⚠️ Problemas Encontrados:
- 
- 
- 

💡 Observações:
- 
- 
- 
```

---

## 🎯 PRÓXIMOS PASSOS

Após confirmar que tudo está funcionando:

1. ✅ Obter token real da FocusNFe
2. ✅ Testar conexão real
3. ✅ Partir para Fase 2 (Emissão de NFC-e)

---

**Execute estes testes e me informe os resultados!** 🚀

Se encontrar algum erro, copie a mensagem completa e me envie.
