import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Server,
  PanelTop,
  Globe,
  MessageCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Database,
  Shield,
  Cpu
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [configOpen, setConfigOpen] = useState(
    location.pathname.startsWith("/subconfigs/")
  );

  const isActive = (path) =>
    location.pathname === path ? "bg-gray-700" : "hover:bg-gray-700";

  // Submenus de configurações na ordem desejada
  const subconfigs = [
    {
      to: "/subconfigs/conf_vps",
      icon: <Cpu size={16} />,
      label: "VPS"
    },
    {
      to: "/subconfigs/conf_bancodedados",
      icon: <Database size={16} />,
      label: "Banco de Dados"
    },
    {
      to: "/subconfigs/conf_emulador",
      icon: <Server size={16} />,
      label: "Emulador"
    },
    {
      to: "/subconfigs/conf_firewall",
      icon: <Shield size={16} />,
      label: "Firewall"
    }
  ];

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

        {/* Dropdown de Configurações */}
        <div>
          <button
            className={`flex items-center gap-2 p-2 rounded w-full text-left ${location.pathname.startsWith("/subconfigs/") ? "bg-gray-700" : "hover:bg-gray-700"}`}
            onClick={() => setConfigOpen((v) => !v)}
          >
            <Settings size={18} />
            Configurações
            <span className="ml-auto">
              {configOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          {configOpen && (
            <div className="ml-6 mt-1 flex flex-col gap-1">
              {subconfigs.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    isActive(item.to)
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}