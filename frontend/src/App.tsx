import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home/Home'
import Historico from './pages/Historico/Historico'
import Metas from './pages/Metas/Metas'
import Estimativas from './pages/Estimativas/Estimativas'
import Configuracoes from './pages/Configuracoes/Configuracoes'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/estimativas" element={<Estimativas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
