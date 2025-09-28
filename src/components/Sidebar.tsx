// src/components/Sidebar.tsx
import React from "react";
import { useSheetService } from "../services/GoogleSheetProvider";

const Sidebar: React.FC = () => {
    const { signOut, userProfile } = useSheetService();

    return (
        <aside className="w-56 h-screen bg-white text-gray-800 flex flex-col p-6 shadow-lg fixed left-0 top-0 z-30 border-r border-gray-200">

            <h2 className="text-2xl font-extrabold text-blue-500 mb-10">Sistema Rectorado</h2>

            {userProfile && (
                <div className="flex flex-col items-start mb-12 border-b border-gray-200 pb-4">
                    <img
                        src={userProfile.imageUrl || "URL_IMAGEN_DEFAULT"}
                        alt="User"
                        className="w-12 h-12 rounded-full border-2 border-blue-400 mb-3"
                    />
                    <div>
                        <p className="font-semibold text-lg truncate" title={userProfile.name}>
                            {userProfile.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate" title={userProfile.email}>
                            {userProfile.email}
                        </p>
                    </div>
                </div>
            )}

            <nav className="flex-grow">
                {/* Aquí puedes agregar tus enlaces de navegación */}
            </nav>

            <button
                onClick={signOut}
                className="mt-auto bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition text-sm font-semibold"
            >
                Cerrar Sesión
            </button>
        </aside>
    );
};

export default Sidebar;