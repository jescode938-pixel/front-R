import axios from "axios";
import { Base_url } from "../Config/apiConfig";


export const listarCambios = async () => {
    const { data } = await axios.get(
        `${Base_url}/accesorios/cambios`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};


export const obtenerCambio = async (id) => {
    const { data } = await axios.get(
        `${Base_url}/accesorios/cambios/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const crearCambio = async (cambio) => {
    const { data } = await axios.post(
        `${Base_url}/accesorios/cambios`,
        cambio,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

// ACTUALIZAR un cambio
export const actualizarCambio = async (id, cambio) => {
    const { data } = await axios.put(
        `${Base_url}/accesorios/cambios/${id}`,
        cambio,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};


export const eliminarCambio = async (id) => {
    const { data } = await axios.delete(
        `${Base_url}/accesorios/cambios/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};