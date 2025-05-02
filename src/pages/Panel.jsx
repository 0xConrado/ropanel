import React, { useState, useEffect } from "react";

const panels = [
  { name: "Webmin", value: "webmin", supported: ["Ubuntu", "Debian"] },
  { name: "cPanel", value: "cpanel", supported: ["CentOS", "CloudLinux", "AlmaLinux"] },
  // Adicione outros painéis e seus SOs suportados
];

export default function Panel() {
  const [selectedPanel, setSelectedPanel] = useState("");
  const [status, setStatus] = useState("");
  const [osName, setOsName] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/os")
      .then(res => res.json())
      .then(data => setOsName(data.name));
  }, []);

  // Log para depuração
  useEffect(() => {
    if (osName) {
      console.log("SO detectado:", JSON.stringify(osName));
    }
  }, [osName]);

  const handleInstall = async () => {
    if (!selectedPanel) {
      setStatus("Selecione um painel para instalar.");
      return;
    }
    setStatus("Instalando...");
    try {
      const res = await fetch(`http://localhost:3001/install/panel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel: selectedPanel }),
      });
      const data = await res.text();
      setStatus(data);
    } catch (err) {
      setStatus("Erro ao instalar o painel.");
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
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleInstall}
        disabled={
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
        Instalar
      </button>
      {status && <div className="mt-4">{status}</div>}
      {osName && (
        <div className="mt-2 text-sm text-gray-500">
          Sistema operacional detectado: <b>{osName}</b>
        </div>
      )}
    </div>
  );
}