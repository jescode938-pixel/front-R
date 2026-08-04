// Api/accesorios/accesorios.js
import axios from "axios";
import { Base_url } from "../Config/apiConfig";

// ============================================
// FUNCIONES PARA ACCESORIOS (INVENTARIO)
// ============================================
export const listarAccesorios = async () => {
    const { data } = await axios.get(`${Base_url}/accesorios/inventario`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const obtenerAccesorio = async (id) => {
    const { data } = await axios.get(`${Base_url}/accesorios/inventario/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const crearAccesorio = async (accesorio) => {
    const { data } = await axios.post(`${Base_url}/accesorios/inventario`, accesorio, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const actualizarAccesorio = async (id, accesorio) => {
    const { data } = await axios.put(`${Base_url}/accesorios/inventario/${id}`, accesorio, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const eliminarAccesorio = async (id) => {
    const { data } = await axios.delete(`${Base_url}/accesorios/inventario/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const accesoriosDisponibles = async () => {
    const { data } = await axios.get(`${Base_url}/accesorios/inventario/disponibles`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const listarCambios = async () => {
    const { data } = await axios.get(`${Base_url}/accesorios/cambios`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const obtenerCambio = async (id) => {
    const { data } = await axios.get(`${Base_url}/accesorios/cambios/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const crearCambio = async (cambio) => {
    const { data } = await axios.post(`${Base_url}/accesorios/cambios`, cambio, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const actualizarCambio = async (id, cambio) => {
    const { data } = await axios.put(`${Base_url}/accesorios/cambios/${id}`, cambio, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};

export const eliminarCambio = async (id) => {
    const { data } = await axios.delete(`${Base_url}/accesorios/cambios/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    return data;
};