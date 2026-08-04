import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { 
    listarPerfiles, 
    obtenerPerfil, 
    crearPerfil, 
    actualizarPerfil, 
    eliminarPerfil 
} from '../Api/perfiles/apiPerfiles';

const Perfiles = () => {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [expandido, setExpandido] = useState({});
    const [formData, setFormData] = useState({
        nombre: '',
        punto: '',
        cargo: '',
        area: '',
        perfil: '',
        funcionalidad: ''
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        cargarPerfiles();
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

    const cargarPerfiles = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await listarPerfiles();
            setPerfiles(data);
        } catch (err) {
            setError('Error al cargar los perfiles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPanel = (id = null) => {
        if (id) {
            setEditingId(id);
            cargarPerfil(id);
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                punto: '',
                cargo: '',
                area: '',
                perfil: '',
                funcionalidad: ''
            });
        }
        setShowPanel(true);
    };

    const handleClosePanel = () => {
        setShowPanel(false);
        setEditingId(null);
        setFormData({
            nombre: '',
            punto: '',
            cargo: '',
            area: '',
            perfil: '',
            funcionalidad: ''
        });
    };

    const cargarPerfil = async (id) => {
        try {
            const data = await obtenerPerfil(id);
            setFormData({
                nombre: data.nombre || '',
                punto: data.punto || '',
                cargo: data.cargo || '',
                area: data.area || '',
                perfil: data.perfil || '',
                funcionalidad: data.funcionalidad || ''
            });
        } catch (err) {
            setError('Error al cargar el perfil');
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
                await actualizarPerfil(editingId, formData);
            } else {
                await crearPerfil(formData);
            }
            await cargarPerfiles();
            handleClosePanel();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al guardar el perfil');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este perfil?')) {
            try {
                await eliminarPerfil(id);
                await cargarPerfiles();
            } catch (err) {
                setError('Error al eliminar el perfil');
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

    // Función para formatear las funcionalidades
    const renderFuncionalidades = (funcionalidad) => {
        if (!funcionalidad) return <span className="text-gray-400 text-sm">Sin funcionalidades</span>;
        
        // Si es un string con saltos de línea, separar por \n
        const funcs = funcionalidad.split('\n').filter(f => f.trim());
        
        if (funcs.length === 0) {
            return <span className="text-gray-400 text-sm">Sin funcionalidades</span>;
        }

        if (funcs.length <= 2) {
            // Mostrar todas si son 2 o menos
            return (
                <div className="space-y-0.5">
                    {funcs.map((f, index) => (
                        <span key={index} className="block text-xs text-gray-700">
                            • {f.trim()}
                        </span>
                    ))}
                </div>
            );
        }

        // Mostrar las primeras 2 y un indicador de más
        return (
            <div>
                <div className="space-y-0.5">
                    {funcs.slice(0, 2).map((f, index) => (
                        <span key={index} className="block text-xs text-gray-700">
                            • {f.trim()}
                        </span>
                    ))}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandir(perfil.id);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 flex items-center gap-1"
                >
                    {expandido[perfil.id] ? (
                        <>Ver menos <ChevronUp size={14} /></>
                    ) : (
                        <>Ver {funcs.length - 2} más <ChevronDown size={14} /></>
                    )}
                </button>
            </div>
        );
    };

    const perfilesFiltrados = perfiles.filter(perfil =>
        perfil.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.punto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.perfil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.funcionalidad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(perfilesFiltrados.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const perfilesPaginados = perfilesFiltrados.slice(indexOfFirstItem, indexOfLastItem);

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
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Perfiles y Funcionalidades</h1>
                            <p className="text-gray-500 text-sm mt-1">Gestión de perfiles y funcionalidades</p>
                        </div>
                        <button
                            onClick={() => handleOpenPanel()}
                            className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <Plus size={20} />
                            Crear Perfil
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, punto, cargo, área, perfil o funcionalidad..."
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
                                <p className="text-gray-600">Cargando perfiles...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Funcionalidades</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {perfilesFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                    No hay perfiles registrados
                                                </td>
                                            </tr>
                                        ) : (
                                            perfilesPaginados.map((perfil) => {
                                                const funcionalidades = perfil.funcionalidad ? perfil.funcionalidad.split('\n').filter(f => f.trim()) : [];
                                                const isExpanded = expandido[perfil.id];
                                                const showAll = funcionalidades.length <= 2 || isExpanded;
                                                const funcsToShow = showAll ? funcionalidades : funcionalidades.slice(0, 2);
                                                const hasMore = funcionalidades.length > 2;

                                                return (
                                                    <tr key={perfil.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{perfil.id}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{perfil.nombre}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{perfil.punto || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{perfil.cargo || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{perfil.area || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                                {perfil.perfil || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {funcionalidades.length === 0 ? (
                                                                <span className="text-gray-400 text-xs">Sin funcionalidades</span>
                                                            ) : (
                                                                <div>
                                                                    <div className="space-y-0.5">
                                                                        {funcsToShow.map((f, index) => (
                                                                            <span key={index} className="block text-xs text-gray-700">
                                                                                • {f.trim()}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    {hasMore && (
                                                                        <button
                                                                            onClick={() => toggleExpandir(perfil.id)}
                                                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 flex items-center gap-1"
                                                                        >
                                                                            {isExpanded ? (
                                                                                <>Ver menos <ChevronUp size={14} /></>
                                                                            ) : (
                                                                                <>Ver {funcionalidades.length - 2} más <ChevronDown size={14} /></>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex items-center gap-2 justify-center">
                                                                <button
                                                                    onClick={() => handleOpenPanel(perfil.id)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar perfil"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(perfil.id)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Eliminar perfil"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>

                                {/* Paginación */}
                                {perfilesFiltrados.length > 0 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                                        <span className="text-sm text-gray-600">
                                            Mostrando {perfilesPaginados.length} de {perfilesFiltrados.length} registros
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
                                )}
                            </div>
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

            {/* Panel Crear/Editar Perfil */}
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
                            {editingId ? 'Editar Perfil' : 'Crear Perfil'}
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
                                    Perfil
                                </label>
                                <input
                                    type="text"
                                    name="perfil"
                                    value={formData.perfil}
                                    onChange={handleChange}
                                    placeholder="Ej: Administrador"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Funcionalidades
                                </label>
                                <textarea
                                    name="funcionalidad"
                                    value={formData.funcionalidad}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Escribe cada funcionalidad en una línea nueva&#10;Ejemplo:&#10;Gestión de usuarios&#10;Creación de reportes&#10;Administración de perfiles&#10;Gestión de inventario"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    💡 Escribe cada funcionalidad en una línea diferente (presiona Enter para nueva línea)
                                </p>
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

export default Perfiles;