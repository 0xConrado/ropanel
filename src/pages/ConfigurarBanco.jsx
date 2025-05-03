import React, { useState } from "react";

export default function ConfigurarBanco() {
  const [form, setForm] = useState({
    host: "127.0.0.1",
    usuario: "ragnarok",
    senha: "",
    database: "ragnarok",
    tipo: "rathena"
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Enviando...");
    const res = await fetch("/api/configurar-banco", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setStatus(data.success ? "Configuração salva com sucesso!" : "Erro: " + data.error);
  }

  return (
    <div className="max-w-lg bg-gray-900 rounded-lg shadow p-8 mt-4">
      <h3 className="text-2xl font-bold mb-6 text-gray-100">Configurar Banco de Dados</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Host:</label>
          <input
            name="host"
            value={form.host}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Usuário:</label>
          <input
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Senha:</label>
          <input
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Database:</label>
          <input
            name="database"
            value={form.database}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Tipo de Emulador:</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700"
          >
            <option value="rathena">rAthena</option>
            <option value="hercules">Hercules</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
        >
          CONF
        </button>
      </form>
      {status && (
        <div className="mt-4 text-center text-sm text-gray-200">
          {status}
        </div>
      )}
    </div>
  );
}