// src/components/Layout.tsx
import React from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-900">

            {/* Sidebar: w-56 y fijo (fixed) con z-index alto */}
            <Sidebar />

            {/* Contenido principal: Ocupa el espacio restante (flex-1) */}
            <main className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-y-auto">
                {/* CONTENEDOR DE CONTENIDO (CHILDREN)
                    CLAVE: El padding izquierdo (pl-56) solo se aplica a partir de 'md:'
                */}
                <div className="p-4 md:p-8 min-h-screen pl-0 md:pl-56">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;