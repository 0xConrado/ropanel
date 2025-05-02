import { useParams } from "react-router-dom";
import { Server, Wrench, Power, RotateCw, Terminal } from "lucide-react";

export default function EmuladorStatus({ emuladores }) {
  const { nome } = useParams();

  if (!emuladores.includes(nome)) {
    return <div className="text-red-400">Emulador não encontrado!</div>;
  }

  // Aqui você pode buscar o status real do emulador, comandos, etc.
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 capitalize">{nome}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-400">Instalação</p>
              <p className="text-green-400">Instalado</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Compilação</p>
              <p className="text-red-400">Não compilado</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Estado</p>
              <p className="text-red-400">Parado</p>
            </div>
          </div>
        </div>
        {/* Controles */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Controle</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 p-2 rounded justify-center bg-blue-600 hover:bg-blue-700">
              <Wrench size={16} /> Compilar
            </button>
            <button className="flex items-center gap-2 p-2 rounded justify-center bg-green-600 hover:bg-green-700">
              <Power size={16} /> Iniciar
            </button>
            <button className="flex items-center gap-2 p-2 rounded justify-center bg-yellow-600 hover:bg-yellow-700">
              <RotateCw size={16} /> Reiniciar
            </button>
            <button className="flex items-center gap-2 p-2 rounded justify-center bg-red-600 hover:bg-red-700">
              <Power size={16} /> Parar
            </button>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Terminal size={20} /> Logs do Sistema
        </h3>
        <div className="bg-black text-green-400 font-mono text-sm p-3 rounded h-64 overflow-y-auto">
          <p className="text-gray-500">Nenhuma atividade registrada...</p>
        </div>
      </div>
    </div>
  );
}