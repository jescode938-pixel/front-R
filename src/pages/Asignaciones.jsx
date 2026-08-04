import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, History, ChevronDown, ChevronUp, Clock, UserPlus, Trash2 as TrashIcon, MoreVertical } from 'lucide-react';
import { 
  listarAsignaciones, 
  obtenerAsignacion, 
  crearAsignacionConImagen, 
  actualizarAsignacionConImagen,
  eliminarAsignacion,
  devolverAsignacionConImagen,
  convertirImagenABase64
} from '../Api/Asignaciones/apiAsignaciones';
import { listarEquipos } from '../Api/Equipos/apiEquipos';
import { listarResponsables } from '../Api/Responsables/apiResponsables';
import { 
  listarCambios, 
  crearCambio, 
  actualizarCambio, 
  eliminarCambio, 
  obtenerCambio,
  accesoriosDisponibles
} from '../Api/accesorios/accesorios';
import PDFAsignaciones from '../componentes/pdf/PDFAsignaciones';
import { Base_url } from '../Api/Config/apiConfig';

// ============================================
// DEFINIR API_URL
// ============================================
const API_URL = Base_url.replace('/api', '');

// ============================================
// FUNCIÓN PARA CONVERTIR IMAGEN A BASE64
// ============================================
const convertirImagenABase64FromUrl = async (url) => {
  try {
    console.log('📷 Intentando cargar imagen desde:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/webp,image/png,image/jpeg,image/*',
      }
    });
    
    console.log('📷 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('✅ Imagen cargada, tamaño:', blob.size, 'bytes');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('✅ Imagen convertida a Base64, longitud:', reader.result?.length);
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.error('❌ Error al leer la imagen:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Error al convertir imagen:', error);
    return null;
  }
};

const Asignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [cambios, setCambios] = useState({});
  const [accesoriosLista, setAccesoriosLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showCambioPanel, setShowCambioPanel] = useState(false);
  const [showEditarCambioPanel, setShowEditarCambioPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingCambioId, setEditingCambioId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandido, setExpandido] = useState({});
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedResponsableForNewEquipo, setSelectedResponsableForNewEquipo] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfData, setPdfData] = useState({
    asignaciones: [],
    responsable: null,
    imagenBase64: null
  });
  // Estado para el menú desplegable
  const [menuAbierto, setMenuAbierto] = useState(null);
  
  // Estados para la imagen
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [eliminarImagenExistente, setEliminarImagenExistente] = useState(false);
  const [imagenActual, setImagenActual] = useState('');

  const [formData, setFormData] = useState({
    id_equipo: '',
    id_responsable: '',
    fecha_asignacion: '',
    observaciones: ''
  });
  const [cambioData, setCambioData] = useState({
    id_equipo: '',
    id_accesorio: '',
    fecha_cambio: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (showPanel || showCambioPanel || showEditarCambioPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPanel, showCambioPanel, showEditarCambioPanel]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuAbierto && !e.target.closest('.menu-dropdown')) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuAbierto]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [asignacionesData, equiposData, responsablesData, cambiosData, accesoriosData] = await Promise.all([
        listarAsignaciones(),
        listarEquipos(),
        listarResponsables(),
        listarCambios(),
        accesoriosDisponibles()
      ]);

      setAsignaciones(asignacionesData);
      setEquipos(equiposData);
      setResponsables(responsablesData);
      setAccesoriosLista(accesoriosData);

      const cambiosMap = {};
      equiposData.forEach(equipo => {
        cambiosMap[equipo.id_equipo] = cambiosData.filter(c => c.id_equipo === equipo.id_equipo);
      });
      setCambios(cambiosMap);

    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorResponsable = (asignaciones) => {
    const grupos = {};
    asignaciones.forEach(asignacion => {
      const key = asignacion.id_responsable;
      if (!grupos[key]) {
        grupos[key] = {
          id_responsable: asignacion.id_responsable,
          responsable: asignacion.responsable,
          cargo: asignacion.cargo,
          area: asignacion.area,
          asignaciones: []
        };
      }
      grupos[key].asignaciones.push(asignacion);
    });
    return Object.values(grupos);
  };

  const handleOpenPDF = async (responsableId = null) => {
    let asignacionesFiltradas = [];
    let responsableNombre = null;

    if (responsableId) {
      asignacionesFiltradas = asignaciones.filter(a => a.id_responsable === responsableId);
      const responsable = responsables.find(r => r.id_responsable === responsableId);
      responsableNombre = responsable ? responsable.nombre : null;
    } else {
      asignacionesFiltradas = asignaciones;
    }

    if (asignacionesFiltradas.length === 0) {
      setError(responsableId ? 'Este responsable no tiene asignaciones' : 'No hay asignaciones para generar el PDF');
      setTimeout(() => setError(''), 3000);
      return;
    }

    let imagenBase64 = null;
    const imagenUrl = asignacionesFiltradas.find(a => a.imagen_url)?.imagen_url;
    
    if (imagenUrl) {
      const urlCompleta = `${API_URL}${imagenUrl}`;
      console.log('📷 Cargando imagen desde:', urlCompleta);
      imagenBase64 = await convertirImagenABase64FromUrl(urlCompleta);
      console.log('📷 Base64 generado:', imagenBase64 ? '✅ Éxito' : '❌ Falló');
    }

    setPdfData({
      asignaciones: asignacionesFiltradas,
      responsable: responsableNombre,
      imagenBase64: imagenBase64
    });
    setShowPDF(true);
  };

  const handleOpenPanel = (id = null, responsableId = null) => {
    setImagenFile(null);
    setImagenPreview('');
    setEliminarImagenExistente(false);
    setImagenActual('');

    if (id) {
      setEditingId(id);
      cargarAsignacion(id);
    } else {
      setEditingId(null);
      setFormData({
        id_equipo: '',
        id_responsable: responsableId || '',
        fecha_asignacion: new Date().toISOString().split('T')[0],
        observaciones: ''
      });
    }
    setShowPanel(true);
    setMenuAbierto(null);
  };

  const handleOpenPanelForResponsable = (responsableId) => {
    setSelectedResponsableForNewEquipo(responsableId);
    handleOpenPanel(null, responsableId);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setEditingId(null);
    setSelectedResponsableForNewEquipo(null);
    setImagenFile(null);
    setImagenPreview('');
    setEliminarImagenExistente(false);
    setImagenActual('');
    setFormData({
      id_equipo: '',
      id_responsable: '',
      fecha_asignacion: '',
      observaciones: ''
    });
  };

  const cargarAsignacion = async (id) => {
    try {
      const data = await obtenerAsignacion(id);
      setFormData({
        id_equipo: data.id_equipo || '',
        id_responsable: data.id_responsable || '',
        fecha_asignacion: data.fecha_asignacion ? data.fecha_asignacion.split('T')[0] : '',
        observaciones: data.observaciones || ''
      });
      if (data.imagen_url) {
        setImagenActual(data.imagen_url);
      }
    } catch (err) {
      setError('Error al cargar la asignación');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imagenBase64 = await convertirImagenABase64(file);
        setImagenPreview(imagenBase64);
        setImagenFile(file);
        if (imagenActual) {
          setEliminarImagenExistente(true);
        }
      } catch (error) {
        alert(error.message);
        e.target.value = '';
      }
    }
  };

  const handleEliminarImagen = () => {
    if (imagenActual) {
      setEliminarImagenExistente(true);
      setImagenActual('');
      setImagenPreview('');
      setImagenFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const datos = {
        id_equipo: formData.id_equipo,
        id_responsable: formData.id_responsable,
        fecha_asignacion: formData.fecha_asignacion,
        observaciones: formData.observaciones
      };

      if (editingId) {
        await actualizarAsignacionConImagen(
          editingId, 
          datos, 
          imagenFile, 
          eliminarImagenExistente
        );
      } else {
        await crearAsignacionConImagen(datos, imagenFile);
      }
      await cargarDatos();
      handleClosePanel();
    } catch (err) {
      setError(err.message || 'Error al guardar la asignación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignación?')) {
      try {
        await eliminarAsignacion(id);
        await cargarDatos();
        setMenuAbierto(null);
      } catch (err) {
        setError('Error al eliminar la asignación');
        console.error(err);
      }
    }
  };

  const handleOpenCambioPanel = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setCambioData({
      id_equipo: asignacion.id_equipo,
      id_accesorio: '',
      fecha_cambio: new Date().toISOString().split('T')[0],
      observaciones: ''
    });
    setShowCambioPanel(true);
    setMenuAbierto(null);
  };

  const handleCloseCambioPanel = () => {
    setShowCambioPanel(false);
    setSelectedAsignacion(null);
    setCambioData({
      id_equipo: '',
      id_accesorio: '',
      fecha_cambio: '',
      observaciones: ''
    });
  };

  const handleOpenEditarCambioPanel = async (id_cambio) => {
    try {
      const data = await obtenerCambio(id_cambio);
      setEditingCambioId(id_cambio);
      setCambioData({
        id_equipo: data.id_equipo || '',
        id_accesorio: data.id_accesorio || '',
        fecha_cambio: data.fecha_asignacion ? data.fecha_asignacion.split('T')[0] : '',
        observaciones: data.observaciones || ''
      });
      setShowEditarCambioPanel(true);
    } catch (err) {
      setError('Error al cargar el cambio');
      console.error(err);
    }
  };

  const handleCloseEditarCambioPanel = () => {
    setShowEditarCambioPanel(false);
    setEditingCambioId(null);
    setCambioData({
      id_equipo: '',
      id_accesorio: '',
      fecha_cambio: '',
      observaciones: ''
    });
  };

  const handleCambioChange = (e) => {
    const { name, value } = e.target;
    setCambioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitCambio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const datosCambio = {
        id_equipo: cambioData.id_equipo,
        id_accesorio: parseInt(cambioData.id_accesorio),
        fecha_asignacion: cambioData.fecha_cambio,
        observaciones: cambioData.observaciones
      };

      await crearCambio(datosCambio);
      await cargarDatos();
      handleCloseCambioPanel();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar el cambio de accesorio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditarCambio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const datosCambio = {
        id_equipo: cambioData.id_equipo,
        id_accesorio: parseInt(cambioData.id_accesorio),
        fecha_asignacion: cambioData.fecha_cambio,
        observaciones: cambioData.observaciones
      };

      await actualizarCambio(editingCambioId, datosCambio);
      await cargarDatos();
      handleCloseEditarCambioPanel();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el cambio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCambio = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cambio?')) {
      try {
        await eliminarCambio(id);
        await cargarDatos();
      } catch (err) {
        setError('Error al eliminar el cambio');
        console.error(err);
      }
    }
  };

  const toggleExpandir = (id) => {
    setExpandido(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleMenu = (id) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'ASIGNADO': 'bg-blue-100 text-blue-700',
      'DEVUELTO': 'bg-green-100 text-green-700'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  const getDiasColor = (dias) => {
    if (!dias && dias !== 0) return 'bg-gray-100 text-gray-500';
    if (dias > 365) return 'bg-red-100 text-red-700';
    if (dias > 180) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const asignacionesFiltradas = asignaciones.filter(asignacion =>
    asignacion.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.equipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.referencia_accesorio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.tipo_accesorio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gruposAgrupados = agruparPorResponsable(asignacionesFiltradas);

  const totalPages = Math.ceil(gruposAgrupados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = gruposAgrupados.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const equiposDisponibles = equipos.filter(e => e.estado === 'DISPONIBLE');

  const getImagenUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  // Componente de menú de 3 puntos
  const MenuTresPuntos = ({ asignacion, grupoId }) => {
    const menuId = `${grupoId}-${asignacion.id_asignacion}`;
    const isOpen = menuAbierto === menuId;

    return (
      <div className="relative menu-dropdown">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu(menuId);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Opciones"
        >
          <MoreVertical size={18} className="text-gray-600" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => handleOpenCambioPanel(asignacion)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-purple-600"
              disabled={asignacion.estado === 'DEVUELTO'}
            >
              <History size={16} />
              Cambiar Accesorio
            </button>
            <button
              onClick={() => toggleExpandir(asignacion.id_equipo)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-600"
            >
              {expandido[asignacion.id_equipo] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expandido[asignacion.id_equipo] ? 'Ocultar Historial' : 'Ver Historial'}
            </button>
            <button
              onClick={() => handleOpenPanel(asignacion.id_asignacion)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
            >
              <Edit size={16} />
              Editar Asignación
            </button>
            <button
              onClick={() => handleDelete(asignacion.id_asignacion)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-100"
            >
              <Trash2 size={16} />
              Eliminar Asignación
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asignaciones</h1>
              <p className="text-gray-500 text-sm mt-1">Gestión de asignaciones de equipos y accesorios</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleOpenPanel()}
                className="flex-1 sm:flex-none bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Nueva Asignación
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por responsable, equipo, área, cargo o accesorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>
          </div>

          {/* Selector de items por página */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Mostrar:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Contador de responsables con asignaciones */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Mostrando {currentItems.length} de {gruposAgrupados.length} responsables con asignaciones
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-12 w-12 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Cargando asignaciones...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Vista Desktop - Tabla Agrupada */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipos Asignados</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accesorios</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Equipos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No hay asignaciones registradas
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((grupo) => (
                        <React.Fragment key={grupo.id_responsable}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{grupo.responsable}</p>
                                <p className="text-xs text-gray-500">{grupo.cargo} - {grupo.area}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                {grupo.asignaciones.map((asig) => (
                                  <div key={asig.id_asignacion} className="flex items-center gap-2 text-sm flex-wrap">
                                    <span className="font-medium text-gray-800">{asig.equipo}</span>
                                    <span className="text-xs text-gray-400">|</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getEstadoColor(asig.estado)}`}>
                                      {asig.estado || 'ASIGNADO'}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getDiasColor(asig.dias_asignado)}`}>
                                      {asig.dias_asignado || 0}d
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(asig.fecha_asignacion).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                {grupo.asignaciones.map((asig) => (
                                  <div key={asig.id_asignacion} className="text-sm">
                                    {asig.tipo_accesorio ? (
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        {asig.tipo_accesorio}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400">Sin accesorio</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                {grupo.asignaciones.map((asig) => (
                                  <div key={asig.id_asignacion} className="text-sm">
                                    {asig.imagen_url ? (
                                      <img 
                                        src={getImagenUrl(asig.imagen_url)}
                                        alt="Evidencia" 
                                        className="w-10 h-10 object-cover rounded-lg cursor-pointer hover:opacity-80 transition border border-gray-200"
                                        onClick={() => window.open(getImagenUrl(asig.imagen_url), '_blank')}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          const parent = e.target.parentElement;
                                          const span = document.createElement('span');
                                          span.className = 'text-xs text-red-500';
                                          span.textContent = 'Error al cargar';
                                          parent.appendChild(span);
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-400">Sin imagen</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {grupo.asignaciones.length}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenPDF(grupo.id_responsable)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 hover:bg-red-700"
                                  title="Generar PDF de este responsable"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M12 4v16m8-8H4" />
                                  </svg>
                                  PDF
                                </button>
                                <button
                                  onClick={() => handleOpenPanelForResponsable(grupo.id_responsable)}
                                  className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 hover:bg-gray-800"
                                  title="Asignar otro equipo a este responsable"
                                >
                                  <UserPlus size={14} />
                                  Asignar
                                </button>
                                {/* Menú de 3 puntos para la primera asignación del grupo */}
                                {grupo.asignaciones.length > 0 && (
                                  <MenuTresPuntos 
                                    asignacion={grupo.asignaciones[0]} 
                                    grupoId={grupo.id_responsable}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                          {grupo.asignaciones.some(asig => expandido[asig.id_equipo]) && (
                            <tr>
                              <td colSpan="6" className="px-4 py-4 bg-gray-50">
                                <div className="space-y-3">
                                  {grupo.asignaciones.map((asig) => (
                                    expandido[asig.id_equipo] && (
                                      <div key={asig.id_asignacion} className="space-y-2">
                                        <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
                                          <Clock size={16} />
                                          Historial de cambios - {asig.equipo}
                                        </h4>
                                        {cambios[asig.id_equipo]?.length === 0 ? (
                                          <p className="text-sm text-gray-500">No hay cambios registrados</p>
                                        ) : (
                                          <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {cambios[asig.id_equipo]?.map((cambio) => (
                                              <div key={cambio.id_cambio} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                  <div className="flex-1 w-full">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                        {cambio.tipo_accesorio || 'Accesorio'}
                                                      </span>
                                                      <span className="text-gray-400">|</span>
                                                      <span className="text-gray-600 text-xs">
                                                        <span className="font-medium">Ref:</span> {cambio.referencia || 'N/A'}
                                                      </span>
                                                      {cambio.serial && (
                                                        <>
                                                          <span className="text-gray-400">|</span>
                                                          <span className="text-gray-600 text-xs">
                                                            <span className="font-medium">SN:</span> {cambio.serial}
                                                          </span>
                                                        </>
                                                      )}
                                                      {cambio.marca && (
                                                        <span className="text-gray-500 text-xs">
                                                          {cambio.marca}
                                                        </span>
                                                      )}
                                                    </div>
                                                    {cambio.observaciones && (
                                                      <p className="text-gray-500 text-xs mt-1">{cambio.observaciones}</p>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="flex items-center gap-2">
                                                      <p className="text-gray-500 text-xs">
                                                        {new Date(cambio.fecha_asignacion).toLocaleDateString()}
                                                      </p>
                                                      <span className={`text-xs font-medium ${getDiasColor(cambio.dias_con_accesorio)}`}>
                                                        {cambio.dias_con_accesorio || 0} días
                                                      </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                      <button
                                                        onClick={() => handleOpenEditarCambioPanel(cambio.id_cambio)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Editar cambio"
                                                      >
                                                        <Edit size={14} />
                                                      </button>
                                                      <button
                                                        onClick={() => handleDeleteCambio(cambio.id_cambio)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar cambio"
                                                      >
                                                        <Trash2 size={14} />
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vista Tablet - Agrupada */}
              <div className="hidden md:block lg:hidden overflow-x-auto">
                <table className="w-full min-w-[768px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                          No hay asignaciones registradas
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((grupo) => (
                        <tr key={grupo.id_responsable} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{grupo.responsable}</p>
                              <p className="text-xs text-gray-500">{grupo.cargo}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {grupo.asignaciones.map((asig) => (
                                <div key={asig.id_asignacion} className="text-sm flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{asig.equipo}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${getDiasColor(asig.dias_asignado)}`}>
                                    {asig.dias_asignado || 0}d
                                  </span>
                                  {asig.tipo_accesorio && (
                                    <span className="text-xs text-purple-600">{asig.tipo_accesorio}</span>
                                  )}
                                  {asig.imagen_url && (
                                    <img 
                                      src={getImagenUrl(asig.imagen_url)}
                                      alt="Evidencia" 
                                      className="w-6 h-6 object-cover rounded cursor-pointer"
                                      onClick={() => window.open(getImagenUrl(asig.imagen_url), '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2 items-center">
                              <button
                                onClick={() => handleOpenPDF(grupo.id_responsable)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 hover:bg-red-700 w-full"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M12 4v16m8-8H4" />
                                </svg>
                                PDF
                              </button>
                              <button
                                onClick={() => handleOpenPanelForResponsable(grupo.id_responsable)}
                                className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 hover:bg-gray-800 w-full"
                              >
                                <UserPlus size={14} />
                                Asignar
                              </button>
                              {grupo.asignaciones.length > 0 && (
                                <MenuTresPuntos 
                                  asignacion={grupo.asignaciones[0]} 
                                  grupoId={grupo.id_responsable}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile - Tarjetas */}
              <div className="md:hidden divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay asignaciones registradas
                  </div>
                ) : (
                  currentItems.map((grupo) => (
                    <div key={grupo.id_responsable} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm">{grupo.responsable}</span>
                            <span className="text-xs text-gray-500">{grupo.cargo}</span>
                          </div>
                          <p className="text-xs text-gray-500">{grupo.area}</p>
                          <div className="mt-2 space-y-1">
                            {grupo.asignaciones.map((asig) => (
                              <div key={asig.id_asignacion} className="text-sm bg-gray-50 p-2 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{asig.equipo}</span>
                                    {asig.imagen_url && (
                                      <img 
                                        src={getImagenUrl(asig.imagen_url)}
                                        alt="Evidencia" 
                                        className="w-6 h-6 object-cover rounded cursor-pointer"
                                        onClick={() => window.open(getImagenUrl(asig.imagen_url), '_blank')}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getEstadoColor(asig.estado)}`}>
                                      {asig.estado || 'ASIGNADO'}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getDiasColor(asig.dias_asignado)}`}>
                                      {asig.dias_asignado || 0}d
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500">
                                    {new Date(asig.fecha_asignacion).toLocaleDateString()}
                                  </span>
                                  {asig.tipo_accesorio && (
                                    <span className="text-xs text-purple-600">
                                      🖱 {asig.tipo_accesorio}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Total: {grupo.asignaciones.length} equipos
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          <button
                            onClick={() => handleOpenPDF(grupo.id_responsable)}
                            className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 hover:bg-red-700"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M12 4v16m8-8H4" />
                            </svg>
                            PDF
                          </button>
                          <button
                            onClick={() => handleOpenPanelForResponsable(grupo.id_responsable)}
                            className="px-2 py-1 bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 hover:bg-gray-800"
                          >
                            <UserPlus size={12} />
                            <span className="hidden xs:inline">Asignar</span>
                          </button>
                          {grupo.asignaciones.length > 0 && (
                            <MenuTresPuntos 
                              asignacion={grupo.asignaciones[0]} 
                              grupoId={grupo.id_responsable}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Paginación */}
              {gruposAgrupados.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                  <span className="text-sm text-gray-600">
                    Mostrando {currentItems.length} de {gruposAgrupados.length} responsables
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Anterior
                    </button>

                    {totalPages <= 3 ? (
                      Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-10 h-10 rounded-lg transition ${
                            currentPage === i + 1
                              ? 'bg-black text-white'
                              : 'border hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))
                    ) : (
                      <>
                        {[1, 2, 3].map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`w-10 h-10 rounded-lg transition ${
                              currentPage === page
                                ? 'bg-black text-white'
                                : 'border hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <span className="px-2 text-gray-500">...</span>

                        <button
                          onClick={() => paginate(totalPages)}
                          className={`w-10 h-10 rounded-lg transition ${
                            currentPage === totalPages
                              ? 'bg-black text-white'
                              : 'border hover:bg-gray-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* RENDER DEL PDF */}
      {/* ============================================ */}
      {showPDF && (
        <PDFAsignaciones
          asignaciones={pdfData.asignaciones}
          responsable={pdfData.responsable}
          imagenBase64={pdfData.imagenBase64}
          onClose={() => setShowPDF(false)}
        />
      )}

      {/* Overlay */}
      {(showPanel || showCambioPanel || showEditarCambioPanel) && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={() => {
            if (showPanel) handleClosePanel();
            if (showCambioPanel) handleCloseCambioPanel();
            if (showEditarCambioPanel) handleCloseEditarCambioPanel();
          }}
        />
      )}

      {/* Panel Crear/Editar Asignación */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${showPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Asignación' : selectedResponsableForNewEquipo ? 'Asignar Nuevo Equipo' : 'Nueva Asignación'}
            </h2>
            <button
              onClick={handleClosePanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedResponsableForNewEquipo && (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  Asignando equipo a: <span className="font-semibold">
                    {responsables.find(r => r.id_responsable === selectedResponsableForNewEquipo)?.nombre}
                  </span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Este responsable ya tiene equipos asignados. Puedes agregar uno más.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable *
                </label>
                <select
                  name="id_responsable"
                  value={formData.id_responsable}
                  onChange={handleChange}
                  required
                  disabled={!!selectedResponsableForNewEquipo}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar responsable</option>
                  {responsables.map((resp) => (
                    <option key={resp.id_responsable} value={resp.id_responsable}>
                      {resp.nombre} - {resp.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipo *
                </label>
                <select
                  name="id_equipo"
                  value={formData.id_equipo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                >
                  <option value="">Seleccionar equipo</option>
                  {editingId ? (
                    equipos.map((eq) => (
                      <option key={eq.id_equipo} value={eq.id_equipo}>
                        {eq.equipo} - {eq.marca} {eq.modelo} ({eq.estado})
                      </option>
                    ))
                  ) : (
                    equiposDisponibles.map((eq) => (
                      <option key={eq.id_equipo} value={eq.id_equipo}>
                        {eq.equipo} - {eq.marca} {eq.modelo}
                      </option>
                    ))
                  )}
                </select>
                {!editingId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Solo se muestran equipos disponibles
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Asignación *
                </label>
                <input
                  type="date"
                  name="fecha_asignacion"
                  value={formData.fecha_asignacion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Observaciones de la asignación..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                />
              </div>

              {/* Campo de Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen de Evidencia
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                />
                
                {imagenActual && !eliminarImagenExistente && !imagenPreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Imagen actual:</p>
                    <div className="relative inline-block">
                      <img 
                        src={getImagenUrl(imagenActual)}
                        alt="Imagen actual" 
                        className="max-h-32 rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleEliminarImagen}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                        title="Eliminar imagen"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {imagenPreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Nueva imagen:</p>
                    <img 
                      src={imagenPreview} 
                      alt="Vista previa" 
                      className="max-h-32 rounded-lg border border-gray-200"
                    />
                    {imagenFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        {imagenFile.name} ({(imagenFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                )}

                {eliminarImagenExistente && imagenActual && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">
                      La imagen actual será eliminada
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Panel Registrar Cambio de Accesorio */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${showCambioPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Asignar Accesorio
            </h2>
            <button
              onClick={handleCloseCambioPanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmitCambio} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Equipo:</span> {selectedAsignacion?.equipo}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Responsable:</span> {selectedAsignacion?.responsable}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Accesorio actual:</span> {selectedAsignacion?.referencia_accesorio || 'Sin accesorio'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Accesorio *
                </label>
                <select
                  name="id_accesorio"
                  value={cambioData.id_accesorio}
                  onChange={handleCambioChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                >
                  <option value="">Seleccionar accesorio</option>
                  {accesoriosLista.map((accesorio) => (
                    <option key={accesorio.id_accesorio} value={accesorio.id_accesorio}>
                      {accesorio.tipo_accesorio} - {accesorio.marca} - {accesorio.referencia} {accesorio.serial ? `(SN: ${accesorio.serial})` : ''}
                    </option>
                  ))}
                </select>
                {accesoriosLista.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ No hay accesorios disponibles. Crea uno en la sección "Accesorios"
                  </p>
                )}
              </div>

              {cambioData.id_accesorio && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Accesorio seleccionado:</p>
                  {(() => {
                    const acc = accesoriosLista.find(a => a.id_accesorio === parseInt(cambioData.id_accesorio));
                    return acc ? (
                      <div className="text-sm text-blue-700 mt-1 space-y-0.5">
                        <p><span className="font-medium">Tipo:</span> {acc.tipo_accesorio}</p>
                        <p><span className="font-medium">Marca:</span> {acc.marca}</p>
                        <p><span className="font-medium">Referencia:</span> {acc.referencia}</p>
                        {acc.serial && <p><span className="font-medium">Serial:</span> {acc.serial}</p>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Cambio *
                </label>
                <input
                  type="date"
                  name="fecha_cambio"
                  value={cambioData.fecha_cambio}
                  onChange={handleCambioChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={cambioData.observaciones}
                  onChange={handleCambioChange}
                  rows="3"
                  placeholder="Motivo del cambio, estado del accesorio anterior, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Asignar Accesorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Panel Editar Cambio de Accesorio */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${showEditarCambioPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Editar Asignación de Accesorio
            </h2>
            <button
              onClick={handleCloseEditarCambioPanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmitEditarCambio} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Accesorio *
                </label>
                <select
                  name="id_accesorio"
                  value={cambioData.id_accesorio}
                  onChange={handleCambioChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                >
                  <option value="">Seleccionar accesorio</option>
                  {accesoriosLista.map((accesorio) => (
                    <option key={accesorio.id_accesorio} value={accesorio.id_accesorio}>
                      {accesorio.tipo_accesorio} - {accesorio.marca} - {accesorio.referencia} {accesorio.serial ? `(SN: ${accesorio.serial})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {cambioData.id_accesorio && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Accesorio seleccionado:</p>
                  {(() => {
                    const acc = accesoriosLista.find(a => a.id_accesorio === parseInt(cambioData.id_accesorio));
                    return acc ? (
                      <div className="text-sm text-blue-700 mt-1 space-y-0.5">
                        <p><span className="font-medium">Tipo:</span> {acc.tipo_accesorio}</p>
                        <p><span className="font-medium">Marca:</span> {acc.marca}</p>
                        <p><span className="font-medium">Referencia:</span> {acc.referencia}</p>
                        {acc.serial && <p><span className="font-medium">Serial:</span> {acc.serial}</p>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Cambio *
                </label>
                <input
                  type="date"
                  name="fecha_cambio"
                  value={cambioData.fecha_cambio}
                  onChange={handleCambioChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={cambioData.observaciones}
                  onChange={handleCambioChange}
                  rows="3"
                  placeholder="Motivo del cambio, estado del accesorio anterior, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Asignaciones;