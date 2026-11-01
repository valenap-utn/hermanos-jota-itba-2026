const rawApiUrl = process.env.REACT_APP_API_URL;

export const API_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "")
  : process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:3001/api";
