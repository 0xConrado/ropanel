import { Link } from "react-router-dom";

export default function SidebarItem({ icon, label, active, onClick, to }) {
  if (to) {
    // Link interno (ex: Configurações, Emulador, etc)
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all
          ${active ? "bg-gray-800 text-blue-400 font-semibold shadow" : "hover:bg-gray-800 hover:text-blue-300"}
        `}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  // Botão de seleção interna
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all
        ${active ? "bg-gray-800 text-blue-400 font-semibold shadow" : "hover:bg-gray-800 hover:text-blue-300"}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}