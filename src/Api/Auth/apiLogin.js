import axios from "axios";
import { Base_url } from "../Config/apiConfig";

export const login = async (usuario, contrasena) => {
    
        const response = await axios.post(`${Base_url}/auth/login`, { usuario,contrasena});
        return response.data;
    };