import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Package, List, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { 
    listarInsumos, 
    obtenerInsumo, 
    crearInsumo, 
    actualizarInsumo, 
    eliminarInsumo,
    obtenerInventario 
} from '../Api/Insumos/Insumos';

const Insumos = () => {

    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('lista'); // 'lista' o 'inventario'

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [inventario, setInventario] = useState([]);
    const [loadingInventario, setLoadingInventario] = useState(false);
    const [searchInventario, setSearchInventario] = useState('');
    const [resumen, setResumen] = useState({
        totalItems: 0,
        totalDisponibles: 0,
        totalAgotados: 0
    });

    const [formData, setFormData] = useState({
        tipo: '',
        marca: '',
        referencia: '',
        serial: '',
        usado: 'NO',
        estado: 'DISPONIBLE',
        observaciones: ''
    });

    // Cargar datos según la pestaña activa
    useEffect(() => {
        if (activeTab === 'lista') {
            cargarInsumos();
        } else {
            cargarInventario();
        }
    }, [activeTab]);

    // Resetear página al buscar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Bloquear scroll cuando el panel está abierto
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

    // === FUNCIONES PARA INSUMOS ===
    const cargarInsumos = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await listarInsumos();
            setInsumos(data);
        } catch (err) {
            setError('Error al cargar los insumos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // === FUNCIONES PARA INVENTARIO ===
    const cargarInventario = async () => {
        setLoadingInventario(true);
        setError('');
        try {
            const data = await obtenerInventario();
            setInventario(data);
            
            // Calcular resumen
            let totalItems = 0;
            let totalDisponibles = 0;
            let totalAgotados = 0;
            
            data.forEach(item => {
                totalItems += parseInt(item.total) || 0;
                totalDisponibles += parseInt(item.disponibles) || 0;
                totalAgotados += parseInt(item.agotados) || 0;
            });
            
            setResumen({
                totalItems,
                totalDisponibles,
                totalAgotados
            });
        } catch (err) {
            setError('Error al cargar el inventario');
            console.error(err);
        } finally {
            setLoadingInventario(false);
        }
    };

    // === FUNCIONES DEL FORMULARIO ===
    const handleOpenPanel = (id = null) => {
        if (id) {
            setEditingId(id);
            cargarInsumoParaEditar(id);
        } else {
            setEditingId(null);
            setFormData({
                tipo: '',
                marca: '',
                referencia: '',
                serial: '',
                usado: 'NO',
                estado: 'DISPONIBLE',
                observaciones: ''
            });
        }
        setShowPanel(true);
    };

    const handleClosePanel = () => {
        setShowPanel(false);
        setEditingId(null);
        setFormData({
            tipo: '',
            marca: '',
            referencia: '',
            serial: '',
            usado: 'NO',
            estado: 'DISPONIBLE',
            observaciones: ''
        });
    };

    const cargarInsumoParaEditar = async (id) => {
        try {
            const data = await obtenerInsumo(id);
            setFormData({
                tipo: data.tipo || '',
                marca: data.marca || '',
                referencia: data.referencia || '',
                serial: data.serial || '',
                usado: data.usado || 'NO',
                estado: data.estado || 'DISPONIBLE',
                observaciones: data.observaciones || ''
            });
        } catch (err) {
            setError('Error al cargar el insumo');
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
                await actualizarInsumo(editingId, formData);
            } else {
                await crearInsumo(formData);
            }
            await cargarInsumos();
            handleClosePanel();
        } catch (err) {
            setError('Error al guardar el insumo');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este insumo?')) {
            try {
                await eliminarInsumo(id);
                await cargarInsumos();
            } catch (err) {
                setError('Error al eliminar el insumo');
                console.error(err);
            }
        }
    };

    // === FUNCIONES DE UTILERÍA ===
    const getCantidadStatus = (estado) => {
        if (estado === 'AGOTADO') return 'bg-red-100 text-red-700';
        if (estado === 'DISPONIBLE') return 'bg-green-100 text-green-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const getBarColor = (disponibles, total) => {
        if (total === 0) return 'bg-gray-300';
        const porcentaje = (disponibles / total) * 100;
        if (porcentaje === 0) return 'bg-red-500';
        if (porcentaje < 30) return 'bg-yellow-500';
        if (porcentaje < 70) return 'bg-blue-500';
        return 'bg-green-500';
    };

    // Función de paginación
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // === FILTRADO Y PAGINACIÓN DE DATOS ===
    const insumosFiltrados = insumos.filter(insumo =>
        insumo.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.serial?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lógica de paginación para insumos
    const totalPages = Math.ceil(insumosFiltrados.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = insumosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

    const inventarioFiltrado = inventario.filter(item =>
        item.tipo?.toLowerCase().includes(searchInventario.toLowerCase()) ||
        item.marca?.toLowerCase().includes(searchInventario.toLowerCase()) ||
        item.referencia?.toLowerCase().includes(searchInventario.toLowerCase())
    );

    // === RENDERIZADO DE LISTA ===
    const renderLista = () => (
        <>
            {/* Buscador */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar insumos por tipo, marca, referencia o serial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                    />
                </div>
            </div>

            {/* Contador y selector de items por página - ENTRE BUSCADOR Y TABLA */}
            {!loading && insumosFiltrados.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-1">
                    <span className="text-sm text-gray-600">
                        Mostrando {currentItems.length} de {insumosFiltrados.length} insumos
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

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin h-12 w-12 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600">Cargando insumos...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Usado</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                                No hay insumos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((insumo) => (
                                            <tr key={insumo.id_insumo} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{insumo.id_insumo}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-900">{insumo.tipo}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-600">{insumo.marca}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-600">{insumo.referencia}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-600">{insumo.serial || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${insumo.usado === 'SI' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {insumo.usado || 'NO'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCantidadStatus(insumo.estado)}`}>
                                                        {insumo.estado || 'DISPONIBLE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenPanel(insumo.id_insumo)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(insumo.id_insumo)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    {insumosFiltrados.length > 0 && (
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
        </>
    );

    // === RENDERIZADO DE INVENTARIO ===
    const renderInventario = () => (
        <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total de Insumos</p>
                            <p className="text-2xl font-bold text-gray-900">{resumen.totalItems}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <Package size={24} className="text-gray-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Disponibles</p>
                            <p className="text-2xl font-bold text-green-600">{resumen.totalDisponibles}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Agotados</p>
                            <p className="text-2xl font-bold text-red-600">{resumen.totalAgotados}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Buscador de inventario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por tipo, marca o referencia..."
                        value={searchInventario}
                        onChange={(e) => setSearchInventario(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                    />
                </div>
            </div>

            {/* Tabla de inventario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibles</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Agotados</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilidad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {inventarioFiltrado.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No hay insumos en el inventario
                                    </td>
                                </tr>
                            ) : (
                                inventarioFiltrado.map((item, index) => {
                                    const disponibles = parseInt(item.disponibles) || 0;
                                    const agotados = parseInt(item.agotados) || 0;
                                    const total = parseInt(item.total) || 0;
                                    const porcentajeDisponible = total > 0 ? (disponibles / total) * 100 : 0;
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.tipo}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.marca}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.referencia}</td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <span className="text-green-600 font-medium">{disponibles}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <span className="text-red-600 font-medium">{agotados}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center font-medium">{total}</td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                                        <div 
                                                            className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(disponibles, total)}`}
                                                            style={{ width: `${porcentajeDisponible}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 min-w-[40px]">
                                                        {Math.round(porcentajeDisponible)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer del inventario */}
            <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
                <span>
                    Mostrando {inventarioFiltrado.length} de {inventario.length} grupos
                </span>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                        Disponibles
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                        Agotados
                    </span>
                </div>
            </div>
        </>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-6 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Insumos</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {activeTab === 'lista' ? 'Gestión de insumos y stock' : 'Resumen de inventario agrupado'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Pestañas */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex">
                                <button
                                    onClick={() => setActiveTab('lista')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                                        activeTab === 'lista' 
                                            ? 'bg-black text-white' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <List size={16} />
                                    Lista
                                </button>
                                <button
                                    onClick={() => setActiveTab('inventario')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                                        activeTab === 'inventario' 
                                            ? 'bg-black text-white' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Package size={16} />
                                    Inventario
                                </button>
                            </div>

                            {activeTab === 'lista' && (
                                <button
                                    onClick={() => handleOpenPanel()}
                                    className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <Plus size={20} />
                                    Crear Insumo
                                </button>
                            )}

                            {activeTab === 'inventario' && (
                                <button
                                    onClick={cargarInventario}
                                    className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <RefreshCw size={18} className={loadingInventario ? 'animate-spin' : ''} />
                                    Actualizar
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {activeTab === 'lista' ? renderLista() : renderInventario()}
                </div>
            </div>

            {/* Panel lateral - z-index mayor que el sidebar */}
            {showPanel && activeTab === 'lista' && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-[60]"
                        onClick={handleClosePanel}
                    />
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
                                    {editingId ? 'Editar Insumo' : 'Crear Insumo'}
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
                                            Tipo *
                                        </label>
                                        <input
                                            type="text"
                                            name="tipo"
                                            value={formData.tipo}
                                            onChange={handleChange}
                                            required
                                            placeholder="Ej: Mouse, Teclado, Monitor, etc."
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
                                            placeholder="Ej: Logitech, HP, Dell, etc."
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
                                            placeholder="Ej: M185, KB216, P2419H, etc."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
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
                                            placeholder="Número de serie (opcional)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Usado
                                        </label>
                                        <select
                                            name="usado"
                                            value={formData.usado}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                        >
                                            <option value="NO">No</option>
                                            <option value="SI">Sí</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estado
                                        </label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                        >
                                            <option value="DISPONIBLE">Disponible</option>
                                            <option value="AGOTADO">Agotado</option>
                                        </select>
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
                                            placeholder="Observaciones adicionales (opcional)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
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
            )}
        </>
    );
};

export default Insumos;