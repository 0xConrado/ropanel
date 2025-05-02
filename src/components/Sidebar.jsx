import { Link, useLocation } from "react-router-dom";
import { Home, Server, PanelTop, Globe, MessageCircle } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "bg-gray-700" : "hover:bg-gray-700";

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col border-r border-gray-700">
      <h1 className="text-xl font-bold p-4 border-b border-gray-700">RagnaPanel</h1>
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        <Link to="/" className={`flex items-center gap-2 p-2 rounded ${isActive("/")}`}>
          <Home size={18} /> Home
        </Link>
        <Link to="/panel" className={`flex items-center gap-2 p-2 rounded ${isActive("/panel")}`}>
          <PanelTop size={18} /> Panel
        </Link>
        <Link to="/emulador" className={`flex items-center gap-2 p-2 rounded ${isActive("/emulador")}`}>
          <Server size={18} /> Emulador
        </Link>
        <Link to="/fluxcp" className={`flex items-center gap-2 p-2 rounded ${isActive("/fluxcp")}`}>
          <Globe size={18} /> FluxCP
        </Link>
        <Link to="/forum" className={`flex items-center gap-2 p-2 rounded ${isActive("/forum")}`}>
          <MessageCircle size={18} /> Forum
        </Link>
      </nav>
    </div>
  );
}