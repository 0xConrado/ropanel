import React, { useState } from "react";

export default function ConfVPS() {
  const [form, setForm] = useState({
    ip: "",
    usuario: "",
    porta: ""
  });
  const [edit, setEdit] = useState(true);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => setEdit(false);
  const handleEdit = () => setEdit(true);

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">VPS</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-300">IP do Servidor</label>
          <input
            name="ip"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.ip}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-gray-300">Usuário SSH</label>
          <input
            name="usuario"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.usuario}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-gray-300">Porta SSH</label>
          <input
            name="porta"
            className="w-full p-2 rounded bg-gray-900 text-white"
            value={form.porta}
            onChange={handleChange}
            disabled={!edit}
          />
        </div>
      </div>
      <div className="mt-6">
        {edit ? (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Salvar
          </button>
        ) : (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleEdit}
          >
            Editar
          </button>
        )}
      </div>
    </section>
  );
}