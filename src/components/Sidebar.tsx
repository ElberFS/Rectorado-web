// src/components/Sidebar.tsx
import React from "react";
import { useSheetService } from "../services/GoogleSheetProvider";

const Sidebar: React.FC = () => {
    const { signOut, userProfile } = useSheetService();
    // userProfile debe venir del Google API: { name, email, imageUrl }

    return (
        // w-56 y fixed para asegurar que no se solape
        <aside className="w-56 h-screen bg-gray-900 text-white flex flex-col p-6 shadow-2xl fixed left-0 top-0 z-30">

            {/* Título: Sistema Rectorado */}
            <h2 className="text-2xl font-extrabold text-blue-400 mb-10">Sistema Rectorado</h2>

            {/* Usuario logueado (Se mantiene solo si tienes el profile) */}
            {userProfile && (
                <div className="flex flex-col items-start mb-12 border-b border-gray-700 pb-4">
                    {/* ... Contenido del perfil ... */}
                    <img
                        src={userProfile.imageUrl || "URL_IMAGEN_DEFAULT"}
                        alt="User"
                        className="w-12 h-12 rounded-full border-2 border-blue-400 mb-3"
                    />
                    <div>
                        <p className="font-semibold text-lg truncate" title={userProfile.name}>
                            {userProfile.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate" title={userProfile.email}>
                            {userProfile.email}
                        </p>
                    </div>
                </div>
            )}

            {/* Links de Navegación (Placeholder) */}
            <nav className="flex-grow">
                {/* ... Tus enlaces de navegación ... */}
            </nav>

            {/* Botón Cerrar Sesión: mt-auto lo ancla abajo */}
            <button
                onClick={signOut}
                className="mt-auto bg-red-600 py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
                Cerrar Sesión
            </button>
        </aside>
    );
};

export default Sidebar;