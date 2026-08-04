
import { Home, LaptopMinimal, LaptopMinimalCheck, Monitor, Package, PackageMinus, Toolbox, Users } from 'lucide-react';

export const menuItems = [
  {
    title: 'Inicio',
    path: '/home',
    icon: Home
  },
  {
    title: 'Usuarios',
    path: '/responsables',
    icon: Users
  },
   {
    title: 'Perfiles',
    path: '/perfiles',
    icon: Users
  },
    {
    title: 'Equipos',
    path: '/equipos',
    icon: Monitor
  },
  
  {
    title: 'Asignaciones',
    path: '/asignaciones',
    icon: LaptopMinimalCheck
  },
  {
    title: 'Accesorios',
    path: '/accesorios',
    icon: Toolbox
  },

  {
    title: 'Insumos',
    path: '/insumos',
    icon: Package
  }
 
  /*{
    title: 'Salidas de insumos',
    path: '/salidas',
    icon: PackageMinus
  }*/
];