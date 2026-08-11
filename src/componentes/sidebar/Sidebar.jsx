// src/components/sidebar/Sidebar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, X, Package, Menu } from 'lucide-react';
import { menuItems } from './menuConfig';

// Definir qué items NO se muestran en móvil
const ITEMS_OCULTOS_MOVIL = ['Asignaciones', 'Accesorios', 'Insumos'];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 🔥 Usar useMemo para que menuItemsMobile no se recalcule en cada render
  const menuItemsMobile = useMemo(() => {
    return menuItems.filter(item => 
      !ITEMS_OCULTOS_MOVIL.includes(item.title)
    );
  }, []); // Solo se calcula una vez

  // Determinar qué items usar según el dispositivo
  const currentMenuItems = useMemo(() => {
    return isMobile ? menuItemsMobile : menuItems;
  }, [isMobile, menuItemsMobile]);

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

  // 🔥 Sincronizar el tab activo con la ruta actual - CORREGIDO
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = currentMenuItems.findIndex(item => item.path === currentPath);
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [location.pathname, currentMenuItems]); // Dependencias estables

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNavigation = (path, index) => {
    setActiveTab(index);
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

  // 🔥 Obtener índice del item activo para los tabs móviles
  const getActiveMobileIndex = () => {
    const currentPath = location.pathname;
    return menuItemsMobile.findIndex(item => item.path === currentPath);
  };

  // 🔄 Si es móvil, solo mostrar los tabs (no el sidebar)
  if (isMobile) {
    const mobileActiveIndex = getActiveMobileIndex();

    return (
      <>
        {/* Tabs móvil - siempre visible en la parte inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg md:hidden">
          <div className="flex justify-around items-stretch">
            {menuItemsMobile.map((item, index) => {
              const Icon = item.icon;
              const active = mobileActiveIndex === index;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path, index)}
                  className={`
                    flex-1 flex flex-col items-center justify-center py-2.5 px-1
                    transition-all duration-200 relative
                    ${active ? 'text-black' : 'text-gray-500 hover:text-black'}
                  `}
                >
                  {/* Indicador de tab activo */}
                  {active && (
                    <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-black rounded-full" />
                  )}
                  
                  <Icon 
                    size={22} 
                    className={`
                      transition-colors duration-200
                      ${active ? 'text-black' : 'text-gray-400'}
                    `}
                  />
                  
                  <span className={`
                    text-[10px] mt-1 font-medium truncate max-w-full
                    ${active ? 'text-black' : 'text-gray-500'}
                  `}>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón flotante para menú */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 bg-black text-white p-2.5 rounded-xl shadow-lg hover:bg-gray-800 transition-colors md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>

        {/* Sidebar flotante */}
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
              onClick={closeSidebar}
            />
            
            {/* Sidebar flotante */}
            <aside className="fixed top-0 left-0 h-screen w-[280px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-black" />
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">Control</h1>
                      <p className="text-xs text-gray-500">Panel de control</p>
                    </div>
                  </div>
                  <button
                    onClick={closeSidebar}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Menú completo */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                  {menuItemsMobile.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => handleNavigation(item.path, index)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-all duration-200 group
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
                              ${active ? 'text-white' : 'text-gray-400 group-hover:text-black'}
                            `}
                          />
                          <span className="font-medium text-sm">{item.title}</span>
                          {active && (
                            <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer del sidebar flotante */}
              <div className="p-3 border-t border-gray-200 bg-gray-50/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-sm"
                >
                  <LogOut size={18} className="text-red-500" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
                <div className="mt-2 px-3 py-2 bg-white rounded-xl border border-gray-100">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {userInfo.nombre}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {userInfo.rol}
                  </p>
                </div>
              </div>
            </aside>
          </>
        )}
      </>
    );
  }

  // 📱 Desktop - Sidebar completo
  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'w-[260px]' : 'w-[70px]'}
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
          </div>
        </div>
      ) : (
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
                  <button
                    onClick={() => handleNavigation(item.path, menuItems.indexOf(item))}
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
                  <button
                    onClick={() => handleNavigation(item.path, menuItems.indexOf(item))}
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
  );
};

export default Sidebar;