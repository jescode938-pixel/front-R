import axios from "axios";
import { Base_url } from "../Config/apiConfig";

export const listarEquipos = async () => {
    const { data } = await axios.get(`${Base_url}/equipos`);
    return data;
};

export const obtenerEquipo = async (id) => {
    const { data } = await axios.get(`${Base_url}/equipos/${id}`);
    return data;
};

export const crearEquipo = async (equipo) => {
    console.log("Equipo enviado:", equipo);
    const { data } = await axios.post(`${Base_url}/equipos`, equipo);
    return data;
};

export const actualizarEquipo = async (id, equipo) => {
    const { data } = await axios.put(`${Base_url}/equipos/${id}`, equipo);
    return data;
};

export const eliminarEquipo = async (id) => {
    const { data } = await axios.delete(`${Base_url}/equipos/${id}`);
    return data;
};