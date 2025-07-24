import axios from "axios";

const API = axios.create({
    baseURL: "https://localhost:3443/api/",
});

export default API;