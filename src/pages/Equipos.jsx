import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { listarEquipos, obtenerEquipo, crearEquipo, actualizarEquipo, eliminarEquipo } from '../Api/Equipos/apiEquipos';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    equipo: '',
    marca: '',
    modelo: '',
    serial: '',
    estado: 'DISPONIBLE'
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    cargarEquipos();
  }, []);

  useEffect(() => {
    if (showPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPanel]);

  const cargarEquipos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarEquipos();
      setEquipos(data);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPanel = (id = null) => {
    if (id) {
      setEditingId(id);
      cargarEquipo(id);
    } else {
      setEditingId(null);
      setFormData({
        equipo: '',
        marca: '',
        modelo: '',
        serial: '',
        estado: 'DISPONIBLE'
      });
    }
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setEditingId(null);
    setFormData({
      equipo: '',
      marca: '',
      modelo: '',
      serial: '',
      estado: 'DISPONIBLE'
    });
  };

  const cargarEquipo = async (id) => {
    try {
      const data = await obtenerEquipo(id);
      setFormData({
        equipo: data.equipo || '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        serial: data.serial || '',
        estado: data.estado || 'DISPONIBLE'
      });
    } catch (err) {
      setError('Error al cargar el equipo');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await actualizarEquipo(editingId, formData);
      } else {
        await crearEquipo(formData);
      }
      await cargarEquipos();
      handleClosePanel();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el equipo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await eliminarEquipo(id);
        await cargarEquipos();
      } catch (err) {
        setError('Error al eliminar el equipo');
        console.error(err);
      }
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'DISPONIBLE': 'bg-green-100 text-green-700',
      'ASIGNADO': 'bg-blue-100 text-blue-700',
      'MANTENIMIENTO': 'bg-yellow-100 text-yellow-700',
      'BAJA': 'bg-red-100 text-red-700'
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  const equiposFiltrados = equipos.filter(equipo =>
    equipo.equipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.serial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(equiposFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const equiposPaginados = equiposFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header - Adaptado para móvil */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Equipos</h1>
              <p className="text-gray-500 text-sm mt-1">Gestión de equipos</p>
            </div>
            <button
              onClick={() => handleOpenPanel()}
              className="w-full sm:w-auto bg-black text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Plus size={20} />
              Crear Equipo
            </button>
          </div>

          {/* Search - Adaptado para móvil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Selector de items por página - Adaptado para móvil */}
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
                <p className="text-gray-600">Cargando equipos...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Vista de escritorio - Tabla completa */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {equiposFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No hay equipos registrados
                        </td>
                      </tr>
                    ) : (
                      equiposPaginados.map((equipo) => (
                        <tr key={equipo.id_equipo} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono">{equipo.id_equipo}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{equipo.equipo}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{equipo.marca || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{equipo.modelo}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">{equipo.serial || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(equipo.estado)}`}>
                              {equipo.estado || 'DISPONIBLE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                onClick={() => handleOpenPanel(equipo.id_equipo)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar equipo"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(equipo.id_equipo)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar equipo"
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

              {/* Vista móvil - Tarjetas */}
              <div className="md:hidden">
                {equiposFiltrados.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hay equipos registrados
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {equiposPaginados.map((equipo) => (
                      <div key={equipo.id_equipo} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{equipo.equipo}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-mono">ID: {equipo.id_equipo}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(equipo.estado)}`}>
                                {equipo.estado || 'DISPONIBLE'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleOpenPanel(equipo.id_equipo)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar equipo"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(equipo.id_equipo)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar equipo"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Marca:</span>
                            <span className="ml-1 text-gray-900">{equipo.marca || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Modelo:</span>
                            <span className="ml-1 text-gray-900">{equipo.modelo}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Serial:</span>
                            <span className="ml-1 font-mono text-gray-900">{equipo.serial || '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Paginación - Adaptada para móvil */}
              {equiposFiltrados.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-white">
                  <span className="text-sm text-gray-600 order-2 sm:order-1">
                    Mostrando {equiposPaginados.length} de {equiposFiltrados.length} registros
                  </span>

                  <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm flex items-center gap-1"
                    >
                      <ChevronLeft size={16} className="sm:hidden" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {totalPages <= 3 ? (
                        Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
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
                          {currentPage <= 2 ? (
                            <>
                              {[1, 2, 3].map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                                    currentPage === page
                                      ? 'bg-black text-white'
                                      : 'border hover:bg-gray-100'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                              <span className="px-1 text-gray-500">...</span>
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                                  currentPage === totalPages
                                    ? 'bg-black text-white'
                                    : 'border hover:bg-gray-100'
                                }`}
                              >
                                {totalPages}
                              </button>
                            </>
                          ) : currentPage >= totalPages - 1 ? (
                            <>
                              <button
                                onClick={() => setCurrentPage(1)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                                  currentPage === 1
                                    ? 'bg-black text-white'
                                    : 'border hover:bg-gray-100'
                                }`}
                              >
                                1
                              </button>
                              <span className="px-1 text-gray-500">...</span>
                              {[totalPages - 2, totalPages - 1, totalPages].map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                                    currentPage === page
                                      ? 'bg-black text-white'
                                      : 'border hover:bg-gray-100'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setCurrentPage(1)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                                  currentPage === 1
                                    ? 'bg-black text-white'
                                    : 'border hover:bg-gray-100'
                                }`}
                              >
                                1
                              </button>
                              <span className="px-1 text-gray-500">...</span>
                              <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border hover:bg-gray-100 transition text-sm"
                              >
                                {currentPage - 1}
                              </button>
                              <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black text-white transition text-sm">
                                {currentPage}
                              </button>
                              <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border hover:bg-gray-100 transition text-sm"
                              >
                                {currentPage + 1}
                              </button>
                              <span className="px-1 text-gray-500">...</span>
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                                  currentPage === totalPages
                                    ? 'bg-black text-white'
                                    : 'border hover:bg-gray-100'
                                }`}
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight size={16} className="sm:hidden" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {showPanel && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={handleClosePanel}
        />
      )}

      {/* Panel Crear/Editar Equipo - Adaptado para móvil */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${showPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Equipo' : 'Crear Equipo'}
            </h2>
            <button
              onClick={handleClosePanel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  name="equipo"
                  value={formData.equipo}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Laptop Dell XPS"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ej: Dell, HP, Lenovo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                  placeholder="Ej: XPS 13, EliteBook 840"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial
                </label>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  placeholder="Ej: SN123456789"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-sm sm:text-base"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Equipos;