import React, { useState, useEffect } from "react";

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
  const [selectedPanel, setSelectedPanel] = useState("");
  const [status, setStatus] = useState("");
  const [osName, setOsName] = useState("");
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [installedPanel, setInstalledPanel] = useState(""); // Simula painel instalado

  useEffect(() => {
    fetch(`${API_URL}/api/os`)
      .then(res => res.json())
      .then(data => setOsName(data.name));
    // Aqui você pode buscar do backend qual painel está instalado, se quiser persistência real
  }, []);

  // Simula barra de progresso durante a instalação
  useEffect(() => {
    let timer;
    if (installing) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev < 95) return prev + 5;
          return prev;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [installing]);

  // Instalar painel
  const handleInstall = async () => {
    if (!selectedPanel) {
      setStatus("Selecione um painel para instalar.");
      return;
    }
    setStatus("");
    setInstalling(true);
    setProgress(0);
    try {
      const res = await fetch(`${API_URL}/install/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: selectedPanel }),
      });
      const data = await res.text();
      setStatus(data);
      setInstalledPanel(selectedPanel); // Marca como instalado
    } catch (err) {
      setStatus("Erro ao instalar o painel.");
    } finally {
      setInstalling(false);
      setProgress(100);
    }
  };

  // Reinstalar painel
  const handleReinstall = async () => {
    if (!installedPanel) return;
    setStatus("");
    setInstalling(true);
    setProgress(0);
    try {
      const res = await fetch(`${API_URL}/install/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: installedPanel }),
      });
      const data = await res.text();
      setStatus(data);
    } catch (err) {
      setStatus("Erro ao reinstalar o painel.");
    } finally {
      setInstalling(false);
      setProgress(100);
    }
  };

  // Desinstalar painel
  const handleUninstall = async () => {
    if (!installedPanel) return;
    setStatus("");
    setInstalling(true);
    setProgress(0);
    try {
      const res = await fetch(`${API_URL}/uninstall/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: installedPanel }),
      });
      const data = await res.text();
      setStatus(data);
      setInstalledPanel(""); // Marca como desinstalado
      setSelectedPanel(""); // Limpa seleção
    } catch (err) {
      setStatus("Erro ao desinstalar o painel.");
    } finally {
      setInstalling(false);
      setProgress(100);
    }
  };

  // Só mostra opções suportadas pelo SO
  const supportedPanels = panels.filter(panel =>
    panel.supported.some(s =>
      osName.trim().toLowerCase().includes(s.toLowerCase())
    )
  );

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gerenciar Painel de Controle</h2>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Escolha o painel:</label>
        <select
          className="p-2 border rounded w-full"
          value={selectedPanel}
          onChange={e => setSelectedPanel(e.target.value)}
          disabled={installing || !!installedPanel}
        >
          <option value="">Selecione o painel</option>
          {supportedPanels.map(panel => (
            <option key={panel.value} value={panel.value}>
              {panel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Primeira instalação */}
      {!installedPanel && (
        <button
          className="bg-green-600 text-white px-6 py-2 rounded font-bold w-full mb-2"
          onClick={handleInstall}
          disabled={installing || !selectedPanel}
        >
          {installing ? "Instalando..." : "Instalar"}
        </button>
      )}

      {/* Após instalar, mostra opções de reinstalar/desinstalar */}
      {installedPanel && (
        <div className="flex flex-col gap-2">
          <div className="mb-2 text-center text-blue-700 font-semibold">
            Painel instalado: {panels.find(p => p.value === installedPanel)?.name}
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold w-full"
            onClick={handleReinstall}
            disabled={installing}
          >
            {installing ? "Reinstalando..." : "Reinstalar"}
          </button>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded font-bold w-full"
            onClick={handleUninstall}
            disabled={installing}
          >
            {installing ? "Desinstalando..." : "Desinstalar"}
          </button>
        </div>
      )}

      {/* Barra de progresso */}
      {installing && (
        <div className="w-full bg-gray-200 rounded mt-4 h-4">
          <div
            className="bg-blue-600 h-4 rounded"
            style={{ width: `${progress}%`, transition: "width 0.5s" }}
          ></div>
        </div>
      )}

      {/* Mensagem de status */}
      {status && !installing && (
        <div className="mt-4 font-semibold text-green-700">{status}</div>
      )}

      {osName && (
        <div className="mt-2 text-sm text-gray-500">
          Sistema operacional detectado: <b>{osName}</b>
        </div>
      )}
    </div>
  );
}