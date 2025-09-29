import React, { useEffect } from 'react';
import { useSheetService } from '../services/GoogleSheetProvider';

const Login: React.FC = () => {
    const { initClient, signIn, isSignedIn, error } = useSheetService();

    useEffect(() => {
        initClient();
    }, [initClient]);

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center p-4 relative" // Añadido 'relative' para el overlay
            style={{ 
                backgroundImage: 'url(/Background.png)',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay oscuro sobre la imagen de fondo */}
            <div className="absolute inset-0 bg-black opacity-40"></div> {/* Fondo más oscuro */}

            <div className="relative z-10 p-10 max-w-md w-full bg-white bg-opacity-80 shadow-2xl rounded-xl text-center backdrop-blur-sm"> {/* Opacidad del 80% */}
                
                <img 
                    src="/LogoColor.png"
                    alt="Logo de la Aplicación" 
                    className="mx-auto h-16 w-auto mb-6" 
                />

                <h1 className="text-3xl font-extrabold mb-2 text-gray-800">
                    Sistema Rectorado
                </h1>
                <h2 className="text-lg font-medium mb-8 text-gray-600">
                    Inicia Sesión para Acceder
                </h2>
                
                {error && (
                    <div className="p-3 mb-5 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {isSignedIn ? (
                    <p className="py-3 text-lg text-green-700 font-semibold bg-green-50 rounded-lg border border-green-300">
                        ✅ Sesión iniciada correctamente.
                    </p>
                ) : (
                    <button
                        onClick={signIn}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-xl transition duration-200 transform hover:scale-[1.01]"
                    >
                        {/* Logo de Google SVG reincorporado */}
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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