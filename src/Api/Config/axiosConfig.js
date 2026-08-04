import axios from "axios";
import { Base_url } from "../Config/apiConfig";

const axiosAuth = axios.create({
    baseURL: Base_url,
});

axiosAuth.interceptors.request.use((config) => {

    const token = sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

}, (error) => {
    return Promise.reject(error);
});

export default axiosAuth;