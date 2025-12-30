import axios from 'axios';

// const API_BASE_URL = "https://backend-d6mx.vercel.app";
const API_BASE_URL = "http://localhost:8031";

// Allow cookies to be sent with requests
axios.defaults.withCredentials = true;

export default API_BASE_URL;
