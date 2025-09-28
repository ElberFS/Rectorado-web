import React, { useEffect } from 'react';
import { useSheetService } from '../services/GoogleSheetProvider';

const Login: React.FC = () => {
    // Obtenemos las funciones de inicialización y autenticación del hook
    const { initClient, signIn, isSignedIn, error } = useSheetService();

    // 1. Inicializa la API de Google al montar el componente (solo una vez)
    useEffect(() => {
        initClient();
    }, [initClient]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 max-w-sm w-full bg-white shadow-lg rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Acceso al Panel de Control
                </h2>
                
                {/* Muestra errores de inicialización o login */}
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {isSignedIn ? (
                    // Si ya está logueado, muestra un mensaje (App.tsx debería redirigir a List.tsx)
                    <p className="text-green-600 font-semibold">
                        ✅ Sesión iniciada. Redirigiendo...
                    </p>
                ) : (
                    // Botón para iniciar el flujo de autenticación de Google
                    <button
                        onClick={signIn}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#FFC107" d="M43.61 20.083H42V20H24V28H35.861C35.035 30.505 33.003 32.548 30.43 33.856V38.644C33.82 36.467 36.63 33.27 38.4 29.352L43.61 33.565V33.565C43.61 33.565 43.61 33.565 43.61 33.565Z"/>
                            <path fill="#4CAF50" d="M24 44C30.657 44 36.331 41.761 40.547 37.999L35.861 33.856C33.003 35.548 28.971 36.61 24 36.61C18.667 36.61 13.791 34.793 10.05 31.542L4.839 35.355V35.355C8.01 38.625 12.38 41.24 17.585 42.668L24 44Z"/>
                            <path fill="#1976D2" d="M4.839 12.645L10.05 16.458C13.791 13.207 18.667 11.39 24 11.39C29.03 11.39 33.059 12.449 35.861 14.144L40.547 10.001C36.331 6.239 30.657 4 24 4C17.585 4 11.909 6.643 7.747 10.274L4.839 12.645Z"/>
                            <path fill="#F44336" d="M43.61 24.39V24H24V20H42V20.083L43.61 24.39Z"/>
                        </svg>
                        Iniciar Sesión con Google
                    </button>
                )}
            </div>
        </div>
    );
};

export default Login;
