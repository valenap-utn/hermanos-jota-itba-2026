export const API_URL = process.env.NODE_ENV === "production"
  ? "/api"
  : "http://localhost:3001/api";