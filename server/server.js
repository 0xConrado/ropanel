const express = require('express');
const cors = require('cors');
const { exec, execSync } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const platform = os.platform();
const EMULADOR_DIR = path.join(__dirname, 'emuladores');
const registeredClients = new Map();

app.use(cors());
app.use(express.json());

if (!fs.existsSync(EMULADOR_DIR)) {
  fs.mkdirSync(EMULADOR_DIR, { recursive: true });
}

function getPlatformCommands(tipo, operacao) {
  const basePath = path.join(EMULADOR_DIR, tipo);
  
  const commands = {
    linux: {
      compilar: `cd ${basePath} && make clean && make server`,
      iniciar: `cd ${basePath} && ./start-server`,
      parar: `cd ${basePath} && ./stop-server`,
      reiniciar: `cd ${basePath} && ./stop-server && ./start-server`
    },
    win32: {
      compilar: `cd ${basePath} && cmake . && cmake --build .`,
      iniciar: `cd ${basePath} && start start-server.bat`,
      parar: `taskkill /im server.exe /f`,
      reiniciar: `cd ${basePath} && call stop-server.bat && start start-server.bat`
    }
  };

  return commands[platform]?.[operacao] || null;
}

function checkDependencies() {
  const dependencies = {
    linux: ['make', 'gcc'],
    win32: ['cmake']
  };

  const missing = [];
  dependencies[platform].forEach(dep => {
    try {
      execSync(`${platform === 'win32' ? 'where' : 'which'} ${dep}`);
    } catch {
      missing.push(dep);
    }
  });

  return missing;
}

const missingDeps = checkDependencies();
if (missingDeps.length > 0) {
  console.error(`Faltam dependências: ${missingDeps.join(', ')}`);
  if (platform === 'win32') {
    console.error('Instale o CMake: https://cmake.org/download/');
  } else {
    console.error('Instale com: sudo apt-get install build-essential');
  }
  process.exit(1);
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'register' && data.clientId) {
        ws.clientId = data.clientId;
        registeredClients.set(data.clientId, ws);
        ws.send(JSON.stringify({ type: 'registered', success: true }));
      }
    } catch (error) {
      console.error('Erro no WebSocket:', error);
    }
  });

  ws.on('close', () => {
    if (ws.clientId) {
      registeredClients.delete(ws.clientId);
    }
  });
});

function sendWsMessage(clientId, type, data) {
  const ws = registeredClients.get(clientId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

app.post('/api/instalar', (req, res) => {
  const { tipo, repo, clientId } = req.body;
  
  if (!tipo) return res.status(400).json({ error: 'Campo "tipo" é obrigatório.' });
  if (tipo === 'custom' && !repo) return res.status(400).json({ error: 'Campo "repo" é obrigatório para tipo "custom".' });
  if (!registeredClients.has(clientId)) return res.status(400).json({ error: 'Conecte-se via WebSocket e registre-se primeiro', requiresRegistration: true });

  let comando = '';
  switch (tipo) {
    case 'hercules': comando = 'git clone https://github.com/HerculesWS/Hercules.git'; break;
    case 'rathena': comando = 'git clone https://github.com/rathena/rathena.git'; break;
    case 'custom': 
      if (!repo.startsWith('https://')) return res.status(400).json({ error: 'URL deve começar com https://' });
      comando = `git clone ${repo}`;
      break;
    default: return res.status(400).json({ error: 'Tipo de emulador inválido' });
  }

  res.json({ success: true, message: 'Processo de instalação iniciado' });
  sendWsMessage(clientId, 'status', 'Iniciando instalação...');

  const child = exec(comando, { cwd: EMULADOR_DIR });

  child.stdout.on('data', (data) => sendWsMessage(clientId, 'log', data.toString()));
  child.stderr.on('data', (data) => sendWsMessage(clientId, 'error', data.toString()));
  child.on('close', (code) => {
    if (code === 0) {
      sendWsMessage(clientId, 'success', 'Instalação concluída com sucesso!');
      sendWsMessage(clientId, 'complete', { code, operacao: 'instalar', emulador: tipo });
    } else {
      sendWsMessage(clientId, 'error', `Instalação falhou com código ${code}`);
      sendWsMessage(clientId, 'complete', { code });
    }
  });
});

app.post('/api/compilar', (req, res) => {
  const { tipo, clientId, targetOS } = req.body;

  if (!tipo) return res.status(400).json({ error: 'Campo "tipo" é obrigatório.' });
  if (!registeredClients.has(clientId)) return res.status(400).json({ error: 'Conecte-se via WebSocket e registre-se primeiro', requiresRegistration: true });

  const comando = getPlatformCommands(tipo, 'compilar');
  if (!comando) return res.status(400).json({ error: 'Sistema operacional não suportado' });

  res.json({ success: true, message: 'Processo de compilação iniciado' });
  sendWsMessage(clientId, 'status', 'Iniciando compilação...');

  const child = exec(comando);

  child.stdout.on('data', (data) => sendWsMessage(clientId, 'log', data.toString()));
  child.stderr.on('data', (data) => {
    const errorMsg = data.toString();
    if (platform === 'win32' && errorMsg.includes('cmake')) {
      sendWsMessage(clientId, 'error', 'CMake não encontrado. Instale: https://cmake.org/download/');
    } else {
      sendWsMessage(clientId, 'error', errorMsg);
    }
  });
  child.on('close', (code) => {
    if (code === 0) {
      sendWsMessage(clientId, 'success', 'Compilação concluída com sucesso!');
      sendWsMessage(clientId, 'complete', { code, operacao: 'compilar' });
    } else {
      sendWsMessage(clientId, 'error', `Compilação falhou com código ${code}`);
      sendWsMessage(clientId, 'complete', { code });
    }
  });
});

app.post('/api/gerenciar', (req, res) => {
  const { acao, tipo, clientId } = req.body;

  if (!acao || !tipo) return res.status(400).json({ error: 'Campos "acao" e "tipo" são obrigatórios.' });
  if (!registeredClients.has(clientId)) return res.status(400).json({ error: 'Conecte-se via WebSocket e registre-se primeiro', requiresRegistration: true });

  const comando = getPlatformCommands(tipo, acao);
  if (!comando) return res.status(400).json({ error: 'Ação inválida' });

  res.json({ success: true, message: `Processo ${acao} iniciado` });
  sendWsMessage(clientId, 'status', `Executando ação: ${acao}`);

  const child = exec(comando);

  child.stdout.on('data', (data) => sendWsMessage(clientId, 'log', data.toString()));
  child.stderr.on('data', (data) => sendWsMessage(clientId, 'error', data.toString()));
  child.on('close', (code) => {
    if (code === 0) {
      const estado = acao === 'parar' ? 'parado' : 'iniciado';
      sendWsMessage(clientId, 'execucao', { estado });
      sendWsMessage(clientId, 'success', `Ação ${acao} concluída com sucesso!`);
    } else {
      sendWsMessage(clientId, 'error', `Ação ${acao} falhou com código ${code}`);
    }
    sendWsMessage(clientId, 'complete', { code });
  });
});

server.listen(3001, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:3001 (${platform})`);
  console.log('WebSocket disponível em ws://localhost:3001');
});