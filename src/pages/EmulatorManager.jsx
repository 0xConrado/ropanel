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

  // Função para executar uma ação POST na API
  const postAction = async (action, server) => {
    let url = `${API_BASE_URL}/api/emulator/${action}`;
    if (server) url += `/${server}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro na ação ${action} ${server || ''}: ${text}`);
    }
    return res.json();
  };

  // Iniciar servidores na ordem correta: login -> map -> char
  const handleStartAll = async () => {
    setLoading(true);
    try {
      let response;

      response = await postAction('start', 'login');
      alert(response.message || 'Login server iniciado');
      await fetchStatus();
      await fetchLogs('login');

      response = await postAction('start', 'map');
      alert(response.message || 'Map server iniciado');
      await fetchStatus();
      await fetchLogs('map');

      response = await postAction('start', 'char');
      alert(response.message || 'Char server iniciado');
      await fetchStatus();
      await fetchLogs('char');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Parar todos os servidores
  const handleStopAll = async () => {
    setLoading(true);
    try {
      const response = await postAction('stopAll');
      alert(response.message || 'Todos os servidores parados');
      await fetchStatus();
      ['login', 'char', 'map'].forEach(fetchLogs);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Funções para compilar e recompilar
  const handleCompile = async () => {
    setLoading(true);
    try {
      const response = await postAction('compile');
      alert(response.message || 'Compilação iniciada');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecompile = async () => {
    setLoading(true);
    try {
      const response = await postAction('recompile');
      alert(response.message || 'Recompilação iniciada');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
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

      <div style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button disabled={loading} onClick={handleStartAll} style={{ padding: '10px 20px' }}>
          Iniciar Todos (Login → Map → Char)
        </button>
        <button disabled={loading} onClick={handleStopAll} style={{ padding: '10px 20px' }}>
          Parar Todos
        </button>
        <button disabled={loading} onClick={handleCompile} style={{ padding: '10px 20px' }}>
          Compilar
        </button>
        <button disabled={loading} onClick={handleRecompile} style={{ padding: '10px 20px' }}>
          Recompilar
        </button>
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