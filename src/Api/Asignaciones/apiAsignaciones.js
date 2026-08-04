
import axios from "axios";
import { Base_url } from "../Config/apiConfig";

export const listarAsignaciones = async () => {
    const { data } = await axios.get(`${Base_url}/asignaciones`);
    return data;
};

export const obtenerAsignacion = async (id) => {
    const { data } = await axios.get(`${Base_url}/asignaciones/${id}`);
    return data;
};

export const crearAsignacion = async (asignacion) => {
    const { data } = await axios.post(
        `${Base_url}/asignaciones`,
        asignacion
    );
    return data;
};

export const actualizarAsignacion = async (id, asignacion) => {
    const { data } = await axios.put(
        `${Base_url}/asignaciones/${id}`,
        asignacion
    );
    return data;
};

export const eliminarAsignacion = async (id) => {
    const { data } = await axios.delete(
        `${Base_url}/asignaciones/${id}`
    );
    return data;
};

export const devolverAsignacion = async (id, datos) => {
    const { data } = await axios.post(
        `${Base_url}/asignaciones/${id}/devolver`,
        datos
    );
    return data;
};

// ============================================
// FUNCIONES PARA MANEJAR IMÁGENES
// ============================================

/**
 * 
 * @param {File} file 
 * @returns {Promise<string>} 
 */
export const convertirImagenABase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No se proporcionó ningún archivo'));
            return;
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!tiposPermitidos.includes(file.type)) {
            reject(new Error('Tipo de imagen no permitido. Use: JPG, PNG, WEBP o GIF'));
            return;
        }

        // Validar tamaño (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            reject(new Error(`La imagen excede el tamaño máximo de 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = (error) => {
            reject(new Error('Error al leer el archivo: ' + error.message));
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Prepara los datos de una asignación con imagen
 * @param {Object} datos - Datos de la asignación
 * @param {File} imagenFile - Archivo de imagen (opcional)
 * @returns {Promise<Object>} - Datos preparados para enviar al servidor
 */
export const prepararDatosConImagen = async (datos, imagenFile) => {
    const datosFormulario = { ...datos };

    if (imagenFile) {
        try {
            const imagenBase64 = await convertirImagenABase64(imagenFile);
            datosFormulario.imagen_base64 = imagenBase64;
            datosFormulario.imagen_nombre = imagenFile.name;
            datosFormulario.imagen_tipo = imagenFile.type;
        } catch (error) {
            throw new Error('Error al procesar la imagen: ' + error.message);
        }
    }

    return datosFormulario;
};

/**
 * Crea una asignación con imagen
 * @param {Object} datos - Datos de la asignación
 * @param {File} imagenFile - Archivo de imagen (opcional)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const crearAsignacionConImagen = async (datos, imagenFile) => {
    try {
        const datosPreparados = await prepararDatosConImagen(datos, imagenFile);
        return await crearAsignacion(datosPreparados);
    } catch (error) {
        throw error;
    }
};

/**
 * Actualiza una asignación con imagen
 * @param {number} id - ID de la asignación
 * @param {Object} datos - Datos de la asignación
 * @param {File} imagenFile - Archivo de imagen (opcional)
 * @param {boolean} eliminarImagen - Flag para eliminar la imagen existente
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const actualizarAsignacionConImagen = async (id, datos, imagenFile, eliminarImagen = false) => {
    try {
        const datosFormulario = { ...datos };

        if (eliminarImagen) {
            datosFormulario.eliminar_imagen = true;
        }

        if (imagenFile) {
            try {
                const imagenBase64 = await convertirImagenABase64(imagenFile);
                datosFormulario.imagen_base64 = imagenBase64;
                datosFormulario.imagen_nombre = imagenFile.name;
                datosFormulario.imagen_tipo = imagenFile.type;
            } catch (error) {
                throw new Error('Error al procesar la imagen: ' + error.message);
            }
        }

        return await actualizarAsignacion(id, datosFormulario);
    } catch (error) {
        throw error;
    }
};

/**
 * Devuelve un equipo con imagen de evidencia
 * @param {number} id - ID de la asignación
 * @param {Object} datos - Datos de devolución
 * @param {File} imagenFile - Archivo de imagen (opcional)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const devolverAsignacionConImagen = async (id, datos, imagenFile) => {
    try {
        const datosFormulario = { ...datos };

        if (imagenFile) {
            try {
                const imagenBase64 = await convertirImagenABase64(imagenFile);
                datosFormulario.imagen_base64 = imagenBase64;
                datosFormulario.imagen_nombre = imagenFile.name;
                datosFormulario.imagen_tipo = imagenFile.type;
            } catch (error) {
                throw new Error('Error al procesar la imagen: ' + error.message);
            }
        }

        return await devolverAsignacion(id, datosFormulario);
    } catch (error) {
        throw error;
    }
};