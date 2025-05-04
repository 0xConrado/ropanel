import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Panel from "./pages/Panel";
import Emulador from "./pages/Emulador";
import FluxCP from "./pages/FluxCP";
import Forum from "./pages/Forum";
import NotFound from "./pages/NotFound";

// Importe os subconfigs:
import ConfVPS from "./pages/subconfigs/conf_vps";
import ConfBancoDeDados from "./pages/subconfigs/conf_bancodedados";
import ConfEmulador from "./pages/subconfigs/conf_emulador";
import ConfFirewall from "./pages/subconfigs/conf_firewall";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/panel" element={<Panel />} />
            <Route path="/emulador" element={<Emulador />} />
            <Route path="/fluxcp" element={<FluxCP />} />
            <Route path="/forum" element={<Forum />} />

            {/* Rotas para subconfigs */}
            <Route path="/subconfigs/conf_vps" element={<ConfVPS />} />
            <Route path="/subconfigs/conf_bancodedados" element={<ConfBancoDeDados />} />
            <Route path="/subconfigs/conf_emulador" element={<ConfEmulador />} />
            <Route path="/subconfigs/conf_firewall" element={<ConfFirewall />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;