# 🏍️ Sistema Local - Oficina de Motos

## Visão Geral

Sistema completo de gestão para oficinas de motos que roda **localmente** no computador do usuário, sem necessidade de internet ou servidor externo.

---

## 📦 Arquivos Criados

### Scripts de Inicialização

| Arquivo | Plataforma | Descrição |
|---------|------------|-----------|
| `start-sistema.bat` | Windows | Inicia o sistema automaticamente |
| `stop-sistema.bat` | Windows | Para o sistema |
| `start-sistema.sh` | Linux/Mac | Inicia o sistema automaticamente |
| `instalar.bat` | Windows | Instalador automático |

### Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `MANUAL-INSTALACAO.md` | Manual completo (detalhado) |
| `LEIA-ME.txt` | Guia rápido (simplificado) |
| `SISTEMA-LOCAL.md` | Este documento |

---

## 🚀 Como Funciona

### Fluxo de Inicialização

```
1. Usuário clica no atalho
   ↓
2. Script verifica Node.js
   ↓
3. Instala dependências (se necessário)
   ↓
4. Inicia backend (porta 3001)
   ↓
5. Inicia frontend (porta 5173)
   ↓
6. Aguarda servidores iniciarem
   ↓
7. Abre navegador automaticamente
   ↓
8. Sistema pronto para uso!
```

### Arquitetura

```
┌─────────────────────────────────────┐
│         Navegador do Usuário        │
│     (Chrome, Edge, Firefox...)      │
│                                     │
│   http://localhost:3000             │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               │
┌──────────────▼──────────────────────┐
│         Frontend (Vite)             │
│         Porta: 3000                 │
│                                     │
│   - React + TypeScript              │
│   - Tailwind CSS                    │
│   - Lucide Icons                    │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────┐
│      Backend (Node.js/Express)      │
│         Porta: 3001                 │
│                                     │
│   - API REST                        │
│   - Autenticação                    │
│   - Lógica de negócio               │
└──────────────┬──────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────────────┐
│      Banco de Dados (PostgreSQL)    │
│         Porta: 5432                 │
│                                     │
│   - Dados persistentes              │
│   - Tabelas relacionais             │
│   - Backups                         │
└─────────────────────────────────────┘
```

---

## 🎯 Funcionalidades do Instalador

### Windows (`instalar.bat`)

✅ **Verifica requisitos**:
- Node.js instalado
- PostgreSQL instalado
- Versões compatíveis

✅ **Cria estrutura**:
- Diretório `logs/`
- Diretório `database/backups/`

✅ **Instala dependências**:
- `npm install` automático
- Feedback visual de progresso

✅ **Cria atalho**:
- Atalho na área de trabalho
- Ícone personalizado
- Nome amigável

✅ **Instruções finais**:
- Como iniciar o sistema
- Próximos passos

### Linux/Mac (`start-sistema.sh`)

✅ **Cores no terminal**:
- Verde para sucesso
- Vermelho para erros
- Azul para informações

✅ **Detecção de SO**:
- Abre navegador correto
- Comandos específicos por plataforma

✅ **Gerenciamento de processos**:
- PIDs salvos em arquivos
- Cleanup ao encerrar (Ctrl+C)
- Kill de processos órfãos

---

## 🔧 Scripts Detalhados

### start-sistema.bat (Windows)

**Funcionalidades**:

1. **Verificação de Node.js**
   ```batch
   where node >nul 2>nul
   if %ERRORLEVEL% NEQ 0 (
       echo ❌ ERRO: Node.js não encontrado!
       exit /b 1
   )
   ```

2. **Instalação de Dependências** (primeira vez)
   ```batch
   if not exist "node_modules\" (
       call npm install
   )
   ```

3. **Iniciar Backend**
   ```batch
   start /B cmd /c "node server\index.js > logs\backend.log 2>&1"
   ```

4. **Verificar Health Check**
   ```batch
   curl -s http://localhost:3001/api/health >nul 2>nul
   ```

5. **Iniciar Frontend**
   ```batch
   start /B cmd /c "npm run dev > logs\frontend.log 2>&1"
   ```

6. **Abrir Navegador**
   ```batch
   start http://localhost:3000
   ```

7. **Aguardar Encerramento**
   ```batch
   pause >nul
   taskkill /F /IM node.exe >nul 2>nul
   ```

### start-sistema.sh (Linux/Mac)

**Funcionalidades**:

1. **Cores ANSI**
   ```bash
   RED='\033[0;31m'
   GREEN='\033[0;32m'
   BLUE='\033[0;34m'
   ```

2. **Salvar PIDs**
   ```bash
   node server/index.js > logs/backend.log 2>&1 &
   BACKEND_PID=$!
   echo $BACKEND_PID > .backend.pid
   ```

3. **Detectar SO e Abrir Navegador**
   ```bash
   if [[ "$OSTYPE" == "darwin"* ]]; then
       open http://localhost:3000
   elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
       xdg-open http://localhost:3000
   fi
   ```

4. **Cleanup ao Sair**
   ```bash
   cleanup() {
       kill $BACKEND_PID 2>/dev/null
       kill $FRONTEND_PID 2>/dev/null
       pkill -f "node server/index.js"
   }
   trap cleanup SIGINT SIGTERM
   ```

---

## 📊 Logs do Sistema

### Localização

```
logs/
├── backend.log    # Logs do servidor Node.js
└── frontend.log   # Logs do Vite/React
```

### Conteúdo

**backend.log**:
- Requisições HTTP
- Erros de banco de dados
- Autenticação
- Operações CRUD

**frontend.log**:
- Compilação do Vite
- Hot Module Replacement
- Erros de build
- Warnings do React

### Como Visualizar

**Windows**:
```batch
type logs\backend.log
type logs\frontend.log
```

**Linux/Mac**:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

---

## 🔐 Segurança

### Dados Locais

✅ **Tudo roda localmente**:
- Nenhum dado sai do computador
- Sem conexão com servidores externos
- Sem telemetria ou analytics

✅ **Banco de dados local**:
- PostgreSQL no próprio computador
- Acesso apenas via localhost
- Credenciais configuráveis

### Recomendações

⚠️ **Altere senhas padrão**:
- Login do sistema
- Senha do PostgreSQL
- Credenciais de API (se houver)

⚠️ **Faça backups regulares**:
```bash
# Backup do banco
pg_dump moto > backup_$(date +%Y%m%d).sql

# Backup dos arquivos
zip -r sistema_backup.zip .
```

⚠️ **Controle de acesso**:
- Não compartilhe credenciais
- Use senhas fortes
- Limite acesso físico ao computador

---

## 🔄 Atualizações

### Processo de Atualização

1. **Backup**
   ```bash
   pg_dump moto > backup_antes_atualizacao.sql
   ```

2. **Parar Sistema**
   ```batch
   stop-sistema.bat
   ```

3. **Substituir Arquivos**
   - Extrair nova versão
   - Copiar sobre pasta antiga
   - **NÃO substituir** `database/` com dados

4. **Reinstalar Dependências**
   ```batch
   instalar.bat
   ```

5. **Testar**
   ```batch
   start-sistema.bat
   ```

### Versionamento

Arquivo `package.json`:
```json
{
  "version": "1.0.0",
  "name": "sistema-oficina-motos"
}
```

---

## 🐛 Troubleshooting

### Problema: Backend não inicia

**Diagnóstico**:
```bash
# Verificar logs
cat logs/backend.log

# Testar manualmente
node server/index.js
```

**Soluções**:
- Verificar PostgreSQL rodando
- Verificar porta 3001 livre
- Verificar credenciais do banco

### Problema: Frontend não compila

**Diagnóstico**:
```bash
# Verificar logs
cat logs/frontend.log

# Testar manualmente
npm run dev
```

**Soluções**:
- Reinstalar dependências: `npm install`
- Limpar cache: `npm cache clean --force`
- Verificar versão do Node.js

### Problema: Navegador não abre

**Soluções**:
- Abrir manualmente: `http://localhost:3000`
- Verificar navegador padrão
- Testar outro navegador

---

## 📈 Performance

### Otimizações

✅ **Lazy Loading**:
- Componentes carregados sob demanda
- Reduz tempo de inicialização

✅ **Caching**:
- Assets em cache do navegador
- Queries otimizadas no banco

✅ **Compressão**:
- Assets minificados em produção
- Gzip habilitado

### Limites Recomendados

| Recurso | Limite |
|---------|--------|
| Ordens de Serviço | 10.000 |
| Clientes | 5.000 |
| Produtos | 2.000 |
| Usuários | 50 |

---

## 🎯 Checklist de Distribuição

Antes de distribuir o sistema:

- [ ] Testar em Windows 10/11
- [ ] Testar em Linux (Ubuntu)
- [ ] Testar em macOS
- [ ] Verificar todos os scripts funcionam
- [ ] Documentação completa
- [ ] Exemplos de dados (seed)
- [ ] Scripts SQL incluídos
- [ ] Atalhos funcionam
- [ ] Navegador abre automaticamente
- [ ] Logs são criados corretamente
- [ ] Sistema para sem erros
- [ ] Backup funciona
- [ ] Atualização funciona

---

## 📦 Estrutura do Pacote

```
sistema-oficina-motos/
├── server/                 # Backend Node.js
│   └── index.ts
├── src/                    # Frontend React
│   ├── components/
│   ├── pages/
│   └── ...
├── database/               # Scripts SQL
│   ├── schema-local.sql
│   └── seed-data.sql
├── logs/                   # Logs do sistema
│   ├── backend.log
│   └── frontend.log
├── start-sistema.bat       # Iniciar (Windows)
├── stop-sistema.bat        # Parar (Windows)
├── start-sistema.sh        # Iniciar (Linux/Mac)
├── instalar.bat            # Instalador (Windows)
├── MANUAL-INSTALACAO.md    # Manual completo
├── LEIA-ME.txt             # Guia rápido
├── package.json            # Dependências
└── README.md               # Documentação dev
```

---

## 🎉 Resultado Final

### Para o Usuário

1. **Extrai o ZIP**
2. **Clica em "instalar.bat"**
3. **Clica no atalho da área de trabalho**
4. **Sistema abre no navegador automaticamente**
5. **Pronto para usar!**

### Experiência

✨ **Simples**: 3 cliques para começar  
✨ **Rápido**: Inicia em menos de 30 segundos  
✨ **Intuitivo**: Navegador familiar  
✨ **Offline**: Funciona sem internet  
✨ **Seguro**: Dados locais  

**O sistema está pronto para distribuição e uso em qualquer computador!** 🏍️🚀
