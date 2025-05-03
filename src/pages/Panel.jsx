import { useState, useEffect, useRef } from "react";
import { Server, Download, Wrench, Trash2, RotateCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const panels = [
  { name: "Webmin", value: "webmin", supported: ["Ubuntu", "Debian"] },
  { name: "cPanel", value: "cpanel", supported: ["CentOS", "CloudLinux", "AlmaLinux"] },
  { name: "HestiaCP", value: "hestiacp", supported: ["Ubuntu", "Debian"] },
  { name: "CyberPanel", value: "cyberpanel", supported: ["Ubuntu", "CentOS", "AlmaLinux"] },
  { name: "ISPConfig", value: "ispconfig", supported: ["Ubuntu", "Debian"] },
  { name: "aaPanel", value: "aapanel", supported: ["Ubuntu", "Debian", "CentOS"] },
  { name: "Froxlor", value: "froxlor", supported: ["Ubuntu", "Debian"] },
];

export default function Panel() {
  const [osName, setOsName] = useState("");
  const [selectedPanel, setSelectedPanel] = useState("");
  const [status, setStatus] = useState("");
  const [installing, setInstalling] = useState(false);
  const [installedPanels, setInstalledPanels] = useState([]);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/os`)
      .then(res => res.json())
      .then(data => setOsName(data.name));
    fetch(`${API_URL}/api/panels/installed`)
      .then(res => res.json())
      .then(data => setInstalledPanels(data.installed || []));
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Só mostra opções suportadas pelo SO
  const supportedPanels = panels.filter(panel =>
    panel.supported.some(s =>
      osName.trim().toLowerCase().includes(s.toLowerCase())
    )
  );

  const isPanelInstalled = selectedPanel && installedPanels.includes(selectedPanel);

  // Instalar painel
  const handleInstall = async () => {
    if (!selectedPanel) {
      setStatus("Selecione um painel para instalar.");
      return;
    }
    setStatus("");
    setInstalling(true);
    setLogs(["Iniciando instalação..."]);
    try {
      const res = await fetch(`${API_URL}/install/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: selectedPanel }),
      });
      const data = await res.text();
      setStatus(data);
      setLogs(prev => [...prev, "✅ Painel instalado!"]);
      // Atualiza lista de instalados
      fetch(`${API_URL}/api/panels/installed`)
        .then(res => res.json())
        .then(data => setInstalledPanels(data.installed || []));
    } catch (err) {
      setStatus("Erro ao instalar o painel.");
      setLogs(prev => [...prev, "❌ Erro ao instalar o painel."]);
    } finally {
      setInstalling(false);
    }
  };

  // Reinstalar painel
  const handleReinstall = async () => {
    if (!selectedPanel) return;
    setStatus("");
    setInstalling(true);
    setLogs(["Reinstalando painel..."]);
    try {
      const res = await fetch(`${API_URL}/install/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: selectedPanel }),
      });
      const data = await res.text();
      setStatus(data);
      setLogs(prev => [...prev, "✅ Painel reinstalado!"]);
    } catch (err) {
      setStatus("Erro ao reinstalar o painel.");
      setLogs(prev => [...prev, "❌ Erro ao reinstalar o painel."]);
    } finally {
      setInstalling(false);
    }
  };

  // Desinstalar painel
  const handleUninstall = async () => {
    if (!selectedPanel) return;
    setStatus("");
    setInstalling(true);
    setLogs(["Desinstalando painel..."]);
    try {
      const res = await fetch(`${API_URL}/uninstall/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: selectedPanel }),
      });
      const data = await res.text();
      setStatus(data);
      setLogs(prev => [...prev, "✅ Painel desinstalado!"]);
      // Atualiza lista de instalados
      fetch(`${API_URL}/api/panels/installed`)
        .then(res => res.json())
        .then(data => setInstalledPanels(data.installed || []));
    } catch (err) {
      setStatus("Erro ao desinstalar o painel.");
      setLogs(prev => [...prev, "❌ Erro ao desinstalar o painel."]);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Server size={24} /> Gerenciar Painel de Controle
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status e seleção */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo de Painel</label>
            <select
              value={selectedPanel}
              onChange={e => setSelectedPanel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-lg"
              disabled={installing}
            >
              <option value="">Selecione o painel</option>
              {supportedPanels.map(panel => (
                <option key={panel.value} value={panel.value}>
                  {panel.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Status</p>
            {selectedPanel ? (
              isPanelInstalled ? (
                <span className="text-green-400 font-semibold">Instalado</span>
              ) : (
                <span className="text-red-400 font-semibold">Não instalado</span>
              )
            ) : (
              <span className="text-gray-400">Selecione um painel</span>
            )}
          </div>
          {osName && (
            <div className="text-sm text-gray-500">
              Sistema operacional detectado: <b>{osName}</b>
            </div>
          )}
        </div>
        {/* Controles */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2">Controle</h3>
          <div className="grid grid-cols-1 gap-3">
            {/* Instalar */}
            {!isPanelInstalled && (
              <button
                onClick={handleInstall}
                disabled={installing || !selectedPanel}
                className={`flex items-center gap-2 p-3 rounded justify-center font-bold text-lg ${
                  !installing && selectedPanel
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                <Download size={18} /> {installing ? "Instalando..." : "Instalar"}
              </button>
            )}
            {/* Reinstalar e Desinstalar */}
            {isPanelInstalled && (
              <>
                <button
                  onClick={handleReinstall}
                  disabled={installing}
                  className={`flex items-center gap-2 p-3 rounded justify-center font-bold text-lg ${
                    !installing
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  <RotateCw size={18} /> {installing ? "Reinstalando..." : "Reinstalar"}
                </button>
                <button
                  onClick={handleUninstall}
                  disabled={installing}
                  className={`flex items-center gap-2 p-3 rounded justify-center font-bold text-lg ${
                    !installing
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Trash2 size={18} /> {installing ? "Desinstalando..." : "Desinstalar"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Logs */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Wrench size={20} /> Logs do Sistema
        </h3>
        <div className="bg-black text-green-400 font-mono text-sm p-3 rounded h-64 overflow-y-auto">
          {logs.length > 0 ? (
            <>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              <div ref={logsEndRef} />
            </>
          ) : (
            <p className="text-gray-500">Nenhuma atividade registrada...</p>
          )}
        </div>
      </div>
      {status && !installing && (
        <div className="mt-4 font-semibold text-green-700 text-center">{status}</div>
      )}
    </div>
  );
}