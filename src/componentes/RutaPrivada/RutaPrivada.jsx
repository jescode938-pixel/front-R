import { Navigate, Outlet } from 'react-router-dom'

const RutaPrivada = () => {
  const token = sessionStorage.getItem('token')
  return token ? <Outlet /> : <Navigate to="/" replace />
}

export default RutaPrivada