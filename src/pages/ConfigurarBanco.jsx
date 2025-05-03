import React, { useState } from "react";

export default function ConfigurarBanco() {
  const [form, setForm] = useState({
    host: "127.0.0.1",
    usuario: "ragnarok",
    senha: "",
    database: "ragnarok",
    tipo: "rathena" // ou hercules, etc
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Enviando...");
    const res = await fetch("http://localhost:3001/api/configurar-banco", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setStatus(data.success ? "Configuração salva com sucesso!" : "Erro: " + data.error);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Configurar Banco de Dados do Emulador</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Host:</label>
          <input name="host" value={form.host} onChange={handleChange} className="border p-1 w-full" />
        </div>
        <div>
          <label>Usuário:</label>
          <input name="usuario" value={form.usuario} onChange={handleChange} className="border p-1 w-full" />
        </div>
        <div>
          <label>Senha:</label>
          <input name="senha" value={form.senha} onChange={handleChange} className="border p-1 w-full" type="password" />
        </div>
        <div>
          <label>Database:</label>
          <input name="database" value={form.database} onChange={handleChange} className="border p-1 w-full" />
        </div>
        <div>
          <label>Tipo de Emulador:</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="border p-1 w-full">
            <option value="rathena">rAthena</option>
            <option value="hercules">Hercules</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">CONF</button>
      </form>
      {status && <div className="mt-4">{status}</div>}
    </div>
  );
}