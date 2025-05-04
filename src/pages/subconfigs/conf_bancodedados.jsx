import React, { useState } from "react";
import { Save, Pencil } from "lucide-react";

export default function ConfBancoDeDados() {
  // Carrega do localStorage se existir
  const getSaved = () => {
    try {
      return JSON.parse(localStorage.getItem("dbConfig")) || {
        host: "",
        usuario: "",
        senha: "",
        nomeBase: "",
        tipo: "RE"
      };
    } catch {
      return {
        host: "",
        usuario: "",
        senha: "",
        nomeBase: "",
        tipo: "RE"
      };
    }
  };

  const [form, setForm] = useState(getSaved());
  const [edit, setEdit] = useState(!form.host); // Se não tem host, começa editando
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveConfig = () => {
    localStorage.setItem("dbConfig", JSON.stringify(form));
    setEdit(false);
    setMsg("Configuração salva!");
    setTimeout(() => setMsg(""), 1500);
  };

  const handleEditConfig = () => setEdit(true);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("Enviando...");
    setResult(null);
    try {
      const res = await fetch("/api/database/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Banco criado e SQL importado com sucesso!");
        setResult({ userid: data.userid, userpass: data.userpass });
      } else {
        setMsg(`Erro: ${data.error}`);
        setResult(null);
      }
    } catch (err) {
      setMsg("Erro ao conectar ao backend.");
      setResult(null);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Banco de Dados</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300">Host</label>
          <input
            name="host"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.host}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-gray-300">Usuário</label>
          <input
            name="usuario"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.usuario}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-gray-300">Senha</label>
          <input
            name="senha"
            type="password"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.senha}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-gray-300">Nome base do banco</label>
          <input
            name="nomeBase"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.nomeBase}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-gray-300">Tipo de Servidor</label>
          <select
            name="tipo"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.tipo}
            onChange={handleChange}
            disabled={!edit}
          >
            <option value="RE">RE</option>
            <option value="PRE-RE">PRE-RE</option>
          </select>
        </div>
        <div className="md:col-span-2 flex items-center gap-2 mt-2">
          {edit ? (
            <button
              type="button"
              className="p-2"
              onClick={handleSaveConfig}
              title="Salvar"
            >
              <Save className="w-7 h-7 text-green-500" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2"
              onClick={handleEditConfig}
              title="Editar"
            >
              <Pencil className="w-7 h-7 text-blue-400" />
            </button>
          )}
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            disabled={edit}
            title={edit ? "Confirme os dados antes de criar o banco" : ""}
          >
            Criar bancos e importar SQL
          </button>
        </div>
      </form>
      {msg && <div className="mt-4 text-white">{msg}</div>}
      {result && (
        <div className="mt-6 bg-gray-900 rounded p-4 text-white">
          <div className="mb-2 font-bold text-lg">Login do Emulador Gerado:</div>
          <div>
            <span className="font-semibold">userid:</span> <span className="select-all">{result.userid}</span>
          </div>
          <div>
            <span className="font-semibold">passwd:</span> <span className="select-all">{result.userpass}</span>
          </div>
        </div>
      )}
    </section>
  );
}