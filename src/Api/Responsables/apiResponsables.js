import axios from "axios";
import { Base_url } from "../Config/apiConfig";



export const listarResponsables = async () => {
    const { data } = await axios.get(`${Base_url}/responsables`);
    return data;
};

export const obtenerResponsable = async (id) => {
    const { data } = await axios.get(`${Base_url}/responsables/${id}`);
    return data;
};

export const crearResponsable = async (responsable) => {
    const { data } = await axios.post(`${Base_url}/responsables`, responsable);
    return data;
};

export const actualizarResponsable = async (id, responsable) => {
    const { data } = await axios.put(
        `${Base_url}/responsables/${id}`,
        responsable
    );
    return data;
};

export const eliminarResponsable = async (id) => {
    const { data } = await axios.delete(`${Base_url}/responsables/${id}`);
    return data;
};