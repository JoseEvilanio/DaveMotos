# 🖥️ Sistema Executável - Electron

## Visão Geral

O sistema agora é um **aplicativo desktop standalone** usando Electron, que empacota:
- Frontend (React + Vite)
- Backend (Node.js + Express)
- Banco de dados (PostgreSQL - requer instalação separada)

---

## 🚀 Como Executar em Desenvolvimento

### Opção 1: Modo Electron (Recomendado)

```bash
npm run electron:dev
```

Isso irá:
1. Iniciar Vite dev server (porta 3000)
2. Iniciar backend API (porta 3001)
3. Abrir janela Electron automaticamente

### Opção 2: Modo Web (Navegador)

```bash
npm run dev:all
```

Abre no navegador como antes.

---

## 📦 Como Gerar Executável

### Windows (.exe)

```bash
# Build completo
npm run electron:build:win
```

O executável será gerado em: `release/Sistema Oficina Motos Setup 1.0.0.exe`

### Requisitos para Build

1. **Node.js** 18+ instalado
2. **Dependências** instaladas:
   ```bash
   npm install
   ```

3. **Ícone** (opcional):
   - Coloque um arquivo `icon.ico` em `assets/`
   - Tamanho recomendado: 256x256px

---

## 📁 Estrutura do Projeto

```
moto-workshop-manager/
├── electron/
│   ├── main.js          # Processo principal do Electron
│   └── preload.js       # Script de segurança
├── server/              # Backend Node.js
│   └── index.ts
├── src/                 # Frontend React
│   ├── components/
│   ├── pages/
│   └── ...
├── dist/                # Build do frontend (gerado)
├── release/             # Executáveis (gerado)
└── package.json
```

---

## 🎯 Funcionalidades do Electron

### Janela Nativa

- ✅ Janela desktop nativa (não é navegador)
- ✅ Tamanho inicial: 1400x900
- ✅ Tamanho mínimo: 1200x700
- ✅ Ícone personalizado
- ✅ Menu customizado

### Menu da Aplicação

**Arquivo**:
- Recarregar (F5)
- Sair (Alt+F4)

**Ajuda**:
- Sobre
- Documentação

**Desenvolvedor** (apenas em dev):
- DevTools (F12)

### Integração Backend

- ✅ Backend inicia automaticamente
- ✅ Verifica se está respondendo
- ✅ Encerra ao fechar aplicação
- ✅ Tratamento de erros

---

## 🔧 Configuração

### Portas

- **Frontend**: 3000 (Vite)
- **Backend**: 3001 (Express)
- **PostgreSQL**: 5432 (padrão)

### Variáveis de Ambiente

O Electron define automaticamente:
- `NODE_ENV=development` (em dev)
- `NODE_ENV=production` (em build)

---

## 🐛 Troubleshooting

### Problema: "Electron não encontrado"

```bash
npm install --save-dev electron
```

### Problema: "Backend não inicia"

1. Verifique se PostgreSQL está rodando
2. Verifique logs no console do Electron
3. Teste backend separadamente:
   ```bash
   npm run dev:api
   ```

### Problema: "Build falha"

1. Limpe cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. Verifique espaço em disco (build precisa de ~500MB)

3. Execute build do frontend primeiro:
   ```bash
   npm run build
   ```

### Problema: "Executável não abre"

1. Verifique se PostgreSQL está instalado
2. Execute como Administrador
3. Verifique antivírus (pode bloquear)

---

## 📊 Comparação: Web vs Electron

| Característica | Web (Navegador) | Electron (Desktop) |
|----------------|-----------------|-------------------|
| Instalação | Scripts .bat | Instalador .exe |
| Interface | Navegador | Janela nativa |
| Ícone | Favicon | Ícone desktop |
| Menu | Nenhum | Menu nativo |
| Atalhos | Nenhum | Atalho desktop |
| Distribuição | ZIP | Instalador |
| Atualizações | Manual | Auto-update (futuro) |
| Offline | ✅ | ✅ |

---

## 🎨 Personalização

### Alterar Ícone

1. Crie um ícone 256x256px
2. Converta para .ico (Windows)
3. Salve em `assets/icon.ico`
4. Rebuild

### Alterar Nome

Em `package.json`:
```json
{
  "build": {
    "productName": "Seu Nome Aqui"
  }
}
```

### Alterar Janela

Em `electron/main.js`:
```javascript
const mainWindow = new BrowserWindow({
  width: 1600,  // Largura
  height: 1000, // Altura
  // ...
});
```

---

## 🚀 Distribuição

### Para Usuários Finais

1. **Gere o executável**:
   ```bash
   npm run electron:build:win
   ```

2. **Localize o instalador**:
   `release/Sistema Oficina Motos Setup 1.0.0.exe`

3. **Distribua**:
   - Upload em servidor
   - Envio por email
   - Pen drive
   - Rede local

### Instalação pelo Usuário

1. Execute o instalador
2. Escolha pasta de instalação
3. Aguarde instalação
4. Clique no atalho criado
5. **Pronto!**

---

## 📝 Notas Importantes

### PostgreSQL

⚠️ **O PostgreSQL NÃO está embutido no executável**

O usuário precisa ter PostgreSQL instalado separadamente:
1. Download: https://www.postgresql.org/download/
2. Instalar
3. Criar banco `moto`
4. Executar scripts SQL

### Alternativa: SQLite

Para um executável **100% standalone**, considere migrar para SQLite:
- Não precisa de instalação separada
- Banco embutido no executável
- Mais simples para distribuição

---

## 🔄 Próximos Passos

### Melhorias Futuras

- [ ] Auto-update (atualização automática)
- [ ] Splash screen (tela de carregamento)
- [ ] Notificações desktop
- [ ] Tray icon (ícone na bandeja)
- [ ] Migrar para SQLite (banco embutido)
- [ ] Assinatura digital do executável
- [ ] Instalador customizado

---

## 📞 Suporte

### Logs

Em desenvolvimento:
- Console do Electron mostra logs
- DevTools (F12) para frontend

Em produção:
- Logs em: `%APPDATA%/moto-workshop-manager/logs/`

### Comandos Úteis

```bash
# Testar em dev
npm run electron:dev

# Build
npm run electron:build:win

# Limpar e rebuild
rm -rf dist release
npm run build
npm run electron:build:win
```

---

## ✅ Checklist de Build

Antes de distribuir:

- [ ] Testado em desenvolvimento
- [ ] Frontend compila sem erros
- [ ] Backend funciona
- [ ] PostgreSQL conecta
- [ ] Ícone personalizado
- [ ] Nome correto
- [ ] Versão atualizada
- [ ] Build gerado com sucesso
- [ ] Instalador testado
- [ ] Aplicação abre corretamente
- [ ] Todas as funcionalidades funcionam

---

**O sistema agora é um aplicativo desktop profissional!** 🏍️💻✨
