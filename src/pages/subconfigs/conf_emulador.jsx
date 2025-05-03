import React, { useState } from "react";

export default function ConfEmulador() {
  const [form, setForm] = useState({
    caminho: "",
    confPath: ""
  });
  const [msg, setMsg] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("Enviando...");
    try {
      const res = await fetch("/api/emulador/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form })
      });
      const data = await res.json();
      setMsg(data.ok ? "Configuração do emulador salva!" : `Erro: ${data.error}`);
    } catch (err) {
      setMsg("Erro ao conectar ao backend.");
    }
  };

  return (
    <section className="bg-gray-800 rounded-lg p-6 shadow mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Emulador</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300">Caminho do Emulador</label>
          <input name="caminho" className="w-full p-2 rounded bg-gray-900 text-white" value={form.caminho} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Caminho dos arquivos .conf</label>
          <input name="confPath" className="w-full p-2 rounded bg-gray-900 text-white" value={form.confPath} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Salvar configurações do emulador</button>
        </div>
      </form>
      {msg && <div className="mt-4 text-white">{msg}</div>}
    </section>
  );
}