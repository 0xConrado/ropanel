import { Link, Outlet } from "react-router-dom";

export default function Configuracoes() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Configurações</h2>
      <nav className="mb-4 space-x-4">
        <Link to="/configuracoes/banco" className="text-blue-500 hover:underline">
          Configurar Banco
        </Link>
        {/* Adicione outros submenus aqui */}
      </nav>
      <Outlet />
    </div>
  );
}