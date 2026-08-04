import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, RefreshCw, Clock } from 'lucide-react';
import { 
  listarAccesorios, 
  crearAccesorio, 
  actualizarAccesorio, 
  eliminarAccesorio, 
  obtenerAccesorio 
} from '../Api/accesorios/accesorios';

const Accesorios = () => {
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showEditarPanel, setShowEditarPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [formData, setFormData] = useState({
    tipo_accesorio: '',
    marca: '',
    referencia: '',
    serial: '',
    observaciones: '',
    fecha_creacion: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (showPanel || showEditarPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPanel, showEditarPanel]);

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await listarAccesorios();
      setAccesorios(data);
    } catch (err) {
      setError('Error al cargar los accesorios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPanel = () => {
    setEditingId(null);
    setFormData({
      tipo_accesorio: '',
      marca: '',
      referencia: '',
      serial: '',
      observaciones: '',
      fecha_creacion: new Date().toISOString().split('T')[0]
    });
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setFormData({
      tipo_accesorio: '',
      marca: '',
      referencia: '',
      serial: '',
      observaciones: '',
      fecha_creacion: ''
    });
  };

  const handleOpenEditarPanel = async (id) => {
    try {
      const data = await obtenerAccesorio(id);
      setEditingId(id);
      setFormData({
        tipo_accesorio: data.tipo_accesorio || '',
        marca: data.marca || '',
        referencia: data.referencia || '',
        serial: data.serial || '',
        observaciones: data.observaciones || '',
        fecha_creacion: data.fecha_creacion_formateada || '',
        estado: data.estado || 'DISPONIBLE'
      });
      setShowEditarPanel(true);
    } catch (err) {
      setError('Error al cargar el accesorio');
      console.error(err);
    }
  };

  const handleCloseEditarPanel = () => {
    setShowEditarPanel(false);
    setEditingId(null);
    setFormData({
      tipo_accesorio: '',
      marca: '',
      referencia: '',
      serial: '',
      observaciones: '',
      fecha_creacion: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearAccesorio(formData);
      await cargarDatos();
      handleClosePanel();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el accesorio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actualizarAccesorio(editingId, formData);
      await cargarDatos();
      handleCloseEditarPanel();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el accesorio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este accesorio?')) {
      try {
        await eliminarAccesorio(id);
        await cargarDatos();
      } catch (err) {
        setError(err.response?.data?.mensaje || 'Error al eliminar el accesorio');
        console.error(err);
      }
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'DISPONIBLE': 'bg-green-100 text-green-700',
      'ASIGNADO': 'bg-blue-100 text-blue-700'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  const getTipoColor = (tipo) => {
    const colores = {
      'MOUSE': 'bg-purple-100 text-purple-700',
      'TECLADO': 'bg-indigo-100 text-indigo-700',
      'MONITOR': 'bg-blue-100 text-blue-700',
      'DIADEMA': 'bg-pink-100 text-pink-700',
      'BASE REFRIGERANTE': 'bg-cyan-100 text-cyan-700',
      'CARGADOR': 'bg-orange-100 text-orange-700',
      'ADAPTADOR': 'bg-yellow-100 text-yellow-700',
      'BATERÍA': 'bg-red-100 text-red-700',
      'CABLE': 'bg-green-100 text-green-700',
    };
    return colores[tipo] || 'bg-gray-100 text-gray-700';
  };

  const getDiasColor = (dias) => {
    if (dias === null || dias === undefined) return 'bg-gray-100 text-gray-500';
    if (dias === 0) return 'bg-green-100 text-green-700';
    if (dias > 365) return 'bg-red-100 text-red-700';
    if (dias > 180) return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Filtrar accesorios
  const accesoriosFiltrados = accesorios.filter(accesorio =>
    accesorio.tipo_accesorio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accesorio.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accesorio.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accesorio.serial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const totalPages = Math.ceil(accesoriosFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = accesoriosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accesorios</h1>
              <p className="text-gray-500 text-sm mt-1">Gestión de inventario de accesorios</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cargarDatos}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
              <button
                onClick={handleOpenPanel}
                className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Nuevo Accesorio
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por tipo, marca, referencia o serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>
          </div>

          {/* Contador y selector de items por página - ENTRE BUSCADOR Y TABLA */}
          {!loading && accesoriosFiltrados.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-1">
              <span className="text-sm text-gray-600">
                Mostrando {currentItems.length} de {accesoriosFiltrados.length} accesorios
              </span>
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
          )}

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
                <p className="text-gray-600">Cargando accesorios...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            No hay accesorios registrados
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((accesorio) => (
                          <tr key={accesorio.id_accesorio} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 font-mono">{accesorio.id_accesorio}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(accesorio.tipo_accesorio)}`}>
                                {accesorio.tipo_accesorio}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{accesorio.marca}</td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-900">{accesorio.referencia}</td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{accesorio.serial || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(accesorio.estado)}`}>
                                {accesorio.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-1 justify-center">
                                <button
                                  onClick={() => handleOpenEditarPanel(accesorio.id_accesorio)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar accesorio"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(accesorio.id_accesorio)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar accesorio"
                                  disabled={accesorio.estado === 'ASIGNADO'}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación - SOLO BOTONES DE NAVEGACIÓN ABAJO */}
              {accesoriosFiltrados.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 mt-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
                    >
                      Anterior
                    </button>

                    {totalPages <= 3 ? (
                      Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-10 h-10 rounded-lg transition text-sm ${
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
                            className={`w-10 h-10 rounded-lg transition text-sm ${
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
                          className={`w-10 h-10 rounded-lg transition text-sm ${
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
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Overlay - z-index mayor que el sidebar pero menor que el panel */}
      {(showPanel || showEditarPanel) && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={() => {
            if (showPanel) handleClosePanel();
            if (showEditarPanel) handleCloseEditarPanel();
          }}
        />
      )}

      {/* Panel Crear Accesorio - z-index mayor que el overlay */}
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
              Nuevo Accesorio
            </h2>
            <button
              onClick={handleClosePanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Accesorio *
                </label>
                <input
                  type="text"
                  name="tipo_accesorio"
                  value={formData.tipo_accesorio}
                  onChange={handleChange}
                  required
                  placeholder="Ej: BATERÍA, CARGADOR, MOUSE..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Logitech, HP, Dell..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia *
                </label>
                <input
                  type="text"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  required
                  placeholder="Ej: MX-MASTER-3, KB-216"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial (opcional)
                </label>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  placeholder="Ej: SN-123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Creación *
                </label>
                <input
                  type="date"
                  name="fecha_creacion"
                  value={formData.fecha_creacion}
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
                  placeholder="Observaciones del accesorio..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Crear Accesorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Panel Editar Accesorio - z-index mayor que el overlay */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${showEditarPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Editar Accesorio
            </h2>
            <button
              onClick={handleCloseEditarPanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmitEditar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Accesorio *
                </label>
                <input
                  type="text"
                  name="tipo_accesorio"
                  value={formData.tipo_accesorio}
                  onChange={handleChange}
                  required
                  placeholder="Ej: BATERÍA, CARGADOR, MOUSE..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Logitech, HP, Dell..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia *
                </label>
                <input
                  type="text"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  required
                  placeholder="Ej: MX-MASTER-3, KB-216"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial (opcional)
                </label>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  placeholder="Ej: SN-123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado || 'DISPONIBLE'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="ASIGNADO">Asignado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Creación *
                </label>
                <input
                  type="date"
                  name="fecha_creacion"
                  value={formData.fecha_creacion}
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
                  placeholder="Observaciones del accesorio..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Accesorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Accesorios;