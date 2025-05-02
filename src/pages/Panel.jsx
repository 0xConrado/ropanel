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
  const [installedPanel, setInstalledPanel] = useState(""); // Novo estado

  useEffect(() => {
    fetch(`${API_URL}/api/os`)
      .then(res => res.json())
      .then(data => setOsName(data.name));
    // Aqui você pode buscar do backend qual painel está instalado, se quiser persistência real
  }, []);

  // Log para depuração
  useEffect(() => {
    if (osName) {
      console.log("SO detectado:", JSON.stringify(osName));
    }
  }, [osName]);

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

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Instalar Painel</h2>
      <div className="mb-4">
        <select
          className="p-2 border rounded"
          value={selectedPanel}
          onChange={e => setSelectedPanel(e.target.value)}
          disabled={installing}
        >
          <option value="">Selecione o painel</option>
          {panels.map(panel => {
            const isSupported = panel.supported.some(s =>
              osName.trim().toLowerCase().includes(s.toLowerCase())
            );
            return (
              <option
                key={panel.value}
                value={panel.value}
                disabled={!isSupported}
                style={{
                  color: isSupported ? "black" : "red",
                  backgroundColor: !isSupported ? "#ffeaea" : "white",
                }}
              >
                {panel.name}
                {!isSupported ? " (não suportado)" : ""}
              </option>
            );
          })}
        </select>
      </div>
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleInstall}
          disabled={
            installing ||
            !selectedPanel ||
            !panels.find(
              p =>
                p.value === selectedPanel &&
                p.supported.some(s =>
                  osName.trim().toLowerCase().includes(s.toLowerCase())
                )
            )
          }
        >
          {installing ? "Instalando..." : "Instalar"}
        </button>
        {installedPanel && (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleUninstall}
            disabled={installing}
          >
            {installing ? "Desinstalando..." : "Desinstalar"}
          </button>
        )}
      </div>
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
      {installedPanel && (
        <div className="mt-2 text-sm text-blue-700">
          Painel instalado: <b>{panels.find(p => p.value === installedPanel)?.name}</b>
        </div>
      )}
    </div>
  );
}