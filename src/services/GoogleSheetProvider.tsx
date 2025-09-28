import React, { createContext, useContext } from 'react';
import { useGoogleSheetService } from './useGoogleSheetService';

type GoogleSheetContextType = ReturnType<typeof useGoogleSheetService>;

const GoogleSheetContext = createContext<GoogleSheetContextType | undefined>(undefined);

export const GoogleSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const sheetService = useGoogleSheetService();

    return (
        <GoogleSheetContext.Provider value={sheetService}>
            {children}
        </GoogleSheetContext.Provider>
    );
};

export const useSheetService = () => {
    const context = useContext(GoogleSheetContext);
    if (context === undefined) {
        throw new Error('useSheetService debe usarse dentro de un GoogleSheetProvider');
    }
    return context;
};