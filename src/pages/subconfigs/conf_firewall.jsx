import React, { useState } from "react";

export default function ConfFirewall() {
  const [portas, setPortas] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("Enviando...");
    try {
      const res = await fetch("/api/vps/liberar-portas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portas: portas.split(",").map(p => p.trim()) })
      });
      const data = await res.json();
      setMsg(data.ok ? "Portas liberadas com sucesso!" : `Erro: ${data.error}`);
    } catch (err) {
      setMsg("Erro ao conectar ao backend.");
    }
  };

  return (
    <section className="bg-gray-800 rounded-lg p-6 shadow mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Firewall / Portas</h2>
      <form onSubmit={handleSubmit}>
        <label className="block text-gray-300 mb-2">Informe as portas a liberar (separadas por vírgula)</label>
        <input className="w-full p-2 rounded bg-gray-900 text-white" value={portas} onChange={e => setPortas(e.target.value)} placeholder="Ex: 5121,6121,6900" />
        <button type="submit" className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">Liberar portas</button>
      </form>
      {msg && <div className="mt-4 text-white">{msg}</div>}
    </section>
  );
}