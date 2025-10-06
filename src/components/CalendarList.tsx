import React, { useEffect, useState } from "react";
import AddEventModal from "./AddEventModal";
import { useCalendarService } from "../services/useCalendarService";
import type { CalendarRow as RawCalendarRow } from "../services/config";
import DayEventsModal from "./DayEventsModal";
import EditEventModal from "./EditEventModal";

export type CalendarEvent = {
    id?: string;
    nombre?: string;
    descripcion?: string;
    lugar?: string;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    sheetRowNumber?: number;
};

const getColorByEstado = (estado?: string) => {
    switch (estado) {
        case "Pendiente":
            return "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 shadow-sm";
        case "En curso":
            return "bg-blue-100 text-blue-800 border-l-4 border-blue-500 shadow-sm";
        case "Completado":
            return "bg-green-100 text-green-800 border-l-4 border-green-500 shadow-sm";
        case "Cancelado":
            return "bg-red-100 text-red-800 border-l-4 border-red-500 shadow-sm";
        default:
            return "bg-gray-100 text-gray-700 border-l-4 border-gray-400 shadow-sm";
    }
};

type ViewMode = "Mes" | "Semana" | "Día";

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const mapRawToEvent = (raw: RawCalendarRow): CalendarEvent => {
    return {
        nombre: (raw as any)["nombre"] || "",
        descripcion: (raw as any)["descripcion"] || "",
        lugar: (raw as any)["lugar"] || "",
        estado: (raw as any)["estado"] || "",
        fechaInicio: (raw as any)["fecha inicio"] || "",
        fechaFin: (raw as any)["fecha fin"] || (raw as any)["fecha inicio"] || "",
        sheetRowNumber: (raw as any).sheetRowNumber,
    };
};

const CalendarList: React.FC = () => {
    const {
        calendarData,
        listCalendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        editCalendarCell,
        calendarError
    } = useCalendarService();

    const today = new Date();
    const [currentNavDate, setCurrentNavDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({});
    const [viewMode, setViewMode] = useState<ViewMode>("Mes");
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        listCalendarEvents();
    }, [listCalendarEvents]);

    useEffect(() => {
        if (Array.isArray(calendarData)) {
            const mapped = calendarData.map(mapRawToEvent);
            setEvents(mapped);
        } else {
            setEvents([]);
        }
    }, [calendarData]);

    const year = currentNavDate.getFullYear();
    const month = currentNavDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const changeDate = (delta: number) => {
        const newDate = new Date(currentNavDate);
        switch (viewMode) {
            case "Mes":
                newDate.setMonth(newDate.getMonth() + delta);
                newDate.setDate(1);
                break;
            case "Semana":
                newDate.setDate(newDate.getDate() + delta * 7);
                break;
            case "Día":
                newDate.setDate(newDate.getDate() + delta);
                setSelectedDate(formatDate(newDate));
                break;
        }
        setCurrentNavDate(newDate);
    };

    const handleDayClick = (date: string) => {
        setSelectedDate(date);
        setIsDayModalOpen(true);
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (mode !== 'Mes' && !selectedDate) {
            setSelectedDate(formatDate(today));
            setCurrentNavDate(today);
        }
        if (mode === 'Mes') {
            setCurrentNavDate(new Date(currentNavDate.getFullYear(), currentNavDate.getMonth(), 1));
        }
    }


    const handleSaveEvent = async () => {
        const eventToSave: CalendarEvent = {
            id: newEvent.id,
            nombre: newEvent.nombre || "",
            descripcion: newEvent.descripcion || "",
            lugar: newEvent.lugar || "",
            estado: newEvent.estado || "Pendiente",
            fechaInicio: newEvent.fechaInicio || selectedDate || "",
            fechaFin: newEvent.fechaFin || newEvent.fechaInicio || selectedDate || "",
        };

        const rawToSave: any = {
            "fecha inicio": eventToSave.fechaInicio || "",
            "fecha fin": eventToSave.fechaFin || "",
            "nombre": eventToSave.nombre || "",
            "descripcion": eventToSave.descripcion || "",
            "lugar": eventToSave.lugar || "",
            "estado": eventToSave.estado || "",
        };

        try {
            await addCalendarEvent(rawToSave as any);
            setNewEvent({});
            setIsAddModalOpen(false);
            listCalendarEvents();
        } catch (err: any) {
            console.error("Error guardando evento:", err);
            alert("Error al guardar evento: " + (err?.message || err));
        }
    };


    const getEventsForDay = (date: string) => {
        // Asegura que la fecha que se está consultando se interprete como medianoche LOCAL.
        const current = new Date(`${date}T00:00:00`);
        const currentDay = new Date(current.setHours(0, 0, 0, 0)); // Medianoche local del día consultado

        return events.filter((event) => {
            
            // Fuerza la interpretación de la fecha de inicio del evento como medianoche LOCAL.
            const start = event.fechaInicio ? new Date(`${event.fechaInicio}T00:00:00`) : null;
            
            // La fecha de fin se mantiene para consistencia en el objeto event, pero no se usa para el filtro visual.
            // const end = event.fechaFin ? new Date(`${event.fechaFin}T00:00:00`) : start; 
            if (!start) return false;

            const startDay = new Date(start.setHours(0, 0, 0, 0)); // Medianoche local del inicio del evento

            // MODIFICACIÓN CLAVE: El evento solo es visible si la fecha consultada (currentDay)
            // es EXACTAMENTE igual a la fecha de inicio del evento (startDay).
            const isStartDay = currentDay.getTime() === startDay.getTime();

            return isStartDay;
        });
    };

    const getWeekDays = () => {
        const start = currentNavDate;
        // Obtenemos el día de la semana (0=Domingo, 6=Sábado). Lo ajustamos para que 1=Lunes.
        const day = (start.getDay() + 6) % 7; 
        // Calculamos la diferencia para llegar al Lunes (día 0 en nuestro ajuste)
        const diff = start.getDate() - day; 
        const startOfWeek = new Date(start);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    };

    const weekDayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    const renderDayView = () => {
        // Asegura que la fecha seleccionada se interprete como medianoche local
        const dateToRender = selectedDate 
            ? new Date(`${selectedDate}T00:00:00`) 
            : currentNavDate;
            
        const dateStr = formatDate(dateToRender);
        const dayEvents = getEventsForDay(dateStr);
        const dayName = dateToRender.toLocaleDateString("es-ES", { weekday: "long" });
        const dayOfMonth = dateToRender.getDate();
        const monthNameDay = dateToRender.toLocaleDateString("es-ES", { month: "long" });


        return (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-center capitalize text-blue-600">
                    {dayName}, {dayOfMonth} de {monthNameDay}
                </h3>
                <div className="border-t pt-4">
                    {dayEvents.length ? (
                        <div className="space-y-3">
                            {dayEvents.map((ev, idx) => (
                                <div key={idx} className={`p-3 rounded-lg text-sm transition ${getColorByEstado(ev.estado)}`}>
                                    <p className="font-bold text-base">{ev.nombre}</p>
                                    {ev.lugar && <p className="text-xs mt-1">📍 {ev.lugar}</p>}
                                    {ev.descripcion && <p className="text-xs mt-1 text-gray-700">{ev.descripcion}</p>}
                                    <p className="text-xs mt-1 font-medium">Estado: {ev.estado}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 italic py-8">🎉 ¡Sin eventos para este día!</p>
                    )}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays();
        return (
            <div>
                <div className="grid grid-cols-7 text-center font-bold text-gray-800 mb-2 border-b pb-2">
                    {weekDayNames.map((d) => (
                        <div key={d} className="hidden sm:block">{d}</div>
                    ))}
                    {weekDayNames.map((d) => (
                        <div key={d + 'short'} className="sm:hidden">{d.slice(0, 3)}</div>
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {weekDays.map((date) => {
                        const dateStr = formatDate(date);
                        const dayEvents = getEventsForDay(dateStr);
                        const day = date.getDate();
                        const dayName = date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase();
                        const isToday = dateStr === formatDate(today);

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDayClick(dateStr)}
                                className={`border border-gray-200 rounded-xl p-3 min-h-[120px] bg-white cursor-pointer shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 ${isToday ? 'border-blue-500 ring-2 ring-blue-300' : ''}`}
                            >
                                <div className="text-sm font-bold text-blue-600 mb-2">
                                    {dayName} <span className="text-xl">{day}</span>
                                </div>
                                <div className="space-y-1 overflow-auto max-h-[80px]">
                                    {dayEvents.slice(0, 2).map((ev, idx) => (
                                        <div key={idx} className={`text-xs px-2 py-1 rounded-md overflow-hidden whitespace-nowrap text-ellipsis ${getColorByEstado(ev.estado)}`}>
                                            {ev.nombre}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-gray-500 mt-1">+{dayEvents.length - 2} más</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => i);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div>
                <div className="grid grid-cols-7 text-center font-bold text-gray-700 mb-2 border-b pb-2">
                    {weekDayNames.map((d) => (
                        <div key={d} className="hidden sm:block">{d}</div>
                    ))}
                    {weekDayNames.map((d) => (
                        <div key={d + 'short'} className="sm:hidden text-xs">{d.slice(0, 3)}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {emptyCells.map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 rounded-lg"></div>
                    ))}

                    {days.map((day) => {
                        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const dayEvents = getEventsForDay(date);
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                        return (
                            <div
                                key={date}
                                className={`border rounded-xl p-2 min-h-[100px] bg-white cursor-pointer shadow-sm hover:scale-[1.02] hover:shadow-md transition duration-200 ease-in-out ${isToday ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
                                onClick={() => handleDayClick(date)}
                            >
                                <div className={`text-lg font-extrabold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>{day}</div>
                                <div className="mt-1 space-y-1 overflow-hidden max-h-[70px]">
                                    {dayEvents.slice(0, 2).map((ev, idx) => (
                                        <div
                                            key={idx}
                                            className={`text-xs px-2 py-0.5 rounded-md overflow-hidden whitespace-nowrap text-ellipsis font-medium ${getColorByEstado(ev.estado)}`}
                                        >
                                            {ev.nombre}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-gray-500 mt-1">+{dayEvents.length - 2} más</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderNavigationText = () => {
        const date = currentNavDate;
        
        // Muestra siempre el Mes y el Año, independientemente de la vista (Mes, Semana, Día)
        return `${date.toLocaleDateString("es-ES", { month: "long" })}, ${date.getFullYear()}`;
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 bg-white p-4 rounded-xl shadow-lg sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <h2 className="text-xl sm:text-3xl font-extrabold capitalize text-gray-800 whitespace-nowrap">
                        🗓️ {renderNavigationText()}
                    </h2>

                    <button
                        onClick={() => changeDate(1)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    {((["Día", "Semana", "Mes"] as ViewMode[])).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => handleViewModeChange(mode)}
                            className={`px-3 py-1.5 text-sm rounded-md font-semibold transition duration-200 ${viewMode === mode ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-white"
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => {
                        setSelectedDate(formatDate(today));
                        setNewEvent({});
                        setIsAddModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    ➕ Agregar evento
                </button>
            </div>

            {calendarError && (
                <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg font-medium border border-red-300">
                    🚨 Error de calendario: {calendarError}
                </div>
            )}

            <div className="mt-8">
                {viewMode === "Día" && renderDayView()}
                {viewMode === "Semana" && renderWeekView()}
                {viewMode === "Mes" && renderMonthView()}
            </div>

            <DayEventsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                selectedDate={selectedDate}
                events={events}
                onAddEvent={() => {
                    setIsDayModalOpen(false);
                    setIsAddModalOpen(true);
                }}
                onEditEvent={(event) => {
                    setSelectedEvent(event);
                    setIsEditModalOpen(true);
                }}
                onDeleteEvent={async () => {
                    try {
                        if (selectedEvent?.sheetRowNumber === undefined) {
                            return;
                        }

                        await deleteCalendarEvent(selectedEvent.sheetRowNumber);

                        listCalendarEvents();
                    } catch (err: any) {
                        console.error("Error al eliminar:", err);
                    }
                }}

            />


            <AddEventModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveEvent}
                newEvent={{ ...newEvent, fechaInicio: selectedDate || newEvent.fechaInicio }}
                setNewEvent={setNewEvent}
                selectedDate={selectedDate}
                events={events}
            />
            <EditEventModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                event={selectedEvent}
                onSave={async (updatedEvent) => {
                    try {
                        if (!updatedEvent.sheetRowNumber) throw new Error("Evento sin fila asociada en la hoja.");

                        const updates = [
                            ["fecha inicio", updatedEvent.fechaInicio],
                            ["fecha fin", updatedEvent.fechaFin],
                            ["nombre", updatedEvent.nombre],
                            ["descripcion", updatedEvent.descripcion],
                            ["lugar", updatedEvent.lugar],
                            ["estado", updatedEvent.estado],
                        ];

                        for (const [col, value] of updates) {
                            await editCalendarCell(updatedEvent.sheetRowNumber, col as any, String(value ?? ""));
                        }

                        setIsEditModalOpen(false);
                        listCalendarEvents();
                    } catch (err: any) {
                        alert("Error al guardar cambios: " + (err?.message || err));
                    }
                }}
            />


        </div>
    );
};

export default CalendarList;