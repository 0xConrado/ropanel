import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Server, Download, Terminal, Power, RotateCw, Wrench, XCircle, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Emulador({ emuladores, setEmuladores }) {
  const { nome } = useParams();
  const [status, setStatus] = useState({
    compilado: false,
    emProgresso: false,
    logs: [],
    executando: false,
    instalado: false,
  });
  const [config, setConfig] = useState({
    porta: 6900,
    repoCustom: "",
    versao: "hercules",
  });
  const [wsReady, setWsReady] = useState(false);
  const ws = useRef(null);
  const clientId = useRef(Math.random().toString(36).substring(2, 15));
  const logsEndRef = useRef(null);

  // WebSocket para logs em tempo real
  useEffect(() => {
    ws.current = new window.WebSocket(API_URL.replace(/^http/, "ws"));
    ws.current.onopen = () => {
      setWsReady(true);
      ws.current.send(
        JSON.stringify({
          type: "register",
          clientId: clientId.current,
        })
      );
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log") {
        setStatus((prev) => ({
          ...prev,
          logs: [...prev.logs, ...data.data.split("\n").filter((line) => line.trim())],
        }));
      }
      if (data.type === "complete") {
        if (data.operacao === "instalar" && data.code === 0) {
          if (!emuladores.includes(config.versao)) {
            setEmuladores((prev) => [...prev, config.versao]);
          }
          setStatus((prev) => ({
            ...prev,
            logs: [...prev.logs, "✅ Emulador instalado!"],
            emProgresso: false,
            instalado: true,
          }));
        }
        if (data.operacao === "compilar") {
          setStatus((prev) => ({
            ...prev,
            logs: [...prev.logs, data.code === 0 ? "✅ Compilação concluída!" : "❌ Erro na compilação."],
            emProgresso: false,
            compilado: data.code === 0,
          }));
        }
        if (data.operacao === "iniciar") {
          setStatus((prev) => ({
            ...prev,
            logs: [...prev.logs, data.code === 0 ? "✅ Emulador iniciado!" : "❌ Erro ao iniciar."],
            emProgresso: false,
            executando: data.code === 0,
          }));
        }
        if (data.operacao === "parar") {
          setStatus((prev) => ({
            ...prev,
            logs: [...prev.logs, data.code === 0 ? "✅ Emulador parado!" : "❌ Erro ao parar."],
            emProgresso: false,
            executando: false,
          }));
        }
        if (data.operacao === "reiniciar") {
          setStatus((prev) => ({
            ...prev,
            logs: [...prev.logs, data.code === 0 ? "✅ Emulador reiniciado!" : "❌ Erro ao reiniciar."],
            emProgresso: false,
            executando: data.code === 0,
          }));
        }
      }
    };
    ws.current.onclose = () => setWsReady(false);
    ws.current.onerror = () => setWsReady(false);
    return () => ws.current && ws.current.close();
    // eslint-disable-next-line
  }, [config.versao, emuladores, setEmuladores]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [status.logs]);

  // Funções de controle
  const instalarEmulador = async () => {
    setStatus({
      compilado: false,
      emProgresso: true,
      executando: false,
      logs: ["Iniciando instalação..."],
      instalado: false,
    });
    await fetch(`${API_URL}/api/instalar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: config.versao,
        repo: config.versao === "custom" ? config.repoCustom : null,
        clientId: clientId.current,
      }),
    });
  };

  const compilarEmulador = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, "Iniciando compilação..."],
    }));
    await fetch(`${API_URL}/api/compilar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: nome,
        clientId: clientId.current,
      }),
    });
  };

  const iniciarEmulador = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, "Iniciando emulador..."],
    }));
    await fetch(`${API_URL}/api/iniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: nome,
        clientId: clientId.current,
      }),
    });
  };

  const pararEmulador = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, "Parando emulador..."],
    }));
    await fetch(`${API_URL}/api/parar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: nome,
        clientId: clientId.current,
      }),
    });
  };

  const reiniciarEmulador = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, "Reiniciando emulador..."],
    }));
    await fetch(`${API_URL}/api/reiniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: nome,
        clientId: clientId.current,
      }),
    });
  };

  // Página de detalhes do emulador instalado
  if (nome) {
    if (!emuladores.includes(nome)) {
      return <div className="text-red-400">Emulador não encontrado!</div>;
    }
    return (
      <div className="p-4 text-white space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 capitalize mb-4">
          <Server size={24} /> {nome}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Status */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={18} /> Status
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">Instalação</p>
                <p className="text-green-400">Instalado</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Compilação</p>
                <p className={status.compilado ? "text-green-400" : "text-red-400"}>
                  {status.compilado ? "Compilado" : "Não compilado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Estado</p>
                <p className={status.executando ? "text-green-400" : "text-red-400"}>
                  {status.executando ? "Em execução" : "Parado"}
                </p>
              </div>
            </div>
          </div>
          {/* Controles */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Wrench className="text-blue-400" size={18} /> Controle
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center gap-2 p-3 rounded justify-center bg-blue-600 hover:bg-blue-700"
                onClick={compilarEmulador}
                disabled={status.emProgresso}
              >
                <Wrench size={16} /> Compilar
              </button>
              <button
                className="flex items-center gap-2 p-3 rounded justify-center bg-green-600 hover:bg-green-700"
                onClick={iniciarEmulador}
                disabled={status.emProgresso}
              >
                <Power size={16} /> Iniciar
              </button>
              <button
                className="flex items-center gap-2 p-3 rounded justify-center bg-yellow-600 hover:bg-yellow-700"
                onClick={reiniciarEmulador}
                disabled={status.emProgresso}
              >
                <RotateCw size={16} /> Reiniciar
              </button>
              <button
                className="flex items-center gap-2 p-3 rounded justify-center bg-red-600 hover:bg-red-700"
                onClick={pararEmulador}
                disabled={status.emProgresso}
              >
                <Power size={16} /> Parar
              </button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Terminal size={20} /> Logs do Sistema
          </h3>
          <div className="bg-black text-green-400 font-mono text-sm p-3 rounded h-64 overflow-y-auto">
            {status.logs.length > 0 ? (
              <>
                {status.logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
                <div ref={logsEndRef} />
              </>
            ) : (
              <p className="text-gray-500">Nenhuma atividade registrada...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Página de instalação
  return (
    <div className="p-4 text-white space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <Server size={24} /> Instalar Emulador
      </h2>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo de Emulador</label>
          <select
            value={config.versao}
            onChange={(e) => setConfig({ ...config, versao: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2"
            disabled={status.emProgresso}
          >
            <option value="hercules">Hercules</option>
            <option value="rathena">rAthena</option>
            <option value="custom">Customizado</option>
          </select>
        </div>
        {config.versao === "custom" && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Repositório Git
            </label>
            <input
              type="text"
              placeholder="https://github.com/usuario/repositorio.git"
              value={config.repoCustom}
              onChange={(e) => setConfig({ ...config, repoCustom: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2"
              disabled={status.emProgresso}
            />
          </div>
        )}
        <button
          onClick={instalarEmulador}
          disabled={status.emProgresso || !wsReady}
          className={`flex items-center gap-2 p-3 rounded justify-center ${
            !status.emProgresso && wsReady
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          <Download size={18} /> Instalar
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Terminal size={20} /> Logs do Sistema
        </h3>
        <div className="bg-black text-green-400 font-mono text-sm p-3 rounded h-64 overflow-y-auto">
          {status.logs.length > 0 ? (
            <>
              {status.logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              <div ref={logsEndRef} />
            </>
          ) : (
            <p className="text-gray-500">Nenhuma atividade registrada...</p>
          )}
        </div>
      </div>
    </div>
  );
}