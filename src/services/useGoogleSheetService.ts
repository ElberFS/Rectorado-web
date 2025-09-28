import { useState, useCallback } from "react";
import { gapi } from "gapi-script";

// Necesitas definir la interfaz global para GIS
declare global {
    interface Window {
        google: any;
    }
}

// ⚠️ Definición del tipo de fila de datos para TypeScript
export interface SheetRow {
    "fecha": string;
    "exp. mesa de partes / sec. gen.": string;
    "dependencia / usuario": string;
    "asunto": string;
    "derivado a / fecha": string;
    [key: string]: any; // Permite que otras columnas no tipadas también funcionen
}

// --- 1. CONSTANTES DE CONFIGURACIÓN ---
const CLIENT_ID = "486408468099-hlh1danal1m7qogpnltti3efgajp08h0.apps.googleusercontent.com";
const SPREADSHEET_ID = "13cfiJZysi_PrDWHBI-MaJMcfUHe4U6pDxdDz3PyuCmA";
const SHEET_NAME = "Hoja1";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";

let tokenClient: any = null;

// --- Funciones Auxiliares ---

// Mapea el índice de la tabla (base 0, sin cabecera) a la columna A-Z (base 1, con cabecera)
const colIndexToLetter = (index: number): string => {
    const startCode = 'A'.charCodeAt(0);
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode(startCode + (index % 26)) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
};


// --- 2. EL HOOK DE SERVICIO ---
export const useGoogleSheetService = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [data, setData] = useState<SheetRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isGapiInitialized, setIsGapiInitialized] = useState(false);

    // Nuevo: información del usuario logueado
    const [userProfile, setUserProfile] = useState<{
        name: string;
        email: string;
        imageUrl: string;
    } | null>(null);

    // ... (handleTokenResponse, initClient, signIn, signOut, listData - CÓDIGO ANTERIOR) ...

    // Manejo de respuesta de GIS (SIN CAMBIOS)
    const handleTokenResponse = useCallback((resp: any) => {
        if (resp.error) {
            console.error("Error al obtener el Access Token (GIS):", resp);
            setError(`Error de Autenticación: ${resp.details || resp.error}`);
            setIsSignedIn(false);
            setUserProfile(null);
            return;
        }

        // Establecer token en gapi
        gapi.client.setToken(resp);
        setIsSignedIn(true);
        setError(null);

        // ⚡ Obtener perfil del usuario (OpenID)
        if (window.google?.accounts?.oauth2) {
            window.google.accounts.oauth2.userinfo({
                success: (info: any) => {
                    setUserProfile({
                        name: info.name,
                        email: info.email,
                        imageUrl: info.picture,
                    });
                },
                error: () => {
                    setUserProfile(null);
                },
            });
        }
    }, []);

    // Inicializa GAPI y GIS (SIN CAMBIOS)
    const initClient = useCallback(() => {
        if (isGapiInitialized) return;
        // ... (código de inicialización)
        gapi.load("client", () => {
            gapi.client
                .init({
                    discoveryDocs: [DISCOVERY_DOC],
                })
                .then(() => {
                    setIsGapiInitialized(true);

                    if (window.google && window.google.accounts) {
                        tokenClient = window.google.accounts.oauth2.initTokenClient({
                            client_id: CLIENT_ID,
                            scope: SCOPES + " https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
                            callback: handleTokenResponse,
                        });
                    } else {
                        setError("GIS no cargó. Revisa el script en index.html.");
                    }
                })
                .catch((err: any) => {
                    console.error("Error al inicializar gapi.client:", err);
                    setError("Fallo al inicializar la API.");
                });
        });
    }, [handleTokenResponse, isGapiInitialized]);

    // Iniciar sesión (SIN CAMBIOS)
    const signIn = useCallback(() => {
        if (tokenClient) {
            const token = gapi.client.getToken();
            const needsConsent = token === null || token?.error;

            tokenClient.requestAccessToken({
                prompt: needsConsent ? "consent" : "",
            });
        } else {
            setError("El cliente de autenticación no está inicializado.");
        }
    }, []);

    // Cerrar sesión (SIN CAMBIOS)
    const signOut = useCallback(() => {
        const token = gapi.client.getToken();
        if (token !== null) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {
                gapi.client.setToken(null);
                setIsSignedIn(false);
                setData([]);
                setUserProfile(null);
                setError(null);
                console.log("Sesión revocada.");
            });
        }
    }, []);


    // Leer datos de la hoja (SIN CAMBIOS)
    const listData = useCallback(async () => {
        if (!isSignedIn) {
            setError("Debes iniciar sesión para leer los datos.");
            return;
        }
        // ... (Lógica de listado anterior) ...
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:Z`,
            });

            const values = response.result.values;
            if (values && values.length > 1) {
                const cleanHeader = (h: string) => String(h).trim().toLowerCase();

                const headers: string[] = [];
                const seen: Record<string, number> = {};

                values[0].forEach((h: string) => {
                    let header = cleanHeader(h);
                    if (seen[header]) {
                        header = `${header}_${seen[header] + 1}`;
                        seen[cleanHeader(h)] += 1;
                    } else {
                        seen[header] = 1;
                    }
                    headers.push(header);
                });


                const rows = values.slice(1).map((row: any[]) => {
                    const rowObject: Partial<SheetRow> = {};
                    headers.forEach((header: string, index: number) => {
                        (rowObject as any)[header] = String(row[index] || "").trim();
                    });
                    return rowObject as SheetRow;
                });

                setData(rows);
            } else {
                setData([]);
            }
            setError(null);
        } catch (err: any) {
            console.error("Error al leer la hoja:", err);
            setError("Fallo al listar los datos.");
        }
    }, [isSignedIn]);


    // 🚀 NUEVA FUNCIÓN PARA AÑADIR DERIVACIÓN
    const addDerivationToRow = useCallback(async (rowIndex: number, value: string) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para añadir derivaciones.");
        }
        
        const sheetRowNumber = rowIndex + 2; 

        try {
            // 1. Obtener la fila completa de la hoja (solo cabeceras para encontrar la columna libre)
            const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:Z1`, // Asumimos que las derivaciones no pasarán de la columna Z
            });

            const headers = headerResponse.result.values?.[0] || [];
            let targetColIndex = -1; // Índice de columna base 0

            // 2. Encontrar la PRIMERA columna 'derivado' VACÍA en la FILA DE DATOS
            const dataRowResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${sheetRowNumber}:Z${sheetRowNumber}`,
            });

            const rowValues = dataRowResponse.result.values?.[0] || [];

            for (let i = 0; i < headers.length; i++) {
                const header = String(headers[i]).toLowerCase().trim();
                const cellValue = String(rowValues[i] || "").trim();

                if (header.includes("derivado") && cellValue === "") {
                    targetColIndex = i;
                    break;
                }
            }

            if (targetColIndex === -1) {
                // Si no hay columna "derivado" vacía, se asume que la próxima columna vacía después de la última columna actual (A-Z) es la correcta.
                // En este escenario, lo más seguro es NO AÑADIR o añadir a la siguiente columna vacía (después de 'asunto' y 'derivado a / fecha')
                // Para simplificar, si no hay 'derivado' vacío, usaremos la siguiente columna libre después de la última columna existente.
                // Si tu hoja tiene más de 26 columnas (Z) esto fallará, debes ajustar A:Z.

                // Opción 1: Fallar, ya que no se encontró una columna 'derivado' vacía.
                throw new Error("No se encontró una columna 'derivado' disponible en esta fila.");

                /*
                // Opción 2: Intentar añadir a la siguiente columna
                targetColIndex = headers.length; 
                // Si la columna excede Z, este helper fallará.
                */
            }

            const targetColLetter = colIndexToLetter(targetColIndex);
            const range = `${SHEET_NAME}!${targetColLetter}${sheetRowNumber}`;

            // 3. Escribir el nuevo valor
            const resource = {
                values: [[value]],
            };

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: resource,
            });

            // 4. Recargar los datos después de la escritura
            await listData();

        } catch (err: any) {
            console.error("Error al añadir la derivación:", err);
            setError(err.message || "Fallo al guardar la derivación.");
            throw err;
        }
    }, [isSignedIn, listData]);


    return {
        initClient,
        signIn,
        signOut,
        isSignedIn,
        data,
        error,
        listData,
        userProfile,
        addDerivationToRow, // 👈 ¡EXPORTAR LA NUEVA FUNCIÓN!
    };
};