import { useState, useEffect, useRef } from "react";
import { Download, Power, RotateCw, Wrench, Trash2, CheckCircle, XCircle } from "lucide-react";
import EmuladorStatus from "./EmuladorStatus";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const EMULADORES = [
  { value: "hercules", label: "Hercules" },
  { value: "rathena", label: "rAthena" },
  { value: "custom", label: "Customizado" }
];

export default function Emulador() {
  const [selected, setSelected] = useState("hercules");
  const [repoCustom, setRepoCustom] = useState("");
  const [status, setStatus] = useState({
    instalado: false,
    compilado: false,
    rodando: false,
    emProgresso: false,
    logs: [],
  });
  const [emuladoresInstalados, setEmuladoresInstalados] = useState([]);
  const [showServers, setShowServers] = useState(false);
  const [logs, setLogs] = useState({
    system: [],
    login: [],
    char: [],
    map: [],
  });
  const [clientId] = useState(() => Math.random().toString(36).substring(2, 15));
  const ws = useRef(null);
  const logsEndRef = useRef(null);

  // Configura WebSocket para receber logs em tempo real
  useEffect(() => {
    ws.current = new window.WebSocket(API_URL.replace(/^http/, "ws"));
    ws.current.onopen = () => {
      // Registra o cliente no backend para receber logs específicos
      ws.current.send(JSON.stringify({ type: "register", clientId }));
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Atualiza logs do sistema
      if (["log", "status", "error", "success"].includes(data.type) && !data.server) {
        setStatus((prev) => ({
          ...prev,
          logs: [...prev.logs, data.data]
        }));
        setLogs((prev) => ({
          ...prev,
          system: [...prev.system, data.data]
        }));
      }

      // Atualiza logs dos servidores individuais
      if (data.type === "log" && data.server) {
        setLogs((prev) => ({
          ...prev,
          [data.server]: [...(prev[data.server] || []), data.data]
        }));
      }

      // Quando a instalação for concluída, atualiza estado e chama endpoint para configurar arquivos
      if (data.type === "complete" && data.operacao === "instalar") {
        fetchEmuladores();
        setStatus((prev) => ({
          ...prev,
          emProgresso: false,
        }));

        // Caminho da pasta conf do emulador instalado
        const confDir = `/root/Emulador/${selected}/conf`;

        // Chama API para descomentar linhas específicas nos arquivos de configuração
        fetch(`${API_URL}/api/emulador/configurar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confDir }),
        })
          .then(res => res.json())
          .then(res => {
            if (!res.ok) {
              alert("Erro ao configurar arquivos: " + res.error);
            } else {
              alert("Arquivos de configuração atualizados com sucesso!");
            }
          })
          .catch(err => {
            alert("Erro na requisição de configuração: " + err.message);
          });
      }
    };
    ws.current.onclose = () => {};
    ws.current.onerror = () => {};
    return () => ws.current && ws.current.close();
    // eslint-disable-next-line
  }, [clientId]);

  // Busca lista de emuladores instalados no backend
  useEffect(() => {
    fetchEmuladores();
  }, []);

  // Faz scroll automático para o fim dos logs do sistema
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [status.logs]);

  // Função para buscar emuladores instalados
  function fetchEmuladores() {
    fetch(`${API_URL}/api/emulators/installed`)
      .then((res) => res.json())
      .then((data) => {
        setEmuladoresInstalados(data.installed || []);
        setStatus((prev) => ({
          ...prev,
          instalado: data.installed?.includes(selected),
        }));
      });
  }

  // Atualiza estado quando emulador selecionado ou lista de instalados muda
  useEffect(() => {
    setStatus((prev) => ({
      ...prev,
      instalado: emuladoresInstalados.includes(selected),
      logs: [],
      compilado: false,
      rodando: false,
      emProgresso: false,
    }));
    setLogs({
      system: [],
      login: [],
      char: [],
      map: [],
    });
    setShowServers(false);
    // eslint-disable-next-line
  }, [selected, emuladoresInstalados]);

  // Função para iniciar instalação
  const instalar = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: ["Iniciando instalação..."],
    }));
    await fetch(`${API_URL}/api/instalar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: selected,
        repo: selected === "custom" ? repoCustom : undefined,
        clientId,
      }),
    });
  };

  // Função para iniciar compilação
  const compilar = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, "Iniciando compilação..."],
    }));
    await fetch(`${API_URL}/api/compilar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: selected,
        clientId,
      }),
    });
  };

  // Função para gerenciar emulador (iniciar, parar, reiniciar)
  const gerenciar = async (acao) => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, `Executando ${acao}...`],
    }));
    await fetch(`${API_URL}/api/gerenciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao,
        tipo: selected,
        clientId,
      }),
    });
    if (acao === "iniciar") {
      setShowServers(true);
    }
  };

  // Função para desinstalar emulador
  const desinstalar = async () => {
    setStatus((prev) => ({
      ...prev,
      emProgresso: true,
      logs: [...prev.logs, "Desinstalando emulador..."],
    }));
    await fetch(`${API_URL}/api/gerenciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao: "desinstalar",
        tipo: selected,
        clientId,
      }),
    });
    setTimeout(fetchEmuladores, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4">
      <div className="w-full max-w-7xl">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Wrench size={28} /> Gerenciar Emulador
        </h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Selecione o Emulador</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-lg"
            disabled={status.emProgresso}
          >
            {EMULADORES.map((emu) => (
              <option key={emu.value} value={emu.value}>
                {emu.label}
              </option>
            ))}
          </select>
        </div>
        {selected === "custom" && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Repositório Git</label>
            <input
              type="text"
              placeholder="https://github.com/usuario/repositorio.git"
              value={repoCustom}
              onChange={(e) => setRepoCustom(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2"
              disabled={status.emProgresso}
            />
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            {status.instalado ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <XCircle className="text-red-400" size={20} />
            )}
            <span className={status.instalado ? "text-green-400" : "text-red-400"}>
              {status.instalado ? "Instalado" : "Não instalado"}
            </span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-3 mb-6">
          {!status.instalado && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700"
              onClick={instalar}
              disabled={status.emProgresso}
            >
              <Download size={18} /> Instalar
            </button>
          )}
          {status.instalado && (
            <>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                onClick={compilar}
                disabled={status.emProgresso}
              >
                <Wrench size={18} /> Compilar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700"
                onClick={() => gerenciar("iniciar")}
                disabled={status.emProgresso}
              >
                <Power size={18} /> Iniciar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700"
                onClick={() => gerenciar("reiniciar")}
                disabled={status.emProgresso}
              >
                <RotateCw size={18} /> Reiniciar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                onClick={() => gerenciar("parar")}
                disabled={status.emProgresso}
              >
                <Power size={18} /> Parar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                onClick={desinstalar}
                disabled={status.emProgresso}
              >
                <Trash2 size={18} /> Desinstalar
              </button>
            </>
          )}
        </div>

        {/* Logs do Sistema */}
        {!showServers && (
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              Logs do Sistema
            </h3>
            <div className="bg-black text-green-400 font-mono text-sm p-3 rounded h-64 overflow-y-auto">
              {logs.system.length > 0 ? (
                <>
                  {logs.system.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              ) : (
                <p className="text-gray-500">Nenhuma atividade registrada...</p>
              )}
            </div>
          </div>
        )}

        {/* Logs dos servidores */}
        {showServers && <EmuladorStatus logs={logs} />}
      </div>
    </div>
  );
}