import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Monitor, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  Users,
  RefreshCw
} from 'lucide-react';
import { listarEquipos } from '../Api/Equipos/apiEquipos';
import { listarInsumos } from '../Api/Insumos/Insumos';
import { listarSalidas } from '../Api/Salidas/apiSalidaInsumos';
import { listarCambios } from '../Api/accesorios/accesorios';

const Home = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEquipos: 0,
    totalInsumos: 0,
    totalSalidas: 0,
    totalCambios: 0,
    equiposConAccesorio: 0,
    insumosBajos: 0,
    cambiosRecientes: [],
    salidasRecientes: []
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUsuario(user.usuario || 'Usuario');
      } catch (error) {
        setUsuario('Usuario');
      }
    } else {
      setUsuario('Usuario');
    }
    
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [equipos, insumos, salidas, cambios] = await Promise.all([
        listarEquipos(),
        listarInsumos(),
        listarSalidas(),
        listarCambios()
      ]);

      const equiposConAccesorio = equipos.filter(e => e.accesorio_asignado && e.accesorio_asignado !== '').length;
      const insumosBajos = insumos.filter(i => i.cantidad < 5).length;
      const cambiosRecientes = cambios.slice(0, 5);
      const salidasRecientes = salidas.slice(0, 5);

      setStats({
        totalEquipos: equipos.length,
        totalInsumos: insumos.length,
        totalSalidas: salidas.length,
        totalCambios: cambios.length,
        equiposConAccesorio: equiposConAccesorio,
        insumosBajos: insumosBajos,
        cambiosRecientes: cambiosRecientes,
        salidasRecientes: salidasRecientes
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin h-12 w-12 text-black" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 p-6">
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideIn { animation: slideIn 0.5s ease-out; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido, <span className="text-black">{usuario}</span>!
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Activity size={16} />
              Panel de control - Resumen general
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={cargarDatos}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
            
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 animate-slideIn delay-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Equipos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEquipos}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">{stats.equiposConAccesorio} con accesorio</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Monitor size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 animate-slideIn delay-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Insumos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalInsumos}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.insumosBajos > 0 ? (
                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {stats.insumosBajos} con stock bajo
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Todo en stock
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Package size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 animate-slideIn delay-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Salidas Registradas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSalidas}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Últimos 30 días</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 animate-slideIn delay-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Cambios de Accesorios</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCambios}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Historial de cambios</span>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                Cambios de Accesorios Recientes
              </h3>
            </div>
            <div className="p-4">
              {stats.cambiosRecientes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay cambios recientes</p>
              ) : (
                <div className="space-y-3">
                  {stats.cambiosRecientes.map((cambio) => (
                    <div key={cambio.id_cambio} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{cambio.equipo}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">{cambio.responsable}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Anterior: {cambio.accesorio_anterior || 'Ninguno'}</span>
                          <ArrowUpRight size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-700 font-medium">{cambio.accesorio_nuevo}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(cambio.fecha_cambio).toLocaleDateString()}
                        </p>
                        <span className={`text-xs font-medium ${
                          cambio.dias_con_accesorio > 365 ? 'text-red-600' :
                          cambio.dias_con_accesorio > 180 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {cambio.dias_con_accesorio} días
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

         
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-green-500" />
                Salidas de Insumos Recientes
              </h3>
            </div>
            <div className="p-4">
              {stats.salidasRecientes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay salidas recientes</p>
              ) : (
                <div className="space-y-3">
                  {stats.salidasRecientes.map((salida) => (
                    <div key={salida.id_salida} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{salida.tipo}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">{salida.marca}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{salida.responsable}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">Ref: {salida.referencia}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {salida.cantidad}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(salida.fecha).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

       
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Equipos con accesorio</p>
              <p className="text-xl font-bold text-gray-900">{stats.equiposConAccesorio}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Insumos con stock bajo</p>
              <p className="text-xl font-bold text-gray-900">{stats.insumosBajos}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total de movimientos</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalSalidas + stats.totalCambios}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Activity size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

       
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
          <p>Dashboard actualizado al día {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;