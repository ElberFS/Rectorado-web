// useCalendarService.ts

import { useState, useCallback } from "react";
import { gapi } from "gapi-script";
import {
    SPREADSHEET_ID,
    CALENDAR_SHEET_NAME,
    colIndexToLetter,
} from "./config";
import type { CalendarRow } from "./config";


export const useCalendarService = () => {
    const [calendarData, setCalendarData] = useState<CalendarRow[]>([]);
    const [calendarError, setCalendarError] = useState<string | null>(null);

    const CALENDAR_HEADERS = ["fecha inicio", "fecha fin", "nombre", "descripcion", "lugar", "estado"];


    const listCalendarEvents = useCallback(async (): Promise<CalendarRow[]> => {
        try {
            if (!gapi.client.getToken() || gapi.client.getToken()?.error) {
                setCalendarError("Autenticación no válida. Inicia sesión primero.");
                return [];
            }

            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${CALENDAR_SHEET_NAME}!A:F`,
            });

            const values = response.result.values;

            if (!values || values.length <= 1) {
                setCalendarData([]);
                setCalendarError(null);
                return [];
            }

            const headers = values[0].map((h: string) => String(h).trim().toLowerCase().replace(/\s+/g, " "));

            const rows = values.slice(1).map((row: any[], rowIndex: number) => {
                const rowObject: Partial<CalendarRow> = {};
                headers.forEach((header: string, index: number) => {
                    (rowObject as any)[header] = String(row[index] || "").trim();
                });

                (rowObject as any).sheetRowNumber = rowIndex + 2;
                return rowObject as CalendarRow;
            });

            setCalendarData(rows);
            setCalendarError(null);
            return rows;

        } catch (err: any) {
            console.error("Error al listar eventos:", err);
            const msg = err.result?.error?.message || "Fallo al listar los eventos.";
            setCalendarError(msg);
            throw new Error(msg);
        }
    }, []);

    const addCalendarEvent = useCallback(async (newEvent: Omit<CalendarRow, 'sheetRowNumber'>) => {
        try {
            if (!gapi.client.getToken() || gapi.client.getToken()?.error) {
                throw new Error("Debes iniciar sesión para añadir eventos.");
            }


            const rowArray = CALENDAR_HEADERS.map(header => {
                const value = (newEvent as any)[header] ?? "";
                return String(value ?? "").trim();
            });

            const resource = { values: [rowArray] };

            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${CALENDAR_SHEET_NAME}!A:F`,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                resource,
            });

            await listCalendarEvents();
        } catch (err: any) {
            console.error("Error al añadir evento:", err);
            const msg = err?.message || "Fallo al añadir el evento.";
            setCalendarError(msg);
            throw new Error(msg);
        }
    }, [listCalendarEvents]);



    const editCalendarCell = useCallback(async (sheetRowNumber: number, columnKey: keyof CalendarRow, newValue: string) => {
        try {
            if (!gapi.client.getToken() || gapi.client.getToken()?.error) {
                throw new Error("Debes iniciar sesión para editar.");
            }

            const targetColIndex = CALENDAR_HEADERS.findIndex(h => h === columnKey);
            if (targetColIndex === -1) {
                throw new Error(`Columna '${columnKey}' no encontrada en la lista de cabeceras de calendario.`);
            }

            const targetColLetter = colIndexToLetter(targetColIndex);
            const range = `${CALENDAR_SHEET_NAME}!${targetColLetter}${sheetRowNumber}`;

            const resource = { values: [[newValue]] };

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range,
                valueInputOption: "USER_ENTERED",
                resource,
            });

            await listCalendarEvents();
        } catch (err: any) {
            console.error("Error al editar celda del calendario:", err);
            const msg = err?.message || "Fallo al editar la celda.";
            setCalendarError(msg);
            throw new Error(msg);
        }
    }, [listCalendarEvents]);


    // useCalendarService.ts

    const deleteCalendarEvent = useCallback(async (sheetRowNumber: number) => {
        try {
            if (!gapi.client.getToken() || gapi.client.getToken()?.error) {
                throw new Error("Debes iniciar sesión para eliminar.");
            }

            const sheetMetadataResponse = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID,
            });

            const targetSheet = sheetMetadataResponse.result.sheets?.find(
                (sheet: any) => sheet.properties.title === CALENDAR_SHEET_NAME
            );

            if (!targetSheet || targetSheet.properties.sheetId === undefined) {
                throw new Error(`No se pudo encontrar la hoja con el nombre: ${CALENDAR_SHEET_NAME}.`);
            }

            const sheetId = targetSheet.properties.sheetId;

            const request = {
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId, 
                                    dimension: "ROWS",
                                    startIndex: sheetRowNumber - 1,
                                    endIndex: sheetRowNumber, 
                                },
                            },
                        },
                    ],
                },
            };

            await gapi.client.sheets.spreadsheets.batchUpdate(request);

            await listCalendarEvents();


        } catch (err: any) {
            console.error("Error al eliminar evento:", err);
            const msg = err.result?.error?.message || "Fallo al eliminar el evento.";
            setCalendarError(msg);
            throw new Error(msg);
        }
    }, [listCalendarEvents]);


    return {
        calendarData,
        calendarError,
        listCalendarEvents,
        addCalendarEvent,
        editCalendarCell,
        deleteCalendarEvent,
    };
};