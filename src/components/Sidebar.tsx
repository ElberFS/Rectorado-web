// src/components/Sidebar.tsx
import React from "react";
import { useSheetService } from "../services/GoogleSheetProvider";

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
    currentView: "list" | "calendar";
    onChangeView: (view: "list" | "calendar") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentView, onChangeView }) => {
    const { signOut, userProfile } = useSheetService();
    const isMinimized = !isOpen;

    const sidebarClasses = `
        h-screen bg-white text-gray-800 flex flex-col p-6 shadow-2xl fixed left-0 top-0 z-30 
        border-r border-gray-100 transition-all duration-300 overflow-x-hidden
        lg:${isOpen ? "w-56" : "w-20"} 
        ${isOpen ? "translate-x-0 w-56" : "-translate-x-full w-56"}
    `;

    const navButtonClass = (isActive: boolean) =>
        `flex items-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
            isActive
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
        } ${isMinimized ? "justify-center" : ""}`;

    return (
        <aside className={sidebarClasses}>
            <div className="flex items-center mb-10 overflow-hidden">
                <img
                    src="/LogoColor.png"
                    alt="Logo Rectorado"
                    className={`w-8 h-8 ${isMinimized ? "mr-0" : "mr-2"} rounded-lg transition-all duration-300`}
                />
                <h2
                    className={`text-xl font-black text-blue-600 tracking-tight transition-opacity duration-300 ${
                        isMinimized ? "opacity-0 hidden lg:inline" : "opacity-100"
                    }`}
                >
                    Rectorado
                </h2>
            </div>

            {userProfile && (
                <div
                    className={`flex flex-col items-center border-b border-gray-100 pb-5 mb-8 transition-all duration-300 ${
                        isMinimized ? "items-center" : "items-start"
                    }`}
                >
                    <div
                        className={`w-full overflow-hidden transition-opacity duration-300 text-center ${
                            isMinimized ? "opacity-0 h-0 lg:opacity-100 lg:h-auto" : "opacity-100 h-auto"
                        }`}
                    >
                        <p
                            className={`font-extrabold text-lg leading-snug text-gray-800 truncate ${
                                isMinimized ? "hidden" : "block"
                            }`}
                            title={userProfile.name}
                        >
                            {userProfile.name}
                        </p>
                        <p
                            className={`text-xs text-blue-500 font-medium truncate mt-0.5 ${
                                isMinimized ? "hidden" : "block"
                            }`}
                            title={userProfile.email}
                        >
                            {userProfile.email}
                        </p>
                    </div>
                </div>
            )}

            <nav className="flex-grow space-y-2">
                <button
                    className={navButtonClass(currentView === "list")}
                    onClick={() => onChangeView("list")}
                >
                    📄 {!isMinimized && "Lista de Documentos"}
                </button>

                <button
                    className={navButtonClass(currentView === "calendar")}
                    onClick={() => onChangeView("calendar")}
                >
                    📅 {!isMinimized && "Calendario"}
                </button>
            </nav>

            <button
                onClick={signOut}
                className="mt-auto flex items-center justify-center bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition duration-200 text-base font-bold shadow-lg transform hover:scale-[1.01]"
            >
                <svg
                    className={`w-5 h-5 ${!isMinimized ? "mr-2" : "mr-0"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                </svg>
                <span className={`${isMinimized ? "hidden lg:inline" : "inline"}`}>
                    Cerrar Sesión
                </span>
            </button>
        </aside>
    );
};

export default Sidebar;
