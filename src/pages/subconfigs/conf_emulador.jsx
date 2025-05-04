import React, { useEffect, useState } from "react";
import { Save, Pencil, ChevronDown, ChevronUp } from "lucide-react";

const arquivos = [
  "login_athena.conf",
  "map_athena.conf",
  "char_athena.conf",
  "inter_athena.conf"
];

// Defina os campos principais de cada arquivo
const principais = {
  "login_athena.conf": ["userid", "passwd", "login_ip", "login_port"],
  "map_athena.conf": ["userid", "passwd", "map_ip", "map_port"],
  "char_athena.conf": ["userid", "passwd", "char_ip", "char_port"],
  "inter_athena.conf": ["sql.db_hostname", "sql.db_username", "sql.db_password", "sql.db_database"]
};

export default function ConfEmulador() {
  const [confDir, setConfDir] = useState(
    localStorage.getItem("emuConfDir") || ""
  );
  const [configs, setConfigs] = useState({});
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");
  const [expandido, setExpandido] = useState({});

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

  const toggleExpand = (arq) => {
    setExpandido(prev => ({
      ...prev,
      [arq]: !prev[arq]
    }));
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
                <button
                  className="p-1"
                  onClick={() => toggleExpand(arq)}
                  title={expandido[arq] ? "Minimizar" : "Maximizar"}
                >
                  {expandido[arq] ? (
                    <ChevronUp className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-yellow-400" />
                  )}
                </button>
              </div>
              {configs[arq] &&
                Object.entries(configs[arq])
                  .filter(([key]) =>
                    expandido[arq]
                      ? true
                      : (principais[arq] || []).includes(key)
                  )
                  .map(([key, value]) => (
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
              {!expandido[arq] && configs[arq] && (
                <div className="text-xs text-gray-400 mt-2">
                  Mostrando apenas os campos principais. Clique em <ChevronDown className="inline w-4 h-4" /> para ver todos.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}