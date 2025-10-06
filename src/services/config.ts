// config.ts

export const CLIENT_ID = "486408468099-hlh1danal1m7qogpnltti3efgajp08h0.apps.googleusercontent.com";
export const FOLDER_ID = "1SRESamB-3R1KnteO_jdWCQXMSxAul4to";
export const SPREADSHEET_ID = "13cfiJZysi_PrDWHBI-MaJMcfUHe4U6pDxdDz3PyuCmA";
export const SHEET_NAME = "Hoja1";
export const CALENDAR_SHEET_NAME = "Hoja2"; 

export const SCOPES =
    "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file";

export const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";



export interface SheetRow {
    "fecha": string;
    "exp. mesa de partes / sec. gen.": string;
    "dependencia / usuario": string;
    "asunto": string;
    "derivado a / fecha": string;
    [key: string]: any;
}

export interface CalendarRow {
    "fecha inicio": string; 
    "fecha fin": string;    
    "nombre": string;       
    "descripcion": string; 
    "lugar": string;       
    "estado": string;       
    "días repetición"?: string;  
    [key: string]: any;     
}

export const colIndexToLetter = (index: number): string => {
    const startCode = 'A'.charCodeAt(0);
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode(startCode + (index % 26)) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
};