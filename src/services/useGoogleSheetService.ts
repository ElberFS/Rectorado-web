// src/services/useGoogleSheetService.ts

import { useState, useCallback } from "react";
import { gapi } from "gapi-script";

// Necesitas definir la interfaz global para GIS
declare global {
    interface Window {
        google: any;
    }
}

// ⚠️ Definición del tipo de fila de datos para TypeScript
// Las claves deben coincidir con las cabeceras en minúsculas y sin espacios.
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

    // Manejo de respuesta de GIS
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

    // Inicializa GAPI y GIS
    const initClient = useCallback(() => {
        if (isGapiInitialized) return;

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

    // Iniciar sesión
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

    // Cerrar sesión
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

    // Leer datos de la hoja
    const listData = useCallback(async () => {
        if (!isSignedIn) {
            setError("Debes iniciar sesión para leer los datos.");
            return;
        }

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

    return {
        initClient,
        signIn,
        signOut,
        isSignedIn,
        data,
        error,
        listData,
        userProfile, // 👈 agregado aquí
    };
};
