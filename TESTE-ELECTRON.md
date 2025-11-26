# 🧪 Guia de Teste - Electron

## 🚀 Teste Rápido

### 1. Testar em Desenvolvimento

```bash
npm run electron:dev
```

**O que deve acontecer**:
1. ✅ Vite inicia (porta 3000 ou outra disponível)
2. ✅ Backend inicia (porta 3001)
3. ✅ Janela Electron abre automaticamente
4. ✅ Sistema carrega na janela

**Se der erro**:
- Verifique se PostgreSQL está rodando
- Verifique se as portas 3000 e 3001 estão livres
- Veja logs no console

### 2. Testar Funcionalidades

Com a janela aberta, teste:

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Ordens de Serviço listam
- [ ] Criar nova OS funciona
- [ ] Editar OS funciona
- [ ] Excluir OS funciona
- [ ] Clientes listam
- [ ] Veículos listam
- [ ] Produtos listam
- [ ] Financeiro carrega

### 3. Testar Menu

- [ ] Menu "Arquivo" → "Recarregar" (F5)
- [ ] Menu "Ajuda" → "Sobre"
- [ ] Menu "Desenvolvedor" → "DevTools" (F12)

### 4. Testar Fechamento

- [ ] Fechar janela encerra backend
- [ ] Não há processos órfãos

---

## 📦 Teste de Build

### 1. Gerar Executável

```bash
npm run electron:build:win
```

**Tempo estimado**: 5-10 minutos

**O que deve acontecer**:
1. ✅ Frontend compila (dist/)
2. ✅ Electron empacota
3. ✅ Instalador gerado em release/

### 2. Testar Instalador

1. Localize: `release/Sistema Oficina Motos Setup 1.0.0.exe`
2. Execute o instalador
3. Escolha pasta de instalação
4. Aguarde instalação
5. Clique no atalho criado

**O que deve acontecer**:
- ✅ Aplicação abre
- ✅ Sistema funciona normalmente
- ✅ Atalho na área de trabalho criado
- ✅ Atalho no menu iniciar criado

### 3. Testar Aplicação Instalada

- [ ] Abre sem erros
- [ ] Backend inicia
- [ ] Conecta ao PostgreSQL
- [ ] Todas as funcionalidades funcionam
- [ ] Pode ser fechado normalmente
- [ ] Pode ser aberto novamente

---

## 🐛 Problemas Comuns

### Erro: "spawn tsx ENOENT"

**Causa**: tsx não encontrado

**Solução**:
```bash
npm install tsx
```

### Erro: "Port already in use"

**Causa**: Porta 3000 ou 3001 em uso

**Solução**:
1. Feche outros processos
2. Ou mude a porta em `electron/main.js`

### Erro: "Cannot connect to PostgreSQL"

**Causa**: PostgreSQL não está rodando

**Solução**:
1. Inicie PostgreSQL
2. Verifique credenciais em `server/index.ts`

### Erro: "Module not found"

**Causa**: Dependências não instaladas

**Solução**:
```bash
npm install
```

### Build falha

**Causa**: Vários motivos possíveis

**Solução**:
```bash
# Limpar tudo
rm -rf node_modules dist release
npm cache clean --force

# Reinstalar
npm install

# Tentar novamente
npm run electron:build:win
```

---

## ✅ Checklist de Validação

### Desenvolvimento

- [ ] `npm run electron:dev` funciona
- [ ] Janela abre automaticamente
- [ ] Backend inicia sem erros
- [ ] Frontend carrega corretamente
- [ ] Login funciona
- [ ] CRUD de OS funciona
- [ ] Menu funciona
- [ ] DevTools abre (F12)
- [ ] Fechar encerra tudo

### Produção

- [ ] `npm run electron:build:win` completa
- [ ] Instalador gerado
- [ ] Instalador executa
- [ ] Aplicação instala
- [ ] Atalhos criados
- [ ] Aplicação abre
- [ ] Sistema funciona
- [ ] Pode ser desinstalado

---

## 📊 Resultados Esperados

### Performance

- **Tempo de inicialização**: < 10 segundos
- **Uso de memória**: ~200-300 MB
- **Uso de CPU**: < 5% em idle
- **Tamanho do instalador**: ~150-200 MB

### Compatibilidade

- ✅ Windows 10 (64-bit)
- ✅ Windows 11 (64-bit)
- ⚠️ Requer PostgreSQL instalado

---

## 🎯 Próximos Testes

Após validação básica:

1. **Teste de Stress**:
   - Criar 100+ OS
   - Múltiplas janelas
   - Uso prolongado

2. **Teste de Segurança**:
   - SQL injection
   - XSS
   - CSRF

3. **Teste de Usabilidade**:
   - Usuários reais
   - Feedback
   - Melhorias

---

## 📝 Relatório de Teste

Preencha após testar:

**Data**: ___________
**Testador**: ___________
**Versão**: 1.0.0

**Desenvolvimento**:
- [ ] Passou
- [ ] Falhou (descrever)

**Build**:
- [ ] Passou
- [ ] Falhou (descrever)

**Instalação**:
- [ ] Passou
- [ ] Falhou (descrever)

**Funcionalidades**:
- [ ] Todas funcionam
- [ ] Algumas falham (listar)

**Observações**:
_________________________________
_________________________________
_________________________________

---

**Boa sorte nos testes!** 🧪✅
