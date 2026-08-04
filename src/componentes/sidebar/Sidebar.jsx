// src/components/sidebar/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, X, Package, Menu } from 'lucide-react';
import { menuItems } from './menuConfig';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Disparar evento cuando cambia el estado del sidebar
  useEffect(() => {
    window.dispatchEvent(new Event('sidebarToggle'));
  }, [isOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Obtener usuario del sessionStorage
  const getUserInfo = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      return {
        nombre: user.usuario || user.nombre || 'Usuario',
        rol: user.rol || 'Usuario'
      };
    } catch {
      return { nombre: 'Usuario', rol: 'Usuario' };
    }
  };

  const userInfo = getUserInfo();

  return (
    <>
      {/* Overlay - Solo visible en móvil cuando el sidebar está abierto */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Versión expandida o reducida */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'w-[260px] sm:w-64' : 'w-[70px] sm:w-[72px]'}
          ${isOpen ? 'translate-x-0' : 'translate-x-0'}
          flex flex-col
          overflow-y-auto
          shadow-lg
          ${!isOpen && 'overflow-x-hidden'}
        `}
      >
        {/* Header del Sidebar - Versión expandida */}
        {isOpen ? (
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="bg-black rounded-xl p-2 sm:p-2.5 shadow-lg flex-shrink-0 hover:bg-gray-800 transition-colors cursor-pointer"
                  aria-label="Cerrar sidebar"
                >
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">Control</h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">Panel de control</p>
                </div>
              </div>
              
              {/* Botón cerrar en móvil dentro del sidebar */}
              {isMobile && (
                <button
                  onClick={closeSidebar}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Header del Sidebar - Versión reducida (solo ícono) */
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="bg-black rounded-xl p-2 shadow-lg hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Abrir sidebar"
            >
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </button>
          </div>
        )}

        {/* Menú de navegación */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  {isOpen ? (
                    /* Versión expandida - con texto */
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                        transition-all duration-200 group relative
                        text-sm sm:text-base
                        ${active 
                          ? 'bg-black text-white shadow-lg shadow-black/20' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                        }
                      `}
                    >
                      <Icon 
                        size={18} 
                        className={`
                          flex-shrink-0 transition-colors duration-200
                          sm:w-5 sm:h-5
                          ${active ? 'text-white' : 'text-gray-400 group-hover:text-black'}
                        `}
                      />
                      <span className="font-medium truncate">{item.title}</span>
                      {active && (
                        <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></span>
                      )}
                    </button>
                  ) : (
                    /* Versión reducida - solo ícono */
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center justify-center px-2 py-2.5 sm:py-3 rounded-xl
                        transition-all duration-200 group relative
                        ${active 
                          ? 'bg-black text-white shadow-lg shadow-black/20' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                        }
                      `}
                      title={item.title}
                    >
                      <Icon 
                        size={20} 
                        className={`
                          flex-shrink-0 transition-colors duration-200
                          sm:w-5 sm:h-5
                          ${active ? 'text-white' : 'text-gray-400 group-hover:text-black'}
                        `}
                      />
                      {active && (
                        <span className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"></span>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        {isOpen ? (
          /* Versión expandida - con texto */
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                text-red-600 hover:bg-red-50 hover:text-red-700
                transition-all duration-200 group
                text-sm sm:text-base
              "
            >
              <LogOut 
                size={18} 
                className="flex-shrink-0 text-red-500 group-hover:text-red-600 transition-colors sm:w-5 sm:h-5"
              />
              <span className="font-medium truncate">Cerrar Sesión</span>
            </button>
            
            <div className="mt-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white rounded-xl border border-gray-100">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                {userInfo.nombre}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                {userInfo.rol}
              </p>
            </div>
          </div>
        ) : (
          /* Versión reducida - solo ícono de logout */
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="
                w-full flex items-center justify-center px-2 py-2.5 sm:py-3 rounded-xl
                text-red-600 hover:bg-red-50 hover:text-red-700
                transition-all duration-200 group
              "
              title="Cerrar Sesión"
            >
              <LogOut 
                size={20} 
                className="flex-shrink-0 text-red-500 group-hover:text-red-600 transition-colors sm:w-5 sm:h-5"
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;