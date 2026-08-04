import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { listarResponsables, obtenerResponsable, crearResponsable, actualizarResponsable, eliminarResponsable } from '../Api/Responsables/apiResponsables';

const Responsables = () => {
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    nombre: '',
    area: '',
    cargo: '',
    punto: ''
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    cargarResponsables();
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

  const cargarResponsables = async () => {
    setLoading(true);
    try {
      const data = await listarResponsables();
      setResponsables(data);
      setError('');
    } catch (err) {
      setError('Error al cargar los responsables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPanel = (id = null) => {
    if (id) {
      setEditingId(id);
      cargarResponsable(id);
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        area: '',
        cargo: '',
        punto: ''
      });
    }
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      area: '',
      cargo: '',
      punto: ''
    });
  };

  const cargarResponsable = async (id) => {
    try {
      const data = await obtenerResponsable(id);
      setFormData({
        nombre: data.nombre || '',
        area: data.area || '',
        cargo: data.cargo || '',
        punto: data.punto || ''
      });
    } catch (err) {
      setError('Error al cargar el responsable');
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
    try {
      if (editingId) {
        await actualizarResponsable(editingId, formData);
      } else {
        await crearResponsable(formData);
      }
      await cargarResponsables();
      handleClosePanel();
    } catch (err) {
      setError('Error al guardar el responsable');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este responsable?')) {
      try {
        await eliminarResponsable(id);
        await cargarResponsables();
      } catch (err) {
        setError('Error al eliminar el responsable');
        console.error(err);
      }
    }
  };

  const responsablesFiltrados = responsables.filter(responsable =>
    responsable.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    responsable.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    responsable.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    responsable.punto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(responsablesFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const responsablesPaginados = responsablesFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <>
     
      <div className="min-h-screen bg-gray-50 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Responsables</h1>
              <p className="text-gray-500 text-sm mt-1">Gestión de responsables</p>
            </div>
            <button
              onClick={() => handleOpenPanel()}
              className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Crear Responsable
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar responsables por nombre, área, cargo o punto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
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
                <p className="text-gray-600">Cargando responsables...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punto</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {responsablesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No hay responsables registrados
                        </td>
                      </tr>
                    ) : (
                      responsablesPaginados.map((responsable) => (
                        <tr key={responsable.id_responsable} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono">{responsable.id_responsable}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{responsable.nombre}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{responsable.area || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{responsable.cargo || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{responsable.punto || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                onClick={() => handleOpenPanel(responsable.id_responsable)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar responsable"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(responsable.id_responsable)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar responsable"
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
                <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                  <span className="text-sm text-gray-600">
                    Mostrando {responsablesPaginados.length} de {responsablesFiltrados.length} registros
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Anterior
                    </button>

                    {totalPages <= 3 ? (
                      Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
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
                            onClick={() => setCurrentPage(page)}
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
                          onClick={() => setCurrentPage(totalPages)}
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
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      {showPanel && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={handleClosePanel}
        />
      )}

     
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
              {editingId ? 'Editar Responsable' : 'Crear Responsable'}
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
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Ej: Tecnología"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  placeholder="Ej: Gerente"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punto
                </label>
                <input
                  type="text"
                  name="punto"
                  value={formData.punto}
                  onChange={handleChange}
                  placeholder="Ej: Punto 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Responsables;