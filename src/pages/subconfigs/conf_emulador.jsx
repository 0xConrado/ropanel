import React, { useEffect, useState } from "react";
import { Save, Pencil } from "lucide-react";

const arquivos = [
  "login_athena.conf",
  "map_athena.conf",
  "char_athena.conf",
  "inter_athena.conf"
];

const principais = {
  "login_athena.conf": [
    { key: "login_port", label: "Porta do Login Server" }
  ],
  "map_athena.conf": [
    { key: "map_ip", label: "IP do Map Server" },
    { key: "map_port", label: "Porta do Map Server" },
    { key: "char_ip", label: "IP do Char Server" },
    { key: "char_port", label: "Porta do Char Server" }
  ],
  "char_athena.conf": [
    { key: "char_ip", label: "IP do Char Server" },
    { key: "map_ip", label: "IP do Map Server" },
    { key: "char_port", label: "Porta do Char Server" }
  ],
  "inter_athena.conf": [
    // Login Server
    { section: "Login Server" },
    { key: "login_server_ip", label: "IP do Banco de Dados" },
    { key: "login_server_port", label: "Porta" },
    { key: "login_server_id", label: "Usuário" },
    { key: "login_server_pw", label: "Senha" },
    { key: "login_server_db", label: "Banco de Dados" },
    { key: "login_codepage", label: "Codificação" },
    { key: "login_case_sensitive", label: "Case Sensitive" },
    // IPBan Database
    { section: "IPBan Database" },
    { key: "ipban_db_ip", label: "IP do Banco de Dados" },
    { key: "ipban_db_port", label: "Porta" },
    { key: "ipban_db_id", label: "Usuário" },
    { key: "ipban_db_pw", label: "Senha" },
    { key: "ipban_db_db", label: "Banco de Dados" },
    { key: "ipban_codepage", label: "Codificação" },
    // Character Server
    { section: "Character Server" },
    { key: "char_server_ip", label: "IP do Banco de Dados" },
    { key: "char_server_port", label: "Porta" },
    { key: "char_server_id", label: "Usuário" },
    { key: "char_server_pw", label: "Senha" },
    { key: "char_server_db", label: "Banco de Dados" },
    // Map Server
    { section: "Map Server" },
    { key: "map_server_ip", label: "IP do Banco de Dados" },
    { key: "map_server_port", label: "Porta" },
    { key: "map_server_id", label: "Usuário" },
    { key: "map_server_pw", label: "Senha" },
    { key: "map_server_db", label: "Banco de Dados" },
    // Web Server
    { section: "Web Server" },
    { key: "web_server_ip", label: "IP do Banco de Dados" },
    { key: "web_server_port", label: "Porta" },
    { key: "web_server_id", label: "Usuário" },
    { key: "web_server_pw", label: "Senha" },
    { key: "web_server_db", label: "Banco de Dados" },
    // Log Database
    { section: "Log Database" },
    { key: "log_db_ip", label: "IP do Banco de Dados" },
    { key: "log_db_port", label: "Porta" },
    { key: "log_db_id", label: "Usuário" },
    { key: "log_db_pw", label: "Senha" },
    { key: "log_db_db", label: "Banco de Dados" },
    { key: "log_codepage", label: "Codificação" },
    { key: "log_login_db", label: "Tabela de Login" }
  ]
};

export default function ConfEmulador() {
  const [confDir, setConfDir] = useState(
    localStorage.getItem("emuConfDir") || ""
  );
  const [configs, setConfigs] = useState({});
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");

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
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-lg">{arq.replace("_athena.conf", "").toUpperCase()}</span>
                <button
                  className="p-1"
                  onClick={() => handleSaveConfig(arq)}
                  title="Salvar alterações"
                >
                  <Save className="w-5 h-5 text-green-500" />
                </button>
              </div>
              {/* Renderização especial para inter_athena.conf em seções */}
              {arq === "inter_athena.conf" ? (
                <div className="space-y-6">
                  {(() => {
                    const campos = principais[arq];
                    let atualSection = null;
                    return campos.map((item, idx) => {
                      if (item.section) {
                        atualSection = item.section;
                        return (
                          <div key={item.section} className="mb-2 mt-4">
                            <div className="text-yellow-400 font-bold text-base border-b border-yellow-400 pb-1 mb-2">
                              {item.section}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={item.key} className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block text-gray-300 font-semibold">{item.label}</label>
                          <input
                            className="w-full p-2 rounded bg-gray-800 text-white"
                            value={configs[arq]?.[item.key] || ""}
                            onChange={e =>
                              handleFieldChange(arq, item.key, e.target.value)
                            }
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {principais[arq].map(item => (
                    <div key={item.key} className="mb-2">
                      <label className="block text-gray-300 font-semibold">{item.label}</label>
                      <input
                        className="w-full p-2 rounded bg-gray-800 text-white"
                        value={configs[arq]?.[item.key] || ""}
                        onChange={e =>
                          handleFieldChange(arq, item.key, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}