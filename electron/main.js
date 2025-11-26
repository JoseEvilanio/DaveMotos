const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;
let isDev = process.env.NODE_ENV === 'development';
let USE_BACKEND = isDev;

// Configuração de caminhos
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;

// Criar janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    show: false,
    backgroundColor: '#f9fafb',
    title: 'Sistema de Oficina de Motos',
  });

  // Menu customizado
  const menuTemplate = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Recarregar',
          accelerator: 'F5',
          click: () => mainWindow.reload(),
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Oficina de Motos',
              detail: 'Versão 1.0.0\n\nSistema completo de gestão para oficinas de motos.',
              buttons: ['OK'],
            });
          },
        },
        {
          label: 'Documentação',
          click: () => {
            require('electron').shell.openExternal('file://' + path.join(__dirname, '../MANUAL-INSTALACAO.md'));
          },
        },
      ],
    },
  ];

  if (isDev) {
    menuTemplate.push({
      label: 'Desenvolvedor',
      submenu: [
        {
          label: 'DevTools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.openDevTools(),
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Janela principal aberta');
  });

  // Carregar aplicação
  if (isDev) {
    // Desenvolvimento: Vite dev server
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    // Produção: arquivos estáticos
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('🔍 Modo:', isDev ? 'DEV' : 'PROD');
    console.log('📂 __dirname:', __dirname);
    console.log('📂 Carregando:', indexPath);
    
    mainWindow.loadFile(indexPath);
    
    // DevTools opcional: comentar para não abrir em produção
    // mainWindow.webContents.openDevTools();
    
    // Log de erros
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ Falha ao carregar:', errorCode, errorDescription);
    });
    
    mainWindow.webContents.on('console-message', (event, level, message) => {
      console.log('🖥️ Console:', message);
    });
  }

  // Eventos da janela
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Iniciar backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando servidor backend...');

    // Em desenvolvimento, usar tsx via npx
    // Em produção, usar node com arquivo compilado
    const command = isDev ? 'npx' : 'node';
    const args = isDev 
      ? ['tsx', path.join(__dirname, '../server/index.ts')]
      : [path.join(process.resourcesPath, 'server/index.js')];

    backendProcess = spawn(command, args, {
      cwd: isDev ? path.join(__dirname, '..') : process.resourcesPath,
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: BACKEND_PORT,
      },
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
      if (data.toString().includes('rodando')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar backend:', error);
      reject(error);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend encerrado com código ${code}`);
    });

    // Timeout de 10 segundos
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        resolve(); // Assume que iniciou
      }
    }, 10000);
  });
}

// Verificar se backend está respondendo
async function checkBackend() {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${BACKEND_PORT}/api/health`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject();
          }
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject();
        });
      });
      console.log('✅ Backend respondendo');
      return true;
    } catch (error) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error('❌ Backend não respondeu após 30 tentativas');
  return false;
}

// Parar backend
function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('🛑 Encerrando backend...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// Inicialização do app
app.whenReady().then(async () => {
  console.log('🏍️  Sistema de Oficina de Motos');
  console.log('📂 App Path:', app.getAppPath());
  console.log('📂 User Data:', app.getPath('userData'));
  console.log('🔧 Modo:', isDev ? 'Desenvolvimento' : 'Produção');

  try {
    if (USE_BACKEND) {
      await startBackend();
      const backendReady = await checkBackend();
      if (!backendReady) {
        dialog.showErrorBox('Erro ao Iniciar', 'Não foi possível conectar ao servidor backend.');
        app.quit();
        return;
      }
    }
    createWindow();

    // macOS: recriar janela quando ativado
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    dialog.showErrorBox(
      'Erro ao Iniciar',
      `Erro ao iniciar o sistema:\n\n${error.message}`
    );
    app.quit();
  }
});

// Fechar app
app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Antes de sair
app.on('before-quit', () => {
  stopBackend();
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  dialog.showErrorBox('Erro', `Erro inesperado:\n\n${error.message}`);
});
