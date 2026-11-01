import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);
