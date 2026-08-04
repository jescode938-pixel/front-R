import axios from "axios";
import { Base_url } from "../Config/apiConfig";

export const listarSalidas = async () => {

    const { data } = await axios.get(
        `${Base_url}/salidas`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );

    return data;

};

export const registrarSalida = async (salida) => {

    const { data } = await axios.post(
        `${Base_url}/salidas`,
        salida,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );

    return data;

};

export const obtenerSalida = async (id) => {

    const { data } = await axios.get(
        `${Base_url}/salidas/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );

    return data;

};

export const eliminarSalida = async (id) => {

    const { data } = await axios.delete(
        `${Base_url}/salidas/${id}`,
        {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );

    return data;

};