import React, { useState } from "react";
import ConfBancoDeDados from "./subconfigs/conf_bancodedados";
import ConfEmulador from "./subconfigs/conf_emulador";
import ConfVPS from "./subconfigs/conf_vps";
import ConfFirewall from "./subconfigs/conf_firewall";

const menus = [
  { key: "banco", label: "Banco de Dados" },
  { key: "emulador", label: "Emulador" },
  { key: "vps", label: "VPS" },
  { key: "firewall", label: "Firewall / Portas" }
];

export default function Configuracoes() {
  const [active, setActive] = useState("banco");

  return (
    <div className="flex min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 rounded-l-lg p-4 flex flex-col gap-2">
        {menus.map(menu => (
          <button
            key={menu.key}
            className={`text-left px-4 py-2 rounded transition-all font-semibold ${
              active === menu.key
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
            onClick={() => setActive(menu.key)}
          >
            {menu.label}
          </button>
        ))}
      </aside>
      {/* Conteúdo */}
      <main className="flex-1 bg-gray-800 rounded-r-lg p-8">
        {active === "banco" && <ConfBancoDeDados />}
        {active === "emulador" && <ConfEmulador />}
        {active === "vps" && <ConfVPS />}
        {active === "firewall" && <ConfFirewall />}
      </main>
    </div>
  );
}