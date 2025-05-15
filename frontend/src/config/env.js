// Read environment variables with fallbacks
const API_URL = import.meta.env.VITE_API_URL || "/api";
const APP_NAME = import.meta.env.VITE_APP_NAME || "Visualist";
const APP_ENV = import.meta.env.VITE_APP_ENV || "development";

export { API_URL, APP_NAME, APP_ENV };
