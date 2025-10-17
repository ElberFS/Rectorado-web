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
    "Fecha Inicio": string; 
    "Fecha Fin": string;    
    "Hora inicio": string;
    "Hora fin": string;
    "Nombre": string;       
    "Descripcion": string; 
    "Lugar": string;       
    "Estado": string;       
    "Dias repetidos": string;  
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

export const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    
    // Especificar zona horaria de Perú (UTC-5)
    const start = new Date(startDate + 'T00:00:00-05:00');
    const end = new Date(endDate + 'T00:00:00-05:00');
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Fechas inválidas:', startDate, endDate);
        return dates;
    }
    
    if (start > end) {
        console.error('La fecha de inicio no puede ser mayor que la fecha de fin');
        return dates;
    }
    
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
        // Formatear manteniendo la fecha correcta en Perú
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
};

const dayNameToNumber = (dayName: string): number => {
    const days: { [key: string]: number } = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6,
        'sabado': 6
    };
    
    const result = days[dayName.toLowerCase()] ?? -1;
    console.log(`dayNameToNumber('${dayName}') = ${result}`);
    return result;
};

export const expandCalendarEvent = (event: CalendarRow): CalendarRow[] => {
    console.log("Procesando evento:", event["Nombre"]);
    console.log("Fecha inicio:", event["Fecha Inicio"]);
    console.log("Fecha fin:", event["Fecha Fin"]);
    console.log("Dias repetidos:", event["Dias repetidos"]);

    const expandedEvents: CalendarRow[] = [];
    
    const startDate = event["Fecha Inicio"];
    const endDate = event["Fecha Fin"];
    const repetitionDays = event["Dias repetidos"]?.toString() || "";
    
    if (!repetitionDays) {
        console.log("Sin días de repetición - expandiendo todo el rango");
        if (startDate === endDate || !endDate) {
            expandedEvents.push({
                ...event,
                "Fecha Inicio": startDate,
                "Fecha Fin": startDate
            });
        } else {
            const dateRange = generateDateRange(startDate, endDate);
            dateRange.forEach(date => {
                expandedEvents.push({
                    ...event,
                    "Fecha Inicio": date,
                    "Fecha Fin": date
                });
            });
        }
    } else {
        const daysOfWeek = repetitionDays.split(',').map(day => day.trim().toLowerCase());
        const dateRange = generateDateRange(startDate, endDate);
        
        console.log("Días a incluir:", daysOfWeek);
        console.log("Rango de fechas generado:", dateRange);
        
        dateRange.forEach(date => {
            // Usar fecha con timezone de Perú para obtener el día correcto
            const currentDate = new Date(date + 'T00:00:00-05:00');
            const dayOfWeek = currentDate.getDay();
            
            const shouldInclude = daysOfWeek.some(dayName => {
                const targetDay = dayNameToNumber(dayName);
                console.log(`Comparando: '${dayName}' -> ${targetDay} con ${dayOfWeek} (${date})`);
                return targetDay === dayOfWeek;
            });
            
            if (shouldInclude) {
                console.log(`INCLUYENDO ${date} (día ${dayOfWeek})`);
                expandedEvents.push({
                    ...event,
                    "Fecha Inicio": date,
                    "Fecha Fin": date
                });
            } else {
                console.log(`EXCLUYENDO ${date} (día ${dayOfWeek}) - no está en días repetidos`);
            }
        });
    }
    
    console.log(`Eventos expandidos finales: ${expandedEvents.length}`);
    return expandedEvents;
};

export const formatDateToLocal = (dateString: string): string => {
    // Usar timezone de Perú para el formateo
    const date = new Date(dateString + 'T00:00:00-05:00');
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}-${month}-${year}`;
};

// Función adicional para obtener la fecha actual en Perú
export const getCurrentDateInPeru = (): string => {
    const now = new Date();
    // Ajustar a UTC-5 (Perú)
    const peruOffset = -5 * 60; // minutos
    const localOffset = now.getTimezoneOffset(); // en minutos
    const peruTime = new Date(now.getTime() + (localOffset - peruOffset) * 60000);
    
    const year = peruTime.getFullYear();
    const month = (peruTime.getMonth() + 1).toString().padStart(2, '0');
    const day = peruTime.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};