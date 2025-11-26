# 📘 MANUAL DO MÓDULO FISCAL - OFICINA MOTO

Este documento é um guia completo para utilização do novo Módulo Fiscal do Sistema de Oficina de Motos.

---

## 🚀 1. CONFIGURAÇÃO INICIAL

Antes de emitir qualquer nota, é necessário configurar o sistema.

1.  Acesse o menu **Fiscal > Configuração**.
2.  **Token de Acesso**: Insira o token fornecido pela FocusNFe.
    *   Para testes, use o token de **Homologação**.
    *   Para valer, use o token de **Produção**.
3.  **Ambiente**: Selecione "Homologação" para testes ou "Produção" para emitir notas reais.
4.  **Dados do Emitente**: Preencha todos os campos obrigatórios (CNPJ, Razão Social, Endereço Completo).
5.  Clique em **Testar Conexão** para verificar se está tudo certo.
6.  Clique em **Salvar Configurações**.

---

## 🧾 2. EMISSÃO DE NFC-e (Consumidor)

A Nota Fiscal de Consumidor Eletrônica (NFC-e) é usada para vendas diretas ao consumidor final.

### Via Menu Fiscal
1.  Acesse **Fiscal > Emitir NFC-e**.
2.  **Cliente**: Opcional. Se deixar em branco, sairá como "CONSUMIDOR NAO IDENTIFICADO".
3.  **Itens**: Adicione os produtos ou serviços.
4.  **Pagamento**: Informe como o cliente pagou (Dinheiro, PIX, Cartão).
5.  Clique em **Emitir NFC-e**.

### Via Ordem de Serviço (Recomendado)
1.  Acesse **Ordens de Serviço**.
2.  Localize uma OS com status **Concluída**.
3.  Clique no ícone de **Recibo (Roxo)** na coluna de ações.
4.  O sistema abrirá a tela de emissão já preenchida com:
    *   Nome do Cliente
    *   Peças e Serviços da OS
    *   Valores totais
5.  Revise os dados e clique em **Emitir NFC-e**.

---

## 📄 3. EMISSÃO DE NF-e (Modelo 55)

A Nota Fiscal Eletrônica (NF-e) é usada para operações mais complexas ou vendas para empresas.

1.  Acesse **Fiscal > Emitir NF-e**.
2.  **Cliente**: Obrigatório preencher todos os dados (CPF/CNPJ, Endereço completo).
3.  **Itens**: Adicione os produtos.
4.  **Pagamento**: Informe as formas de pagamento.
5.  Clique em **Emitir NF-e**.

---

## 📊 4. DASHBOARD E HISTÓRICO

### Dashboard Fiscal
Acesse **Fiscal > Dashboard** para ver:
*   Total vendido no dia e no mês.
*   Gráfico de faturamento dos últimos 7 dias.
*   Quantidade de notas emitidas e canceladas.
*   Status da conexão com a SEFAZ.

### Histórico de Notas
Acesse **Fiscal > Histórico** para:
*   Ver todas as notas emitidas.
*   **Baixar PDF (DANFE)** e **XML** das notas.
*   **Cancelar** uma nota (se dentro do prazo legal).
*   Consultar o status atual na SEFAZ.

---

## ❓ PERGUNTAS FREQUENTES

**O que fazer se der erro na emissão?**
Verifique a mensagem de erro. Geralmente é algum dado cadastral inválido (NCM do produto, CPF do cliente ou Endereço incompleto). Corrija e tente novamente.

**Posso cancelar uma nota?**
Sim, geralmente em até 30 minutos após a emissão para NFC-e e 24h para NF-e. Vá em **Histórico**, clique em "Ver Detalhes" e depois em "Cancelar". É obrigatório informar uma justificativa.

**Como faço backup das notas?**
O sistema salva o XML e PDF localmente, mas recomendamos baixar periodicamente os arquivos XML pelo menu **Histórico** para guardar em local seguro.

---

## 📞 SUPORTE

Em caso de dúvidas técnicas ou erros de sistema, entre em contato com o suporte técnico.
