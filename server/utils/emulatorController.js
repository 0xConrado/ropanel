const { spawn } = require('child_process');
const path = require('path');

class EmulatorController {
  constructor() {
    this.processes = {
      login: null,
      char: null,
      map: null,
    };
    this.logs = {
      login: '',
      char: '',
      map: '',
    };
    this.basePath = path.resolve('/root/Emulador/rathena'); // Ajuste conforme seu caminho
  }

  startProcess(name, command, args = [], options = {}) {
    if (this.processes[name]) {
      return false; // Já está rodando
    }
    const proc = spawn(command, args, { cwd: this.basePath, ...options });

    proc.stdout.on('data', (data) => {
      this.logs[name] += data.toString();
      // Aqui pode emitir evento para WebSocket
    });

    proc.stderr.on('data', (data) => {
      this.logs[name] += data.toString();
    });

    proc.on('close', (code) => {
      this.logs[name] += `\nProcesso ${name} finalizado com código ${code}\n`;
      this.processes[name] = null;
    });

    this.processes[name] = proc;
    return true;
  }

  stopProcess(name) {
    if (!this.processes[name]) return false;
    this.processes[name].kill('SIGINT');
    this.processes[name] = null;
    return true;
  }

  getStatus(name) {
    return this.processes[name] ? 'online' : 'offline';
  }

  getLogs(name) {
    return this.logs[name] || '';
  }

  startLoginServer() {
    return this.startProcess('login', './login-server');
  }

  startCharServer() {
    return this.startProcess('char', './char-server');
  }

  startMapServer() {
    return this.startProcess('map', './map-server');
  }

  stopAll() {
    this.stopProcess('login');
    this.stopProcess('char');
    this.stopProcess('map');
  }

  compile() {
    return new Promise((resolve, reject) => {
      const proc = spawn('make', [], { cwd: this.basePath });
      proc.on('close', (code) => {
        if (code === 0) resolve('Compilado com sucesso');
        else reject('Erro na compilação');
      });
    });
  }

  recompile() {
    return this.compile();
  }
}

module.exports = new EmulatorController();