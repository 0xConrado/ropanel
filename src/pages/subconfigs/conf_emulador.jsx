import React, { useEffect, useState } from "react";
import { Save, Pencil } from "lucide-react";

const arquivos = [
  "login_athena.conf",
  "map_athena.conf",
  "char_athena.conf",
  "inter_athena.conf"
];

export default function Emulador() {
  const [confDir, setConfDir] = useState(
    localStorage.getItem("emuConfDir") || ""
  );
  const [configs, setConfigs] = useState({});
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");

  // Busca os dados dos arquivos ao abrir a página ou mudar o caminho
  useEffect(() => {
    if (confDir) {
      fetch("/api/emulador/ler-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confDir })
      })
        .then(res => res.json())
        .then(data => setConfigs(data));
    }
  }, [confDir]);

  const handleChangeDir = e => setConfDir(e.target.value);

  const handleEdit = () => setEdit(true);

  const handleSaveDir = () => {
    localStorage.setItem("emuConfDir", confDir);
    setEdit(false);
    setMsg("Caminho salvo!");
    setTimeout(() => setMsg(""), 1500);
  };

  const handleFieldChange = (arq, key, value) => {
    setConfigs(prev => ({
      ...prev,
      [arq]: { ...prev[arq], [key]: value }
    }));
  };

  const handleSaveConfig = async (arq) => {
    setMsg("Salvando...");
    const res = await fetch("/api/emulador/salvar-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confDir,
        arquivo: arq,
        data: configs[arq]
      })
    });
    const data = await res.json();
    if (data.ok) {
      setMsg(`Arquivo ${arq} salvo!`);
      setTimeout(() => setMsg(""), 1500);
    } else {
      setMsg(`Erro ao salvar ${arq}: ${data.error}`);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Configuração do Emulador</h2>
      <div className="flex items-center gap-2 mb-4">
        <input
          className="w-full p-2 rounded bg-gray-900 text-white"
          value={confDir}
          onChange={handleChangeDir}
          disabled={!edit}
          placeholder="/root/Emulador/rathena/conf"
        />
        {edit ? (
          <button className="p-2" onClick={handleSaveDir} title="Salvar">
            <Save className="w-7 h-7 text-green-500" />
          </button>
        ) : (
          <button className="p-2" onClick={handleEdit} title="Editar">
            <Pencil className="w-7 h-7 text-blue-400" />
          </button>
        )}
      </div>
      {msg && <div className="mb-4 text-white">{msg}</div>}
      {confDir && (
        <div className="space-y-8">
          {arquivos.map(arq => (
            <div key={arq} className="bg-gray-900 rounded p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold">{arq}</span>
                <button
                  className="p-1"
                  onClick={() => handleSaveConfig(arq)}
                  title="Salvar alterações"
                >
                  <Save className="w-5 h-5 text-green-500" />
                </button>
              </div>
              {configs[arq] &&
                Object.entries(configs[arq]).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <label className="block text-gray-300">{key}</label>
                    <input
                      className="w-full p-2 rounded bg-gray-800 text-white"
                      value={value}
                      onChange={e =>
                        handleFieldChange(arq, key, e.target.value)
                      }
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}