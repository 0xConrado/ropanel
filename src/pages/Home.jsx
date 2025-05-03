import { useEffect, useState } from "react";
import { Server, Cpu, Globe, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

// Mapeamento dos painéis: nome, ícone base (sem extensão) e URL
const panelInfo = {
  aapanel: {
    name: "aaPanel",
    iconBase: "/icons/aapanel",
    url: (ip) => `https://${ip}:13349/`,
  },
  webmin: {
    name: "Webmin",
    iconBase: "/icons/webmin",
    url: (ip) => `https://${ip}:10000/`,
  },
  hestiacp: {
    name: "HestiaCP",
    iconBase: "/icons/hestiacp",
    url: (ip) => `https://${ip}:8083/`,
  },
  froxlor: {
    name: "Froxlor",
    iconBase: "/icons/froxlor",
    url: (ip) => `https://${ip}/froxlor/`,
  },
  cpanel: {
    name: "cPanel",
    iconBase: "/icons/cpanel",
    url: (ip) => `https://${ip}:2087/`,
  },
  cyberpanel: {
    name: "CyberPanel",
    iconBase: "/icons/cyberpanel",
    url: (ip) => `https://${ip}:8090/`,
  },
  ispconfig: {
    name: "ISPConfig",
    iconBase: "/icons/ispconfig",
    url: (ip) => `https://${ip}:8080/`,
  },
};

export default function Home() {
  const [installedPanels, setInstalledPanels] = useState([]);
  const [installedEmulators, setInstalledEmulators] = useState([]);
  const [serverIp, setServerIp] = useState("168.231.99.143"); // Coloque seu IP fixo ou busque via API

  // Estado para fallback do ícone do painel
  const [iconSrc, setIconSrc] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/panels/installed`)
      .then(res => res.json())
      .then(data => setInstalledPanels(data.installed || []));
    fetch(`${API_URL}/api/emulators/installed`)
      .then(res => res.json())
      .then(data => setInstalledEmulators(data.installed || []));
    // Se quiser buscar o IP dinamicamente, pode usar uma API ou variável de ambiente
  }, []);

  const emuladorInstalado = installedEmulators.length > 0;
  const painelInstalado = installedPanels.length > 0;
  const painelKey = painelInstalado ? installedPanels[0] : null;
  const painelData = painelKey ? panelInfo[painelKey] : null;

  // Atualiza o src do ícone sempre que o painel mudar
  useEffect(() => {
    if (painelData) {
      setIconSrc(`${painelData.iconBase}.svg`);
    } else {
      setIconSrc(null);
    }
  }, [painelData]);

  // Exemplo: status fixo para FluxCP e Fórum (você pode integrar depois)
  const fluxcpInstalado = false;
  const forumInstalado = false;

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="p-4 text-white space-y-4">
      <h1 className="text-3xl font-bold mb-4">Painel de Controle</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Emulador */}
        <motion.div
          className="bg-gray-800 rounded-xl p-4 shadow-lg relative"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <Cpu className="w-8 h-8 text-yellow-400 mb-2" />
          <h2 className="text-xl font-bold mb-2">Emulador</h2>
          <p>
            Status:{" "}
            <span className={emuladorInstalado ? "text-green-400" : "text-red-400"}>
              {emuladorInstalado ? (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Instalado ({installedEmulators[0]})
                </>
              ) : (
                <>
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Não Instalado
                </>
              )}
            </span>
          </p>
          {!emuladorInstalado && (
            <span className="absolute top-2 right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">Novo</span>
          )}
        </motion.div>

        {/* Painel */}
        <motion.div
          className="bg-gray-800 rounded-xl p-4 shadow-lg relative cursor-pointer"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          custom={1}
          onClick={() => {
            if (painelInstalado && painelData) {
              window.open(painelData.url(serverIp), "_blank");
            }
          }}
        >
          {painelInstalado && painelData ? (
            <>
              <img
                src={iconSrc}
                alt={painelData.name}
                className="w-12 h-12 mb-2 object-contain" // alinhado à esquerda
                style={{ filter: "drop-shadow(0 0 4px #fff8)" }}
                onError={() => {
                  if (iconSrc && iconSrc.endsWith(".svg")) {
                    setIconSrc(`${painelData.iconBase}.png`);
                  }
                }}
              />
              <h2 className="text-xl font-bold mb-2">{painelData.name}</h2>
              <p>
                Status:{" "}
                <span className="text-green-400">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Instalado
                </span>
              </p>
            </>
          ) : (
            <>
              <Server className="w-8 h-8 text-blue-400 mb-2" />
              <h2 className="text-xl font-bold mb-2">Painel</h2>
              <p>
                Status:{" "}
                <span className="text-red-400">
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Não Instalado
                </span>
              </p>
              <span className="absolute top-2 right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">Novo</span>
            </>
          )}
        </motion.div>

        {/* FluxCP */}
        <motion.div
          className="bg-gray-800 rounded-xl p-4 shadow-lg"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Globe className="w-8 h-8 text-green-400 mb-2" />
          <h2 className="text-xl font-bold mb-2">FluxCP</h2>
          <p>
            Status:{" "}
            <span className={fluxcpInstalado ? "text-green-400" : "text-red-400"}>
              {fluxcpInstalado ? (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Instalado
                </>
              ) : (
                <>
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Não Instalado
                </>
              )}
            </span>
          </p>
        </motion.div>

        {/* Fórum */}
        <motion.div
          className="bg-gray-800 rounded-xl p-4 shadow-lg"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <MessageCircle className="w-8 h-8 text-purple-400 mb-2" />
          <h2 className="text-xl font-bold mb-2">Fórum</h2>
          <p>
            Status:{" "}
            <span className={forumInstalado ? "text-green-400" : "text-red-400"}>
              {forumInstalado ? (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Instalado
                </>
              ) : (
                <>
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Não Instalado
                </>
              )}
            </span>
          </p>
        </motion.div>

      </div>
    </div>
  );
}