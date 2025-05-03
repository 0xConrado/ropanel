import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Panel from "./pages/Panel";
import Emulador from "./pages/Emulador";
import FluxCP from "./pages/FluxCP";
import Forum from "./pages/Forum";
import Configuracoes from "./pages/Configuracoes";
import ConfigurarBanco from "./pages/ConfigurarBanco"; // <--- adicione este import
import NotFound from "./pages/NotFound";

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
            {/* Rotas aninhadas para Configurações */}
            <Route path="/configuracoes" element={<Configuracoes />}>
              <Route path="banco" element={<ConfigurarBanco />} />
              {/* Adicione outros submenus aqui */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;