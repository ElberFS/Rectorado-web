// src/components/Layout.tsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const mainMarginClass = isSidebarOpen ? 'lg:ml-56 ml-0' : 'lg:ml-20 ml-0';

    return (
        <div className="flex min-h-screen bg-gray-900">
            
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

            {isSidebarOpen && (
                <div 
                    className="fixed inset-0  bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
            
            <main 
                className={`flex-1 bg-gray-100  overflow-y-auto transition-all duration-300 ${mainMarginClass}`}
            >
                <button
                    onClick={toggleSidebar}
                    className="p-3 fixed top-4 left-4 z-40 bg-white rounded-full shadow-lg lg:hidden"
                    aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {isSidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                <div className={`p-4 md:p-8 min-h-screen ${!isSidebarOpen ? 'pt-20 lg:pt-8' : 'pt-20 lg:pt-8'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;