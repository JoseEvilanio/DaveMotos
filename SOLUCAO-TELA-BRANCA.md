# 🔧 Solução: Tela Branca no Electron

## 🔍 Problema

O aplicativo Electron abre mas mostra apenas uma tela branca.

**Causa**: O caminho para os arquivos HTML/CSS/JS está incorreto no build de produção.

---

## ✅ Solução Aplicada

### 1. Correção no `electron/main.js`

Adicionei melhor tratamento de caminhos e logs de debug:

```javascript
// Produção: arquivos estáticos
const indexPath = path.join(__dirname, '../dist/index.html');
console.log('📂 Tentando carregar:', indexPath);
mainWindow.loadFile(indexPath).catch(err => {
  console.error('❌ Erro ao carregar index.html:', err);
  // Fallback: tentar caminho alternativo
  const altPath = path.join(process.resourcesPath, 'app/dist/index.html');
  console.log('📂 Tentando caminho alternativo:', altPath);
  mainWindow.loadFile(altPath);
});
```

### 2. Reconstruir o Executável

**IMPORTANTE**: Você precisa reconstruir o executável para aplicar as correções!

---

## 🚀 Como Reconstruir

### Opção 1: Script Automático (Recomendado)

```bash
# Execute este script
rebuild.bat
```

O script irá:
1. ✅ Fechar processos do Electron
2. ✅ Limpar pasta release
3. ✅ Reconstruir executável

### Opção 2: Manual

```bash
# 1. Fechar o aplicativo se estiver aberto
taskkill /F /IM "Sistema Oficina Motos.exe"

# 2. Limpar pasta release
rmdir /s /q release

# 3. Reconstruir
npm run electron:build:win
```

---

## 🧪 Como Testar Após Reconstruir

### 1. Executar o Novo Build

```bash
cd release\win-unpacked
start "Sistema Oficina Motos.exe"
```

### 2. Verificar Console

Abra o DevTools (se habilitado) e veja os logs:
- `📂 Tentando carregar:` - mostra o caminho tentado
- `✅ Janela principal aberta` - confirma que carregou

### 3. O Que Deve Aparecer

- ✅ Tela de login
- ✅ Logo do sistema
- ✅ Campos de usuário e senha
- ✅ Botão de login

---

## 🔍 Diagnóstico Adicional

Se ainda aparecer tela branca após reconstruir:

### Verificar Arquivos do Build

```bash
# Verificar se dist existe
dir dist

# Deve mostrar:
# - index.html
# - assets/
```

### Verificar Logs do Electron

Execute com console:

```bash
cd release\win-unpacked
"Sistema Oficina Motos.exe" --enable-logging
```

Veja os logs em:
```
%APPDATA%\Sistema Oficina Motos\logs\
```

### Verificar DevTools

Adicione temporariamente no `electron/main.js`:

```javascript
// Sempre abrir DevTools para debug
mainWindow.webContents.openDevTools();
```

Depois reconstrua e veja os erros no console.

---

## 🐛 Problemas Comuns

### 1. "Acesso negado" ao reconstruir

**Causa**: Executável ainda está rodando

**Solução**:
```bash
taskkill /F /IM "Sistema Oficina Motos.exe"
timeout /t 2
npm run electron:build:win
```

### 2. Pasta `dist` não existe

**Causa**: Build do frontend não foi executado

**Solução**:
```bash
npm run build
npm run electron:build:win
```

### 3. Arquivos não carregam

**Causa**: Caminho incorreto

**Solução**: Verificar estrutura:
```
release/win-unpacked/
├── Sistema Oficina Motos.exe
└── resources/
    └── app.asar  (contém dist/)
```

---

## 📋 Checklist de Verificação

Antes de distribuir, verifique:

- [ ] `npm run build` executado sem erros
- [ ] Pasta `dist/` existe e contém `index.html`
- [ ] `npm run electron:build:win` completou
- [ ] Executável abre sem tela branca
- [ ] Login funciona
- [ ] Todas as páginas carregam

---

## 🎯 Solução Rápida

**Se você está com pressa**:

```bash
# 1. Fechar tudo
taskkill /F /IM "Sistema Oficina Motos.exe"

# 2. Limpar
rmdir /s /q release dist

# 3. Build completo
npm run build
npm run electron:build:win

# 4. Testar
cd release\win-unpacked
start "Sistema Oficina Motos.exe"
```

---

## ✅ Resultado Esperado

Após reconstruir corretamente, você deve ver:

```
┌─────────────────────────────────────┐
│  🏍️  Sistema de Oficina de Motos   │
│                                     │
│  Usuário: [___________________]    │
│  Senha:   [___________________]    │
│                                     │
│         [ Entrar ]                  │
└─────────────────────────────────────┘
```

**Não mais tela branca!** ✅

---

## 📞 Ainda com Problemas?

Se após seguir todos os passos ainda tiver tela branca:

1. **Verifique os logs**:
   ```
   %APPDATA%\Sistema Oficina Motos\logs\
   ```

2. **Execute com debug**:
   ```bash
   "Sistema Oficina Motos.exe" --enable-logging --v=1
   ```

3. **Verifique se PostgreSQL está rodando**:
   ```bash
   sc query postgresql-x64-14
   ```

4. **Teste em modo desenvolvimento**:
   ```bash
   npm run electron:dev
   ```

---

**A correção foi aplicada! Agora execute `rebuild.bat` para reconstruir.** 🔧✨
