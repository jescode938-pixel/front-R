import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Package, Calendar, User } from 'lucide-react';
import { listarSalidas, registrarSalida, obtenerSalida, eliminarSalida } from '../Api/Salidas/apiSalidaInsumos';
import { listarInsumos } from '../Api/Insumos/Insumos';

const SalidasInsumos = () => {
    const [salidas, setSalidas] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        id_insumo: '',
        cantidad: '',
        responsable: '',
        fecha: '',
        observaciones: ''
    });

    useEffect(() => {
        cargarDatos();
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

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [salidasData, insumosData] = await Promise.all([
                listarSalidas(),
                listarInsumos()
            ]);
            setSalidas(salidasData);
            setInsumos(insumosData);
        } catch (err) {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPanel = (id = null) => {
        if (id) {
            setEditingId(id);
            cargarSalida(id);
        } else {
            setEditingId(null);
            setFormData({
                id_insumo: '',
                cantidad: '',
                responsable: '',
                fecha: new Date().toISOString().split('T')[0],
                observaciones: ''
            });
        }
        setShowPanel(true);
    };

    const handleClosePanel = () => {
        setShowPanel(false);
        setEditingId(null);
        setFormData({
            id_insumo: '',
            cantidad: '',
            responsable: '',
            fecha: '',
            observaciones: ''
        });
    };

    const cargarSalida = async (id) => {
        try {
            const data = await obtenerSalida(id);
            setFormData({
                id_insumo: data.id_insumo || '',
                cantidad: data.cantidad || '',
                responsable: data.responsable || '',
                fecha: data.fecha ? data.fecha.split('T')[0] : '',
                observaciones: data.observaciones || ''
            });
        } catch (err) {
            setError('Error al cargar la salida');
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


        if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        setLoading(true);
        try {

            const dataToSend = {
                id_insumo: formData.id_insumo,
                cantidad: parseInt(formData.cantidad),
                responsable: formData.responsable,
                fecha: formData.fecha,
                observaciones: formData.observaciones
            };

            if (editingId) {
                await registrarSalida({ ...dataToSend, id: editingId });
            } else {
                await registrarSalida(dataToSend);
            }
            await cargarDatos();
            handleClosePanel();
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.mensaje || 'Error al guardar la salida');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta salida?')) {
            try {
                await eliminarSalida(id);
                await cargarDatos();
            } catch (err) {
                setError('Error al eliminar la salida');
            }
        }
    };

    const obtenerNombreInsumo = (id_insumo) => {
        const insumo = insumos.find(i => i.id_insumo === id_insumo);
        return insumo ? `${insumo.tipo} - ${insumo.marca} (${insumo.referencia})` : 'No disponible';
    };

    const salidasFiltradas = salidas.filter(salida =>
        salida.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salida.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salida.marca?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className={`min-h-screen bg-gray-50 p-6 transition-all duration-300 ${showPanel ? 'lg:ml-0' : 'lg:ml-72'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Salidas de Insumos</h1>
                            <p className="text-gray-500 text-sm mt-1">Registro de salidas de insumos</p>
                        </div>
                        <button
                            onClick={() => handleOpenPanel()}
                            className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <Plus size={20} />
                            Registrar Salida
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por responsable, tipo o marca..."
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
                                <p className="text-gray-600">Cargando salidas...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {salidasFiltradas.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    No hay salidas registradas
                                                </td>
                                            </tr>
                                        ) : (
                                            salidasFiltradas.map((salida) => (
                                                <tr key={salida.id_salida} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{salida.id_salida}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Package size={16} className="text-gray-400" />
                                                            {salida.tipo} - {salida.marca}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${salida.cantidad === 0 ? 'bg-red-100 text-red-700' :
                                                            salida.cantidad < 5 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {salida.cantidad}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" />
                                                            {salida.responsable}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={16} className="text-gray-400" />
                                                            {new Date(salida.fecha).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {salida.observaciones || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenPanel(salida.id_salida)}
                                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(salida.id_salida)}
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
                    )}
                </div>
            </div>


            {showPanel && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:z-40"
                    onClick={handleClosePanel}
                />
            )}


            <div
                className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${showPanel ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingId ? 'Editar Salida' : 'Registrar Salida'}
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
                                    Insumo *
                                </label>
                                <select
                                    name="id_insumo"
                                    value={formData.id_insumo}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                >
                                    <option value="">Seleccionar insumo</option>
                                    {insumos.map((insumo) => (
                                        <option key={insumo.id_insumo} value={insumo.id_insumo}>
                                            {insumo.tipo} - {insumo.marca} ({insumo.referencia}) - Stock: {insumo.cantidad}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad a retirar *
                                </label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={formData.cantidad}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                />
                                {formData.id_insumo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stock disponible: {insumos.find(i => i.id_insumo === parseInt(formData.id_insumo))?.cantidad || 0} unidades
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Responsable *
                                </label>
                                <input
                                    type="text"
                                    name="responsable"
                                    value={formData.responsable}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nombre del responsable"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Salida *
                                </label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
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
                                    placeholder="Motivo de la salida, destino, etc."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-none"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalidasInsumos;