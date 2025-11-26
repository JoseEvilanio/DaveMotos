#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🏍️  SISTEMA DE OFICINA DE MOTOS  🏍️                ║"
echo "║                                                            ║"
echo "║              Iniciando o sistema...                        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERRO: Node.js não encontrado!${NC}"
    echo ""
    echo "Por favor, instale o Node.js antes de continuar:"
    echo "https://nodejs.org/"
    echo ""
    read -p "Pressione Enter para sair..."
    exit 1
fi

echo -e "${GREEN}✓ Node.js encontrado${NC}"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências pela primeira vez...${NC}"
    echo "   Isso pode levar alguns minutos..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}❌ Erro ao instalar dependências!${NC}"
        read -p "Pressione Enter para sair..."
        exit 1
    fi
    echo ""
    echo -e "${GREEN}✓ Dependências instaladas com sucesso!${NC}"
    echo ""
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Iniciar o backend em segundo plano
echo -e "${BLUE}🚀 Iniciando servidor backend...${NC}"
node server/index.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid

# Aguardar o backend iniciar
echo "   Aguardando servidor inicializar..."
sleep 3

# Verificar se o backend está rodando
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   Aguardando mais um pouco..."
    sleep 3
fi

echo -e "${GREEN}✓ Servidor backend iniciado!${NC}"
echo ""

# Iniciar o frontend em segundo plano
echo -e "${BLUE}🎨 Iniciando interface do sistema...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid

# Aguardar o frontend iniciar
echo "   Aguardando interface carregar..."
sleep 5

echo -e "${GREEN}✓ Interface iniciada!${NC}"
echo ""

# Abrir o navegador
echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
sleep 2

# Detectar sistema operacional e abrir navegador
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    elif command -v gnome-open &> /dev/null; then
        gnome-open http://localhost:3000
    else
        echo "Por favor, abra manualmente: http://localhost:3000"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ✅ SISTEMA INICIADO COM SUCESSO! ✅                 ║"
echo "║                                                            ║"
echo "║    O sistema está rodando em: http://localhost:3000       ║"
echo "║                                                            ║"
echo "║    ⚠️  NÃO FECHE ESTA JANELA enquanto usar o sistema!     ║"
echo "║                                                            ║"
echo "║    Para encerrar: Pressione Ctrl+C                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Função para limpar ao sair
cleanup() {
    echo ""
    echo "🛑 Encerrando sistema..."
    
    # Ler PIDs dos arquivos
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null
        rm .frontend.pid
    fi
    
    # Matar todos os processos node relacionados
    pkill -f "node server/index.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    echo "✓ Sistema encerrado!"
    sleep 2
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Aguardar indefinidamente
echo "Pressione Ctrl+C para encerrar o sistema..."
wait
