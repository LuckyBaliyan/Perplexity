import axios from "axios";

/**
 *Axios instance with base URL and credentials
 * @param {string} baseURL - The base URL of the API
 * @param {boolean} withCredentials - Whether to include credentials in the request
 */
const api = axios.create({
      baseURL: "http://localhost:3000",
      withCredentials: true,
});

export async function register({ email, username, password }) {
      const response = await api.post("/api/auth/register", { email, username, password });
      return response.data;
}

export async function login({ email, password }) {
      const response = await api.post("/api/auth/login", { email, password });
      return response.data;
}

export async function getMe() {
      const response = await api.get("/api/auth/get-me");
      return response.data;
}