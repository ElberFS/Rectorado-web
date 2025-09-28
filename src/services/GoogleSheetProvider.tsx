// src/services/GoogleSheetProvider.tsx

import React, { createContext, useContext } from 'react';
import { useGoogleSheetService } from './useGoogleSheetService';

// 1. Define el tipo de Contexto que vas a exportar
type GoogleSheetContextType = ReturnType<typeof useGoogleSheetService>;

// 2. Crea el Contexto
const GoogleSheetContext = createContext<GoogleSheetContextType | undefined>(undefined);

// 3. Crea el Provider (el componente que envuelve a App)
export const GoogleSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ⚠️ Ejecuta el hook SOLO AQUÍ
    const sheetService = useGoogleSheetService();

    return (
        <GoogleSheetContext.Provider value={sheetService}>
            {children}
        </GoogleSheetContext.Provider>
    );
};

// 4. Crea un hook personalizado para usar el contexto fácilmente
export const useSheetService = () => {
    const context = useContext(GoogleSheetContext);
    if (context === undefined) {
        throw new Error('useSheetService debe usarse dentro de un GoogleSheetProvider');
    }
    return context;
};