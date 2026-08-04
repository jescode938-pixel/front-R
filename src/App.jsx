import './App.css'
import Layout from './componentes/Layout/Layout'
import RutaPrivada from './componentes/RutaPrivada/RutaPrivada'
import Equipos from './pages/Equipos'
import Home from './pages/Home'
import Insumos from './pages/Insumos'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SalidasInsumos from './pages/SalidasInsumos'
import Responsables from './pages/Responsables'
import Asignaciones from './pages/Asignaciones'
import Accesorios from './pages/Accesorios'
import Perfiles from './pages/Perfiles'

function App() {
 

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>}/>

        <Route element={<RutaPrivada />}>
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/responsables" element={<Responsables />} />
              <Route path="/equipos" element={<Equipos />} />
              <Route path="/asignaciones" element={<Asignaciones />} />
              <Route path="/accesorios" element={<Accesorios />} />
              <Route path="/insumos" element={<Insumos />} />
              <Route path="/salidas" element={<SalidasInsumos />} />
              <Route path="/perfiles" element={<Perfiles />} />
            </Route>
        </Route>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
