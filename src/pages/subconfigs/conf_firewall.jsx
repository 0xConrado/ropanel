import React, { useState } from "react";

export default function ConfFirewall() {
  const [porta, setPorta] = useState("");
  const [portas, setPortas] = useState([]);
  const [msg, setMsg] = useState("");

  const addPorta = () => {
    const p = porta.trim();
    if (p && !portas.includes(p)) {
      setPortas([...portas, p]);
      setPorta("");
    }
  };

  const removePorta = (p) => {
    setPortas(portas.filter(porta => porta !== p));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (portas.length === 0) {
      setMsg("Adicione pelo menos uma porta.");
      return;
    }
    setMsg("Enviando...");
    try {
      const res = await fetch("/api/vps/liberar-portas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portas })
      });
      const data = await res.json();
      setMsg(data.ok ? "Portas liberadas com sucesso!" : `Erro: ${data.error}`);
    } catch (err) {
      setMsg("Erro ao conectar ao backend.");
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Firewall / Portas</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-4">
          <input
            className="w-32 p-2 rounded bg-gray-900 text-white"
            value={porta}
            onChange={e => setPorta(e.target.value.replace(/\D/g, ""))}
            placeholder="Porta ex: 5121"
            maxLength={5}
          />
          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
            onClick={addPorta}
            disabled={!porta}
            title="Adicionar porta"
          >
            +
          </button>
        </div>
        {/* Lista de portas adicionadas */}
        <div className="mb-4 flex flex-wrap gap-2">
          {portas.map((p, idx) => (
            <span key={idx} className="flex items-center bg-gray-700 text-white px-3 py-1 rounded">
              {p}
              <button
                type="button"
                className="ml-2 text-red-400 hover:text-red-600"
                onClick={() => removePorta(p)}
                title="Remover"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Liberar portas
        </button>
      </form>
      {msg && <div className="mt-4 text-white">{msg}</div>}
    </section>
  );
}