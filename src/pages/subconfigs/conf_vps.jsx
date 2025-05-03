import React, { useState } from "react";

export default function ConfVPS() {
  const [form, setForm] = useState({
    ip: "",
    usuario: "",
    porta: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section className="bg-gray-800 rounded-lg p-6 shadow mb-6">
      <h2 className="text-xl font-bold text-white mb-4">VPS</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-300">IP do Servidor</label>
          <input name="ip" className="w-full p-2 rounded bg-gray-900 text-white" value={form.ip} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Usuário SSH</label>
          <input name="usuario" className="w-full p-2 rounded bg-gray-900 text-white" value={form.usuario} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-gray-300">Porta SSH</label>
          <input name="porta" className="w-full p-2 rounded bg-gray-900 text-white" value={form.porta} onChange={handleChange} />
        </div>
      </div>
    </section>
  );
}