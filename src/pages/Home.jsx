import { Server, Cpu, Globe, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const emuladorInstalado = false;
  const servidorLigado = false;
  const fluxcpInstalado = true;
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
          <p>Status: <span className={emuladorInstalado ? "text-green-400" : "text-red-400"}>
            {emuladorInstalado ? "Instalado" : "Não Instalado"}
          </span></p>
          {!emuladorInstalado && (
            <span className="absolute top-2 right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">Novo</span>
          )}
        </motion.div>

        {/* Servidor */}
        <motion.div
          className="bg-gray-800 rounded-xl p-4 shadow-lg"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <Server className="w-8 h-8 text-blue-400 mb-2" />
          <h2 className="text-xl font-bold mb-2">Servidor</h2>
          <p>Status: <span className={servidorLigado ? "text-green-400" : "text-red-400"}>
            {servidorLigado ? "Ligado" : "Desligado"}
          </span></p>
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
          <p>Status: <span className={fluxcpInstalado ? "text-green-400" : "text-red-400"}>
            {fluxcpInstalado ? "Instalado" : "Não Instalado"}
          </span></p>
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
          <p>Status: <span className={forumInstalado ? "text-green-400" : "text-red-400"}>
            {forumInstalado ? "Instalado" : "Não Instalado"}
          </span></p>
        </motion.div>

      </div>
    </div>
  );
}
