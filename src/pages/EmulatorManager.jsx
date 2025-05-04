import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://168.231.99.143:3001';

function EmulatorManager({ emulatorName }) {
  const [status, setStatus] = useState({ login: 'offline', char: 'offline', map: 'offline' });
  const [logs, setLogs] = useState({ login: '', char: '', map: '' });
  const [loading, setLoading] = useState(false);

  const fetchStatus = () => {
    fetch(`${API_BASE_URL}/api/emulator/status`)
      .then(res => res.json())
      .then(setStatus)
      .catch(console.error);
  };

  const fetchLogs = (server) => {
    fetch(`${API_BASE_URL}/api/emulator/logs/${server}`)
      .then(res => res.json())
      .then(data => {
        setLogs(prev => ({ ...prev, [server]: data.logs }));
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchStatus();
    ['login', 'char', 'map'].forEach(fetchLogs);
    // Para logs em tempo real, implementar WebSocket ou polling
  }, []);

  const handleAction = (action, server) => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/emulator/${action}`;
    if (server) url += `/${server}`;
    fetch(url, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        alert(data.message || data.error);
        fetchStatus();
        if (server) fetchLogs(server);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Gerenciador {emulatorName}</h1>

      <div>
        <h2>Status</h2>
        {['login', 'char', 'map'].map(server => (
          <p key={server}>
            {server.charAt(0).toUpperCase() + server.slice(1)} Server: <b>{status[server]}</b>
          </p>
        ))}
      </div>

      <div style={{ margin: '20px 0' }}>
        <button disabled={loading} onClick={() => handleAction('start', 'login')}>Iniciar Login</button>
        <button disabled={loading} onClick={() => handleAction('stop', 'login')}>Desligar Login</button>
        <button disabled={loading} onClick={() => handleAction('start', 'char')}>Iniciar Char</button>
        <button disabled={loading} onClick={() => handleAction('stop', 'char')}>Desligar Char</button>
        <button disabled={loading} onClick={() => handleAction('start', 'map')}>Iniciar Map</button>
        <button disabled={loading} onClick={() => handleAction('stop', 'map')}>Desligar Map</button>
        <button disabled={loading} onClick={() => handleAction('stopAll')}>Parar Todos</button>
        <button disabled={loading} onClick={() => handleAction('compile')}>Compilar</button>
        <button disabled={loading} onClick={() => handleAction('recompile')}>Recompilar</button>
      </div>

      <div>
        <h2>Terminais</h2>
        {['login', 'char', 'map'].map(server => (
          <div key={server} style={{ marginBottom: 20 }}>
            <h3>{server.charAt(0).toUpperCase() + server.slice(1)} Server</h3>
            <pre style={{ backgroundColor: '#222', color: '#0f0', height: 150, overflowY: 'scroll', padding: 10 }}>
              {logs[server]}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmulatorManager;