# 🚀 Guia Completo de Produção - Sistema Oficina de Motos

## 📋 Índice

1. [Preparação](#preparação)
2. [Build do Executável](#build-do-executável)
3. [Teste do Instalador](#teste-do-instalador)
4. [Distribuição](#distribuição)
5. [Instalação no Cliente](#instalação-no-cliente)
6. [Suporte e Manutenção](#suporte-e-manutenção)

---

## 1️⃣ Preparação

### Passo 1: Verificar Ambiente

```bash
# Verificar Node.js
node --version
# Deve ser 18.x ou superior

# Verificar npm
npm --version

# Verificar dependências
npm list --depth=0
```

### Passo 2: Atualizar Versão

Edite `package.json`:
```json
{
  "version": "1.0.0"  // Atualize para 1.0.1, 1.1.0, etc
}
```

### Passo 3: Criar/Atualizar Ícone

1. **Crie um ícone 256x256px** (PNG)
2. **Converta para .ico**:
   - Online: https://convertio.co/png-ico/
   - Ou use: https://www.icoconverter.com/

3. **Salve em**: `assets/icon.ico`

```
assets/
└── icon.ico  (256x256, 32-bit)
```

### Passo 4: Limpar Projeto

```bash
# Remover builds antigos
rm -rf dist
rm -rf release

# Limpar cache
npm cache clean --force

# Reinstalar dependências (opcional)
rm -rf node_modules
npm install
```

### Passo 5: Configurar Variáveis de Produção

Crie `server/.env.production`:
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moto
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

---

## 2️⃣ Build do Executável

### Passo 1: Build do Frontend

```bash
npm run build
```

**Verificar**:
- ✅ Pasta `dist/` criada
- ✅ Arquivos HTML, CSS, JS gerados
- ✅ Sem erros no console

### Passo 2: Gerar Executável Windows

```bash
npm run electron:build:win
```

**Tempo estimado**: 5-15 minutos

**O que acontece**:
1. Compila TypeScript
2. Empacota frontend
3. Empacota backend
4. Empacota Node.js
5. Empacota Electron
6. Cria instalador NSIS

**Progresso**:
```
• electron-builder  version=24.x.x
• loaded configuration  file=package.json
• building        target=nsis arch=x64
• packaging       platform=win32 arch=x64
• building block map  blockMapFile=dist\Sistema Oficina Motos Setup 1.0.0.exe.blockmap
• building        target=nsis file=release\Sistema Oficina Motos Setup 1.0.0.exe
```

### Passo 3: Verificar Arquivos Gerados

```
release/
├── Sistema Oficina Motos Setup 1.0.0.exe  (Instalador - ~150-200 MB)
├── Sistema Oficina Motos Setup 1.0.0.exe.blockmap
└── win-unpacked/  (Versão descompactada - para testes)
    ├── Sistema Oficina Motos.exe
    ├── resources/
    └── ...
```

---

## 3️⃣ Teste do Instalador

### Teste 1: Instalação Limpa

1. **Execute o instalador**:
   ```
   release\Sistema Oficina Motos Setup 1.0.0.exe
   ```

2. **Siga o wizard**:
   - Aceite os termos
   - Escolha pasta de instalação (padrão: `C:\Program Files\Sistema Oficina Motos`)
   - Marque "Criar atalho na área de trabalho"
   - Clique em "Instalar"

3. **Aguarde instalação** (~30 segundos)

4. **Verifique**:
   - ✅ Atalho na área de trabalho criado
   - ✅ Atalho no menu iniciar criado
   - ✅ Pasta de instalação criada

### Teste 2: Primeira Execução

1. **Clique no atalho** da área de trabalho

2. **O que deve acontecer**:
   - Janela do aplicativo abre
   - Backend inicia automaticamente
   - Tela de login aparece

3. **Teste login**:
   - Usuário: `admin`
   - Senha: `admin123`

4. **Navegue pelo sistema**:
   - Dashboard
   - Ordens de Serviço
   - Clientes
   - Veículos
   - Produtos
   - Financeiro

### Teste 3: Funcionalidades Críticas

- [ ] Criar nova OS
- [ ] Editar OS existente
- [ ] Excluir OS
- [ ] Adicionar cliente
- [ ] Adicionar veículo
- [ ] Adicionar produto
- [ ] Registrar pagamento
- [ ] Gerar relatório

### Teste 4: Fechar e Reabrir

1. Feche o aplicativo
2. Abra novamente
3. Verifique se:
   - Dados persistiram
   - Login funciona
   - Tudo carrega normalmente

### Teste 5: Desinstalação

1. Painel de Controle → Programas → Desinstalar
2. Procure "Sistema Oficina Motos"
3. Clique em "Desinstalar"
4. Verifique se:
   - Aplicativo foi removido
   - Atalhos foram removidos
   - Pasta de instalação foi removida

---

## 4️⃣ Distribuição

### Opção 1: Distribuição Local (Pen Drive / Rede)

**Preparar**:
```bash
# Copiar instalador
cp "release/Sistema Oficina Motos Setup 1.0.0.exe" /caminho/destino/

# Opcional: Criar README
echo "Instruções de Instalação" > README.txt
```

**Estrutura recomendada**:
```
SistemaOficinaMotos_v1.0.0/
├── Sistema Oficina Motos Setup 1.0.0.exe
├── README.txt
├── MANUAL-INSTALACAO.pdf
└── requisitos.txt
```

### Opção 2: Distribuição via Download

**Hospedar em**:
- Google Drive
- Dropbox
- OneDrive
- Servidor próprio
- GitHub Releases

**Exemplo GitHub Releases**:
```bash
# 1. Criar tag
git tag v1.0.0
git push origin v1.0.0

# 2. Criar release no GitHub
# 3. Upload do instalador
# 4. Compartilhar link
```

### Opção 3: Servidor Web

**Estrutura**:
```
https://seusite.com/downloads/
├── oficina-motos-v1.0.0.exe
├── oficina-motos-v1.0.0.exe.sha256
└── index.html (página de download)
```

**Gerar checksum**:
```bash
# Windows (PowerShell)
Get-FileHash "Sistema Oficina Motos Setup 1.0.0.exe" -Algorithm SHA256

# Linux/Mac
sha256sum "Sistema Oficina Motos Setup 1.0.0.exe"
```

---

## 5️⃣ Instalação no Cliente

### Requisitos do Cliente

**Hardware Mínimo**:
- Processador: Intel Core i3 ou equivalente
- RAM: 4 GB
- Disco: 500 MB livres
- SO: Windows 10/11 (64-bit)

**Software Necessário**:
- ✅ PostgreSQL 14+ (instalado e rodando)
- ✅ Banco de dados `moto` criado
- ✅ Scripts SQL executados

### Passo a Passo para o Cliente

#### 1. Instalar PostgreSQL

```
1. Download: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Senha do postgres: [ANOTAR]
4. Porta: 5432 (padrão)
5. Concluir instalação
```

#### 2. Criar Banco de Dados

**Via pgAdmin**:
```
1. Abrir pgAdmin
2. Conectar ao servidor local
3. Databases → Create → Database
4. Nome: moto
5. Save
```

**Via linha de comando**:
```bash
psql -U postgres
CREATE DATABASE moto;
\q
```

#### 3. Executar Scripts SQL

```bash
# Navegar até pasta dos scripts
cd C:\SistemaOficinaMotos\database

# Executar schema
psql -U postgres -d moto -f schema-local.sql

# Executar dados iniciais (opcional)
psql -U postgres -d moto -f seed-data.sql
```

#### 4. Instalar o Sistema

```
1. Executar: Sistema Oficina Motos Setup 1.0.0.exe
2. Seguir wizard de instalação
3. Aguardar conclusão
4. Clicar no atalho criado
```

#### 5. Primeiro Acesso

```
Usuário: admin
Senha: admin123

⚠️ IMPORTANTE: Alterar senha após primeiro login!
```

---

## 6️⃣ Suporte e Manutenção

### Logs do Sistema

**Localização**:
```
Windows: C:\Users\[Usuario]\AppData\Roaming\moto-workshop-manager\logs\
```

**Arquivos**:
- `backend.log` - Logs do servidor
- `frontend.log` - Logs da interface
- `electron.log` - Logs do Electron

### Backup do Banco

**Manual**:
```bash
# Backup
pg_dump -U postgres moto > backup_moto_2025-10-29.sql

# Restaurar
psql -U postgres -d moto < backup_moto_2025-10-29.sql
```

**Automatizado** (criar script):
```batch
@echo off
set DATA=%date:~-4,4%%date:~-7,2%%date:~-10,2%
pg_dump -U postgres moto > "C:\Backups\moto_%DATA%.sql"
```

### Atualizações

**Processo**:
1. Gerar nova versão (ex: 1.1.0)
2. Distribuir novo instalador
3. Cliente executa novo instalador
4. Instalador atualiza automaticamente
5. Dados são preservados

**Migração de Banco** (se necessário):
```sql
-- Criar script de migração
-- migration_1.0.0_to_1.1.0.sql

ALTER TABLE ordens_servico ADD COLUMN nova_coluna VARCHAR(255);
-- ...
```

### Problemas Comuns

#### "Não conecta ao banco"

**Diagnóstico**:
```bash
# Testar conexão
psql -U postgres -d moto -c "SELECT 1;"
```

**Soluções**:
1. Verificar se PostgreSQL está rodando
2. Verificar credenciais em `server/index.ts`
3. Verificar firewall
4. Verificar porta 5432

#### "Aplicação não abre"

**Soluções**:
1. Executar como Administrador
2. Verificar antivírus
3. Verificar logs
4. Reinstalar

#### "Erro ao salvar dados"

**Soluções**:
1. Verificar conexão com banco
2. Verificar permissões do usuário
3. Verificar espaço em disco
4. Verificar logs

---

## 📦 Checklist de Produção

### Antes do Build

- [ ] Versão atualizada em `package.json`
- [ ] Ícone criado e salvo em `assets/icon.ico`
- [ ] Código testado em desenvolvimento
- [ ] Todas as funcionalidades funcionando
- [ ] Sem erros no console
- [ ] Sem warnings críticos
- [ ] Documentação atualizada

### Durante o Build

- [ ] `npm run build` sem erros
- [ ] `npm run electron:build:win` completa
- [ ] Instalador gerado em `release/`
- [ ] Tamanho do instalador razoável (~150-200 MB)

### Após o Build

- [ ] Instalador testado em máquina limpa
- [ ] Aplicação abre corretamente
- [ ] Login funciona
- [ ] CRUD funciona
- [ ] Relatórios funcionam
- [ ] Pode ser desinstalado

### Distribuição

- [ ] Instalador copiado para local seguro
- [ ] Checksum gerado (SHA256)
- [ ] README criado
- [ ] Manual de instalação incluído
- [ ] Scripts SQL incluídos
- [ ] Link de download criado (se aplicável)

### Suporte

- [ ] Documentação de suporte criada
- [ ] Processo de backup documentado
- [ ] Processo de atualização documentado
- [ ] Contatos de suporte definidos
- [ ] FAQ criado

---

## 🎯 Comandos Rápidos

```bash
# Limpar tudo
rm -rf dist release node_modules
npm cache clean --force

# Reinstalar
npm install

# Build completo
npm run build
npm run electron:build:win

# Testar instalador
cd release
start "Sistema Oficina Motos Setup 1.0.0.exe"
```

---

## 📊 Métricas de Sucesso

### Performance

- ✅ Instalação: < 2 minutos
- ✅ Primeira abertura: < 15 segundos
- ✅ Login: < 3 segundos
- ✅ Carregar lista: < 2 segundos
- ✅ Salvar registro: < 1 segundo

### Qualidade

- ✅ Taxa de erro: < 1%
- ✅ Crashes: 0
- ✅ Bugs críticos: 0
- ✅ Satisfação do usuário: > 90%

---

## 🔐 Segurança

### Antes de Distribuir

- [ ] Senhas padrão documentadas
- [ ] Conexão HTTPS (se aplicável)
- [ ] SQL injection prevenido
- [ ] XSS prevenido
- [ ] Validação de inputs
- [ ] Logs não expõem dados sensíveis

### Recomendações

1. **Alterar senhas padrão** após instalação
2. **Backup regular** do banco de dados
3. **Atualizar** sistema regularmente
4. **Monitorar** logs de erro
5. **Limitar acesso** ao banco de dados

---

## 📞 Suporte ao Cliente

### Informações para Fornecer

**Contato**:
- Email: suporte@oficinamotos.com
- Telefone: (11) 1234-5678
- WhatsApp: (11) 91234-5678

**Horário de Atendimento**:
- Segunda a Sexta: 8h às 18h
- Sábado: 8h às 12h

**Documentação**:
- Manual do Usuário: `MANUAL-USUARIO.pdf`
- FAQ: `FAQ.pdf`
- Vídeos: youtube.com/oficinamotos

---

## 🎉 Conclusão

**Seu sistema está pronto para produção!**

Siga este guia passo a passo e você terá:
- ✅ Executável profissional
- ✅ Instalação simples
- ✅ Sistema funcionando
- ✅ Clientes satisfeitos

**Boa sorte com o lançamento!** 🏍️🚀✨
