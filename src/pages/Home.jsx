import { useEffect, useState } from "react";
import { Server, Cpu, Globe, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  // Estados para status dinâmico
  const [installedPanels, setInstalledPanels] = useState([]);
  const [installedEmulators, setInstalledEmulators] = useState([]);
  // Você pode adicionar mais estados para outros serviços futuramente

  // Busca status do backend ao carregar
  useEffect(() => {
    fetch(`${API_URL}/api/panels/installed`)
      .then(res => res.json())
      .then(data => setInstalledPanels(data.installed || []));
    fetch(`${API_URL}/api/emulators/installed`)
      .then(res => res.json())
      .then(data => setInstalledEmulators(data.installed || []));
  }, []);

  // Exemplo: considere "webmin" como painel principal e "hercules" como emulador principal
  const emuladorInstalado = installedEmulators.length > 0; // true se qualquer emulador instalado
  const painelInstalado = installedPanels.length > 0; // true se qualquer painel instalado

  // Para mostrar nomes dos instalados (exemplo: Webmin, Hercules)
  const painelNome = installedPanels.length > 0 ? installedPanels[0].charAt(0).toUpperCase() + installedPanels[0].slice(1) : "Nenhum";
  const emuladorNome = installedEmulators.length > 0 ? installedEmulators[0].charAt(0).toUpperCase() + installedEmulators[0].slice(1) : "Nenhum";

  // Exemplo: status fixo para FluxCP e Fórum (você pode integrar depois)
  const fluxcpInstalado = false;
  const forumInstalado = false;
  const servidorLigado = false;

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
                  Instalado ({emuladorNome})
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
          className="bg-gray-800 rounded-xl p-4 shadow-lg relative"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <Server className="w-8 h-8 text-blue-400 mb-2" />
          <h2 className="text-xl font-bold mb-2">Painel</h2>
          <p>
            Status:{" "}
            <span className={painelInstalado ? "text-green-400" : "text-red-400"}>
              {painelInstalado ? (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Instalado ({painelNome})
                </>
              ) : (
                <>
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Não Instalado
                </>
              )}
            </span>
          </p>
          {!painelInstalado && (
            <span className="absolute top-2 right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">Novo</span>
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