// src/components/layout/Layout.js
import React, { useEffect, useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleSidebarToggle = () => {
      setIsSidebarOpen(prev => !prev);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  // Calcular el margen izquierdo basado en el estado del sidebar
  const getMarginLeft = () => {
    if (isMobile) return 'ml-0'; // En móvil no hay margen
    // Cuando el sidebar está abierto: 260px, cuando está cerrado: 70px (barra reducida)
    return isSidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[70px]';
  };

  // Calcular el padding inferior en móvil para dejar espacio a los tabs
  const getPaddingBottom = () => {
    return isMobile ? 'pb-20' : 'pb-0'; // 80px para los tabs
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Solo visible en desktop */}
      <Sidebar />
      
      <main className={`
        transition-all duration-300 ease-in-out
        ${getMarginLeft()}
        ${getPaddingBottom()}
        min-h-screen
      `}>
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;