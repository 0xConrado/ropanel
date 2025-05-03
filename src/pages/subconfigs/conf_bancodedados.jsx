import React, { useState } from "react";

export default function ConfBancoDeDados() {
  const [form, setForm] = useState({
    host: "",
    usuario: "",
    senha: "",
    nomeBase: "",
    tipo: "RE"
  });
  const [msg, setMsg] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("Enviando...");
    try {
      const res = await fetch("/api/database/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoServidor: form.tipo,
          nomeBase: form.nomeBase,
          usuario: form.usuario,
          senha: form.senha
        })
      });
      const data = await res.json();
      setMsg(data.ok ? "Banco criado e SQL importado com sucesso!" : `Erro: ${data.error}`);
    } catch (err) {
      setMsg("Erro ao conectar ao backend.");
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Banco de Dados</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300">Host</label>
          <input name="host" className="w-full p-2 rounded bg-gray-900 text-white" value={form.host} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Usuário</label>
          <input name="usuario" className="w-full p-2 rounded bg-gray-900 text-white" value={form.usuario} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Senha</label>
          <input name="senha" type="password" className="w-full p-2 rounded bg-gray-900 text-white" value={form.senha} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Nome base do banco</label>
          <input name="nomeBase" className="w-full p-2 rounded bg-gray-900 text-white" value={form.nomeBase} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Tipo de Servidor</label>
          <select name="tipo" className="w-full p-2 rounded bg-gray-900 text-white" value={form.tipo} onChange={handleChange}>
            <option value="RE">RE</option>
            <option value="PRE-RE">PRE-RE</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Criar bancos e importar SQL</button>
        </div>
      </form>
      {msg && <div className="mt-4 text-white">{msg}</div>}
    </section>
  );
}