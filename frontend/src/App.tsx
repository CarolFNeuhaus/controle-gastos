import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home/Home'
import Historico from './pages/Historico/Historico'
import Configuracoes from './pages/Configuracoes/Configuracoes'
import Dividas from './pages/Dividas/Dividas'
import Cartoes from './pages/Cartoes/Cartoes'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dividas" element={<Dividas />} />
          <Route path="/cartoes" element={<Cartoes />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
