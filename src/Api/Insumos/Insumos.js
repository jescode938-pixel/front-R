import axios from "axios";
import { Base_url } from "../Config/apiConfig";

export const listarInsumos = async () => {
    const { data } = await axios.get(
        `${Base_url}/insumos`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const obtenerInsumo = async (id) => {
    const { data } = await axios.get(
        `${Base_url}/insumos/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const obtenerInventario = async () => {
    const { data } = await axios.get(
        `${Base_url}/insumos/inventario`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const crearInsumo = async (insumo) => {
    const { data } = await axios.post(
        `${Base_url}/insumos`,
        insumo,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const actualizarInsumo = async (id, insumo) => {
    const { data } = await axios.put(
        `${Base_url}/insumos/${id}`,
        insumo,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const eliminarInsumo = async (id) => {
    const { data } = await axios.delete(
        `${Base_url}/insumos/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};