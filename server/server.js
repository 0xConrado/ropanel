const express = require('express');
const cors = require('cors');
const { exec, execSync, spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const platform = os.platform();

const EMULADOR_DIR = '/root/Emulador';
const registeredClients = new Map();
const runningServers = {}; // Para guardar os processos spawn

app.use(cors());
app.use(express.json());

if (!fs.existsSync(EMULADOR_DIR)) {
  fs.mkdirSync(EMULADOR_DIR, { recursive: true });
}

// Função para comandos por plataforma
function getPlatformCommands(tipo, operacao) {
  const basePath = path.join(EMULADOR_DIR, tipo);

  const commands = {
    linux: {
      compilar: `cd ${basePath} && [ -f configure ] && chmod +x configure && ./configure ; [ -f Makefile ] && make clean || true ; make server`,
      iniciar: null,
      parar: null,
      reiniciar: null
    },
    win32: {
      compilar: `cd ${basePath} && cmake . && cmake --build .`,
      iniciar: null,
      parar: null,
      reiniciar: null
    }
  };

  return commands[platform]?.[operacao] || null;
}

// Checagem de dependências básicas
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

// WebSocket para feedback em tempo real
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
    ws.send(JSON.stringify({ type, ...data }));
  }
}

// Endpoint para instalar emulador (agora com logs em tempo real)
app.post('/api/instalar', (req, res) => {
  const { tipo, repo, clientId } = req.body;

  if (!tipo) return res.status(400).json({ error: 'Campo "tipo" é obrigatório.' });
  if (tipo === 'custom' && !repo) return res.status(400).json({ error: 'Campo "repo" é obrigatório para tipo "custom".' });
  if (!registeredClients.has(clientId)) return res.status(400).json({ error: 'Conecte-se via WebSocket e registre-se primeiro', requiresRegistration: true });

  let comando = '';
  let args = [];
  if (tipo === 'hercules') {
    comando = 'git';
    args = ['clone', 'https://github.com/HerculesWS/Hercules.git'];
  } else if (tipo === 'rathena') {
    comando = 'git';
    args = ['clone', 'https://github.com/rathena/rathena.git'];
  } else if (tipo === 'custom') {
    if (!repo.startsWith('https://')) return res.status(400).json({ error: 'URL deve começar com https://' });
    comando = 'git';
    args = ['clone', repo];
  } else {
    return res.status(400).json({ error: 'Tipo de emulador inválido' });
  }

  res.json({ success: true, message: 'Processo de instalação iniciado' });
  sendWsMessage(clientId, 'status', { data: 'Iniciando instalação...' });

  const child = spawn(comando, args, { cwd: EMULADOR_DIR });

  child.stdout.on('data', (data) => sendWsMessage(clientId, 'log', { data: data.toString() }));
  child.stderr.on('data', (data) => sendWsMessage(clientId, 'log', { data: data.toString() }));
  child.on('close', (code) => {
    if (code === 0) {
      sendWsMessage(clientId, 'success', { data: 'Instalação concluída com sucesso!' });
      sendWsMessage(clientId, 'complete', { code, operacao: 'instalar', emulador: tipo });
    } else {
      sendWsMessage(clientId, 'error', { data: `Instalação falhou com código ${code}` });
      sendWsMessage(clientId, 'complete', { code });
    }
  });
});

// Endpoint para compilar emulador
app.post('/api/compilar', (req, res) => {
  const { tipo, clientId } = req.body;

  if (!tipo) return res.status(400).json({ error: 'Campo "tipo" é obrigatório.' });
  if (!registeredClients.has(clientId)) return res.status(400).json({ error: 'Conecte-se via WebSocket e registre-se primeiro', requiresRegistration: true });

  const comando = getPlatformCommands(tipo, 'compilar');
  if (!comando) return res.status(400).json({ error: 'Sistema operacional não suportado' });

  res.json({ success: true, message: 'Processo de compilação iniciado' });
  sendWsMessage(clientId, 'status', { data: 'Iniciando compilação...' });

  const child = exec(comando);

  child.stdout.on('data', (data) => sendWsMessage(clientId, 'log', { data: data.toString() }));
  child.stderr.on('data', (data) => {
    const errorMsg = data.toString();
    if (platform === 'win32' && errorMsg.includes('cmake')) {
      sendWsMessage(clientId, 'error', { data: 'CMake não encontrado. Instale: https://cmake.org/download/' });
    } else {
      sendWsMessage(clientId, 'error', { data: errorMsg });
    }
  });
  child.on('close', (code) => {
    if (code === 0) {
      sendWsMessage(clientId, 'success', { data: 'Compilação concluída com sucesso!' });
      sendWsMessage(clientId, 'complete', { code, operacao: 'compilar' });
    } else {
      sendWsMessage(clientId, 'error', { data: `Compilação falhou com código ${code}` });
      sendWsMessage(clientId, 'complete', { code });
    }
  });
});

// Endpoint para gerenciar emulador (iniciar, parar, reiniciar, desinstalar)
app.post('/api/gerenciar', (req, res) => {
  const { acao, tipo, clientId } = req.body;

  if (!acao || !tipo) return res.status(400).json({ error: 'Campos "acao" e "tipo" são obrigatórios.' });
  if (!registeredClients.has(clientId)) return res.status(400).json({ error: 'Conecte-se via WebSocket e registre-se primeiro', requiresRegistration: true });

  const basePath = path.join(EMULADOR_DIR, tipo);

  // Desinstalar
  if (acao === "desinstalar") {
    const emuladorPath = path.join(EMULADOR_DIR, tipo);
    exec(`rm -rf ${emuladorPath}`, (err) => {
      if (err) {
        sendWsMessage(clientId, 'error', { data: `Erro ao desinstalar: ${err.message}` });
        return res.status(500).json({ error: "Erro ao desinstalar" });
      }
      sendWsMessage(clientId, 'success', { data: 'Emulador desinstalado com sucesso!' });
      setTimeout(() => {
        sendWsMessage(clientId, 'complete', { code: 0, operacao: 'desinstalar' });
      }, 500);
      return res.json({ success: true });
    });
    return;
  }

  // Iniciar (logs em tempo real)
  if (acao === "iniciar") {
    // Se já estiver rodando, não inicia de novo
    if (runningServers[tipo]) {
      sendWsMessage(clientId, 'error', { data: 'Servidores já estão rodando.' });
      return res.json({ error: 'Já rodando' });
    }

    const servers = [
      { name: "login", bin: "./login-server" },
      { name: "char", bin: "./char-server" },
      { name: "map", bin: "./map-server" }
    ];

    runningServers[tipo] = {};

    servers.forEach(({ name, bin }) => {
      const proc = spawn(bin, [], { cwd: basePath });

      runningServers[tipo][name] = proc;

      proc.stdout.on('data', (data) => {
        sendWsMessage(clientId, 'log', { server: name, data: data.toString() });
      });
      proc.stderr.on('data', (data) => {
        sendWsMessage(clientId, 'log', { server: name, data: data.toString() });
      });
      proc.on('close', (code) => {
        sendWsMessage(clientId, 'log', { server: name, data: `Processo ${name}-server finalizado (código ${code})` });
      });
    });

    sendWsMessage(clientId, 'status', { data: 'Servidores iniciados.' });
    return res.json({ success: true });
  }

  // Parar
  if (acao === "parar") {
    if (runningServers[tipo]) {
      Object.values(runningServers[tipo]).forEach(proc => {
        if (proc && !proc.killed) proc.kill();
      });
      delete runningServers[tipo];
      sendWsMessage(clientId, 'status', { data: 'Servidores parados.' });
      return res.json({ success: true });
    } else {
      // fallback: pkill
      exec(`cd ${basePath} && pkill login-server && pkill char-server && pkill map-server`, () => {
        sendWsMessage(clientId, 'status', { data: 'Servidores parados.' });
        return res.json({ success: true });
      });
    }
    return;
  }

  // Reiniciar
  if (acao === "reiniciar") {
    // Parar
    if (runningServers[tipo]) {
      Object.values(runningServers[tipo]).forEach(proc => {
        if (proc && !proc.killed) proc.kill();
      });
      delete runningServers[tipo];
    } else {
      exec(`cd ${basePath} && pkill login-server && pkill char-server && pkill map-server`);
    }
    // Iniciar novamente
    const servers = [
      { name: "login", bin: "./login-server" },
      { name: "char", bin: "./char-server" },
      { name: "map", bin: "./map-server" }
    ];

    runningServers[tipo] = {};

    servers.forEach(({ name, bin }) => {
      const proc = spawn(bin, [], { cwd: basePath });

      runningServers[tipo][name] = proc;

      proc.stdout.on('data', (data) => {
        sendWsMessage(clientId, 'log', { server: name, data: data.toString() });
      });
      proc.stderr.on('data', (data) => {
        sendWsMessage(clientId, 'log', { server: name, data: data.toString() });
      });
      proc.on('close', (code) => {
        sendWsMessage(clientId, 'log', { server: name, data: `Processo ${name}-server finalizado (código ${code})` });
      });
    });

    sendWsMessage(clientId, 'status', { data: 'Servidores reiniciados.' });
    return res.json({ success: true });
  }

  // fallback para outras ações
  const comando = getPlatformCommands(tipo, acao);
  if (!comando) return res.status(400).json({ error: 'Ação inválida' });

  res.json({ success: true, message: `Processo ${acao} iniciado` });
  sendWsMessage(clientId, 'status', { data: `Executando ação: ${acao}` });

  const child = exec(comando);

  child.stdout.on('data', (data) => sendWsMessage(clientId, 'log', { data: data.toString() }));
  child.stderr.on('data', (data) => sendWsMessage(clientId, 'error', { data: data.toString() }));
  child.on('close', (code) => {
    if (code === 0) {
      const estado = acao === 'parar' ? 'parado' : 'iniciado';
      sendWsMessage(clientId, 'execucao', { estado });
      sendWsMessage(clientId, 'success', { data: `Ação ${acao} concluída com sucesso!` });
    } else {
      sendWsMessage(clientId, 'error', { data: `Ação ${acao} falhou com código ${code}` });
    }
    sendWsMessage(clientId, 'complete', { code });
  });
});

// Endpoint para detectar o sistema operacional
app.get('/api/os', (req, res) => {
  fs.readFile('/etc/os-release', 'utf8', (err, data) => {
    if (err) return res.json({ name: os.type() });
    const nameMatch = data.match(/^NAME="?([^"\n]*)"?/m);
    const name = nameMatch ? nameMatch[1] : os.type();
    res.json({ name });
  });
});

// Checagem universal de painéis
const panelChecks = [
  { name: "webmin",     type: "systemd", service: "webmin" },
  { name: "hestiacp",   type: "systemd", service: "hestia" },
  { name: "froxlor",    type: "systemd", service: "froxlor" },
  { name: "cpanel",     type: "systemd", service: "cpanel" },
  { name: "cyberpanel", type: "systemd", service: "lscpd" },
  { name: "ispconfig",  type: "systemd", service: "apache2" },
  { name: "aapanel",    type: "port",    port: 13349 }
];

// Endpoint para listar painéis realmente instalados (universal)
app.get('/api/panels/installed', (req, res) => {
  let installed = [];
  let checked = 0;

  if (panelChecks.length === 0) return res.json({ installed: [] });

  panelChecks.forEach(check => {
    let cmd = "";
    if (check.type === "systemd") {
      cmd = `systemctl is-active ${check.service}`;
    } else if (check.type === "port") {
      cmd = `ss -ltnp | grep ${check.port}`;
    } else {
      checked++;
      if (checked === panelChecks.length) res.json({ installed });
      return;
    }

    exec(cmd, (err, stdout) => {
      let isInstalled = false;
      if (check.type === "systemd" && stdout && stdout.trim() === "active") {
        isInstalled = true;
      }
      if (check.type === "port" && stdout && stdout.trim() !== "") {
        isInstalled = true;
      }
      if (isInstalled) installed.push(check.name);

      checked++;
      if (checked === panelChecks.length) {
        res.json({ installed });
      }
    });
  });
});

// Endpoint para listar emuladores instalados
app.get('/api/emulators/installed', (req, res) => {
  fs.readdir(EMULADOR_DIR, { withFileTypes: true }, (err, files) => {
    if (err) return res.json({ installed: [] });
    const installed = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name.toLowerCase());
    res.json({ installed });
  });
});

// Endpoint para instalar painel
app.post('/install/panel', (req, res) => {
  const { panel } = req.body;
  if (!panel) return res.status(400).send("Painel não especificado.");

  // Detecta SO
  let soName = '';
  try {
    const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
    const nameMatch = osRelease.match(/^NAME="?([^"\n]*)"?/m);
    soName = nameMatch ? nameMatch[1] : '';
  } catch {
    soName = os.type();
  }

  let installCmd = '';
  if (panel === "webmin" && soName.toLowerCase().includes("ubuntu")) {
    installCmd = "apt update && apt install -y wget && wget -qO- http://www.webmin.com/jcameron-key.asc | gpg --dearmor > /usr/share/keyrings/webmin.gpg && echo 'deb [signed-by=/usr/share/keyrings/webmin.gpg] http://download.webmin.com/download/repository sarge contrib' > /etc/apt/sources.list.d/webmin.list && apt update && apt install -y webmin";
  } else if (panel === "cpanel" && (soName.toLowerCase().includes("centos") || soName.toLowerCase().includes("alma") || soName.toLowerCase().includes("cloudlinux"))) {
    installCmd = "cd /home && curl -o latest -L https://securedownloads.cpanel.net/latest && sh latest";
  } else if (panel === "hestiacp" && (soName.toLowerCase().includes("ubuntu") || soName.toLowerCase().includes("debian"))) {
    installCmd = "wget https://raw.githubusercontent.com/hestiacp/hestiacp/release/install/hst-install.sh -O hst-install.sh && bash hst-install.sh --force --with-debs";
  } else if (panel === "cyberpanel" && (soName.toLowerCase().includes("ubuntu") || soName.toLowerCase().includes("centos") || soName.toLowerCase().includes("alma"))) {
    installCmd = "sh <(curl https://cyberpanel.net/install.sh || true)";
  } else if (panel === "ispconfig" && (soName.toLowerCase().includes("ubuntu") || soName.toLowerCase().includes("debian"))) {
    installCmd = "wget -O - https://get.ispconfig.org | sh -s -- --use-nginx --unattended-upgrades";
  } else if (panel === "aapanel" && (soName.toLowerCase().includes("ubuntu") || soName.toLowerCase().includes("debian") || soName.toLowerCase().includes("centos"))) {
    installCmd = "wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && yes | bash install.sh && ufw allow 13349/tcp && ufw allow 888/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 20/tcp && ufw allow 21/tcp";
  } else if (panel === "froxlor" && (soName.toLowerCase().includes("ubuntu") || soName.toLowerCase().includes("debian"))) {
    installCmd = "apt update && apt install -y froxlor";
  } else {
    return res.status(400).send("Painel não suportado para este sistema operacional.");
  }

  exec(installCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(stderr || "Erro ao instalar o painel.");
    res.send(stdout || "Painel instalado com sucesso!");
  });
});

// Endpoint para desinstalar painel
app.post('/uninstall/panel', (req, res) => {
  const { panel } = req.body;
  if (!panel) return res.status(400).send("Painel não especificado.");

  // Detecta SO
  let soName = '';
  try {
    const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
    const nameMatch = osRelease.match(/^NAME="?([^"\n]*)"?/m);
    soName = nameMatch ? nameMatch[1] : '';
  } catch {
    soName = os.type();
  }

  let uninstallCmd = '';
  if (panel === "webmin" && soName.toLowerCase().includes("ubuntu")) {
    uninstallCmd = "apt-get remove --purge -y webmin && apt-get autoremove -y";
  } else if (panel === "cpanel") {
    uninstallCmd = "echo 'cPanel não possui script oficial de desinstalação. Reinstale o sistema operacional para remover completamente.'";
  } else if (panel === "hestiacp") {
    uninstallCmd = "bash /usr/local/hestia/install/hst-uninstall.sh --force";
  } else if (panel === "cyberpanel") {
    uninstallCmd = "echo 'CyberPanel não possui script oficial de desinstalação. Remova manualmente.'";
  } else if (panel === "ispconfig") {
    uninstallCmd = "echo 'ISPConfig não possui script oficial de desinstalação. Remova manualmente.'";
  } else if (panel === "aapanel") {
    uninstallCmd = "curl -sSO http://www.aapanel.com/script/uninstall_en.sh && bash uninstall_en.sh";
  } else if (panel === "froxlor" && (soName.toLowerCase().includes("ubuntu") || soName.toLowerCase().includes("debian"))) {
    uninstallCmd = "apt-get remove --purge -y froxlor && apt-get autoremove -y";
  } else {
    return res.status(400).send("Painel não suportado para desinstalação.");
  }

  exec(uninstallCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(stderr || "Erro ao desinstalar o painel.");
    res.send(stdout || "Painel desinstalado com sucesso!");
  });
});

// Inicializa o servidor
server.listen(3001, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:3001 (${platform})`);
  console.log('WebSocket disponível em ws://localhost:3001');
});