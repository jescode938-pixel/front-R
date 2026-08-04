import axios from "axios";
import { Base_url } from "../Config/apiConfig";

export const listarPerfiles = async () => {
    const { data } = await axios.get(
        `${Base_url}/perfiles`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const obtenerPerfil = async (id) => {
    const { data } = await axios.get(
        `${Base_url}/perfiles/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const crearPerfil = async (perfil) => {
    const { data } = await axios.post(
        `${Base_url}/perfiles`,
        perfil,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const actualizarPerfil = async (id, perfil) => {
    const { data } = await axios.put(
        `${Base_url}/perfiles/${id}`,
        perfil,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};

export const eliminarPerfil = async (id) => {
    const { data } = await axios.delete(
        `${Base_url}/perfiles/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return data;
};