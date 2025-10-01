import { useState, useCallback } from "react";
import { gapi } from "gapi-script";

declare global {
    interface Window {
        google: any;
    }
}

export interface SheetRow {
    "fecha": string;
    "exp. mesa de partes / sec. gen.": string;
    "dependencia / usuario": string;
    "asunto": string;
    "derivado a / fecha": string;
    [key: string]: any;
}

const CLIENT_ID = "486408468099-hlh1danal1m7qogpnltti3efgajp08h0.apps.googleusercontent.com";
const FOLDER_ID = "1SRESamB-3R1KnteO_jdWCQXMSxAul4to";
const SPREADSHEET_ID = "13cfiJZysi_PrDWHBI-MaJMcfUHe4U6pDxdDz3PyuCmA";
const SHEET_NAME = "Hoja1";
const SCOPES =
    "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";

let tokenClient: any = null;


const colIndexToLetter = (index: number): string => {
    const startCode = 'A'.charCodeAt(0);
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode(startCode + (index % 26)) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
};


export const useGoogleSheetService = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [data, setData] = useState<SheetRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isGapiInitialized, setIsGapiInitialized] = useState(false);

    const [userProfile, setUserProfile] = useState<{
        name: string;
        email: string;
        imageUrl: string;
    } | null>(null);

    const handleTokenResponse = useCallback((resp: any) => {
        if (resp.error) {
            console.error("Error al obtener el Access Token (GIS):", resp);
            setError(`Error de Autenticación: ${resp.details || resp.error}`);
            setIsSignedIn(false);
            setUserProfile(null);
            return;
        }

        gapi.client.setToken(resp);
        setIsSignedIn(true);
        setError(null);

        gapi.client.request({
            path: "https://www.googleapis.com/oauth2/v3/userinfo"
        }).then((response: any) => {
            const info = response.result;
            setUserProfile({
                name: info.name,
                email: info.email,
                imageUrl: info.picture,
            });
        }).catch(() => {
            setUserProfile(null);
        });
    }, []);


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

    const addRow = useCallback(async (newRow: Record<string, any>) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para añadir filas.");
        }

        try {
            const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:Z1`,
            });

            const headersRaw: string[] = headerResponse.result.values?.[0] || [];

            if (headersRaw.length === 0) {
                throw new Error("La hoja no tiene cabeceras en la fila 1. Añade las cabeceras antes de insertar filas.");
            }

            const clean = (h: string) => String(h).trim().toLowerCase();
            const normalizedHeaders: string[] = [];
            const seen: Record<string, number> = {};

            headersRaw.forEach((h: string) => {
                let header = clean(h);
                if (seen[header]) {
                    header = `${header}_${seen[header] + 1}`;
                    seen[clean(h)] += 1;
                } else {
                    seen[header] = 1;
                }
                normalizedHeaders.push(header);
            });

            const rowArray = normalizedHeaders.map((normHeader) => {
                const baseKey = normHeader.replace(/_[0-9]+$/, "");
                const val = (newRow as any)[normHeader] ?? (newRow as any)[baseKey] ?? "";
                return String(val ?? "").trim();
            });

            const resource = { values: [rowArray] };

            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:Z`,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                resource,
            });

            await listData();
            setError(null);
        } catch (err: any) {
            console.error("Error al añadir fila:", err);
            setError(err?.message || "Fallo al añadir la fila.");
            throw err;
        }
    }, [isSignedIn, listData]);

    const addDerivationToRow = useCallback(async (rowIndex: number, value: string) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para añadir derivaciones.");
        }

        const sheetRowNumber = rowIndex + 2;

        try {
            const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:Z1`,
            });

            const headers = headerResponse.result.values?.[0] || [];
            let targetColIndex = -1;

            const dataRowResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${sheetRowNumber}:Z${sheetRowNumber}`,
            });

            const rowValues = dataRowResponse.result.values?.[0] || [];

            for (let i = 0; i < headers.length; i++) {
                const header = String(headers[i] || "").toLowerCase().trim();
                const cellValue = String(rowValues[i] || "").trim();

                if (header.includes("derivado") && cellValue === "") {
                    targetColIndex = i;
                    break;
                }
            }

            if (targetColIndex === -1) {
                for (let i = headers.length - 1; i >= 0; i--) {
                    const header = String(headers[i] || "").toLowerCase().trim();
                    if (header.includes("derivado")) {
                        targetColIndex = i;
                        break;
                    }
                }
                if (targetColIndex !== -1) {
                    console.warn("Todas las celdas 'derivado' están llenas. Sobrescribiendo la última.");
                } else {
                    throw new Error("No se encontró una columna 'derivado' disponible en esta fila.");
                }
            }

            const targetColLetter = colIndexToLetter(targetColIndex);
            const range = `${SHEET_NAME}!${targetColLetter}${sheetRowNumber}`;

            const resource = {
                values: [[value]],
            };

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: resource,
            });

            await listData();

        } catch (err: any) {
            console.error("Error al añadir la derivación:", err);
            setError(err.message || "Fallo al guardar la derivación.");
            throw err;
        }
    }, [isSignedIn, listData]);


    const findDerivationColumn = useCallback(async (rowIndex: number, derivationKey: string) => {
        const sheetRowNumber = rowIndex + 2;

        const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:Z1`,
        });
        const headers = headerResponse.result.values?.[0] || [];

        let targetColIndex = -1;

        const normalizedHeaders: string[] = [];
        const seen: Record<string, number> = {};

        headers.forEach((h: string) => {
            let header = String(h).trim().toLowerCase();
            if (seen[header]) {
                header = `${header}_${seen[header] + 1}`;
                seen[String(h).trim().toLowerCase()] += 1;
            } else {
                seen[header] = 1;
            }
            normalizedHeaders.push(header);
        });

        targetColIndex = normalizedHeaders.findIndex(h => h === derivationKey);

        if (targetColIndex === -1) {
            throw new Error(`Columna para la clave '${derivationKey}' no encontrada.`);
        }

        return {
            targetColLetter: colIndexToLetter(targetColIndex),
            sheetRowNumber,
            range: `${SHEET_NAME}!${colIndexToLetter(targetColIndex)}${sheetRowNumber}`
        };
    }, []);

    const editDerivation = useCallback(async (rowIndex: number, derivationKey: string, newValue: string) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para editar.");
        }
        try {
            const { range } = await findDerivationColumn(rowIndex, derivationKey);

            const resource = {
                values: [[newValue]],
            };

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: resource,
            });

            await listData();
        } catch (err: any) {
            console.error("Error al editar la derivación:", err);
            setError(err.message || "Fallo al editar la derivación.");
            throw err;
        }
    }, [isSignedIn, listData, findDerivationColumn]);

    const deleteDerivation = useCallback(async (rowIndex: number, derivationKey: string) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para eliminar.");
        }
        try {
            const { range } = await findDerivationColumn(rowIndex, derivationKey);

            const resource = {
                values: [[""]],
            };

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: resource,
            });

            await listData();
        } catch (err: any) {
            console.error("Error al eliminar la derivación:", err);
            setError(err.message || "Fallo al eliminar la derivación.");
            throw err;
        }
    }, [isSignedIn, listData, findDerivationColumn]);

    const editCell = useCallback(async (rowIndex: number, columnKey: string, newValue: string) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para editar.");
        }
        try {
            const sheetRowNumber = rowIndex + 2;

            const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:Z1`,
            });
            const headers = headerResponse.result.values?.[0] || [];

            const clean = (h: string) => String(h).trim().toLowerCase();
            const normalizedHeaders: string[] = [];
            const seen: Record<string, number> = {};

            headers.forEach((h: string) => {
                let header = clean(h);
                if (seen[header]) {
                    header = `${header}_${seen[header] + 1}`;
                    seen[clean(h)] += 1;
                } else {
                    seen[header] = 1;
                }
                normalizedHeaders.push(header);
            });

            const targetColIndex = normalizedHeaders.findIndex(h => h === columnKey);
            if (targetColIndex === -1) {
                throw new Error(`Columna '${columnKey}' no encontrada en la hoja.`);
            }

            const targetColLetter = colIndexToLetter(targetColIndex);
            const range = `${SHEET_NAME}!${targetColLetter}${sheetRowNumber}`;

            const resource = {
                values: [[newValue]],
            };

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range,
                valueInputOption: "USER_ENTERED",
                resource,
            });

            await listData();
        } catch (err: any) {
            console.error("Error al editar celda:", err);
            setError(err.message || "Fallo al editar la celda.");
            throw err;
        }
    }, [isSignedIn, listData]);

    const uploadFileToDrive = useCallback(async (file: File, rowIndex?: number) => {
        if (!isSignedIn) {
            throw new Error("Debes iniciar sesión para subir archivos.");
        }

        try {
            const metadata = {
                name: file.name,
                mimeType: file.type || "application/pdf",
                parents: [FOLDER_ID],
            };

            const form = new FormData();
            form.append(
                "metadata",
                new Blob([JSON.stringify(metadata)], { type: "application/json" })
            );
            form.append("file", file);

            const token = gapi.client.getToken().access_token;

            const response = await fetch(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
                {
                    method: "POST",
                    headers: new Headers({ Authorization: `Bearer ${token}` }),
                    body: form,
                }
            );

            const result = await response.json();
            console.log("Archivo subido a Drive:", result);

            const fileId = result.id;
            const fileLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

            if (rowIndex !== undefined) {
                await editCell(rowIndex, "enlace documento", fileLink);
            }

            return { fileId, fileLink };
        } catch (err: any) {
            console.error("Error al subir archivo a Drive:", err);
            throw err;
        }
    }, [isSignedIn, editCell]);




    return {
        initClient,
        signIn,
        signOut,
        isSignedIn,
        data,
        error,
        listData,
        userProfile,
        addRow,
        addDerivationToRow,
        editDerivation,
        deleteDerivation,
        editCell,
        uploadFileToDrive,
    };

};