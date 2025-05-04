import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react'; // Ícones para status

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
  }, []);

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

  // Função para renderizar o status com ícone e cor
  const renderStatus = (server) => {
    const isOnline = status[server] === 'online';
    return (
      <div className="flex items-center gap-2">
        {isOnline ? (
          <CheckCircle className="text-green-500" size={20} />
        ) : (
          <XCircle className="text-red-500" size={20} />
        )}
        <span className={`font-semibold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {status[server]}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gerenciador {emulatorName}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="grid grid-cols-3 gap-6">
          {['login', 'char', 'map'].map(server => (
            <div key={server} className="bg-gray-800 p-4 rounded shadow flex flex-col items-center">
              <h3 className="mb-2 text-lg capitalize">{server} Server</h3>
              {renderStatus(server)}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 flex flex-wrap gap-4">
        <button
          disabled={loading}
          onClick={handleStartAll}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-6 rounded shadow transition"
        >
          Iniciar Todos (Login → Map → Char)
        </button>
        <button
          disabled={loading}
          onClick={handleStopAll}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-6 rounded shadow transition"
        >
          Parar Todos
        </button>
        <button
          disabled={loading}
          onClick={handleCompile}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded shadow transition"
        >
          Compilar
        </button>
        <button
          disabled={loading}
          onClick={handleRecompile}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-semibold py-2 px-6 rounded shadow transition"
        >
          Recompilar
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Terminais</h2>
        {['login', 'char', 'map'].map(server => (
          <div key={server} className="mb-6">
            <h3 className="mb-2 text-lg capitalize">{server} Server</h3>
            <pre className="bg-black text-green-400 p-4 rounded h-40 overflow-y-auto font-mono whitespace-pre-wrap">
              {logs[server]}
            </pre>
          </div>
        ))}
      </section>
    </div>
  );
}

export default EmulatorManager;