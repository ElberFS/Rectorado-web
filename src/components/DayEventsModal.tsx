import React from "react";
import type { CalendarEvent } from "./CalendarList";

interface DayEventsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null;
    events: CalendarEvent[];
    onAddEvent: () => void;
    onEditEvent: (event: CalendarEvent) => void;
    onDeleteEvent: (event: CalendarEvent) => void;
}

const DayEventsModal: React.FC<DayEventsModalProps> = ({
    isOpen,
    onClose,
    selectedDate,
    events,
    onAddEvent,
    onEditEvent,
    onDeleteEvent,
}) => {
    if (!isOpen || !selectedDate) return null;

    const [y, m, d] = selectedDate.split("-").map(Number);
    const selectedDay = new Date(y, m - 1, d);

    const formattedDate = selectedDay.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const eventsForDay = events.filter((ev) => {
        if (!ev.fechaInicio) return false;
        const eventDate = new Date(ev.fechaInicio);
        return (
            eventDate.getFullYear() === selectedDay.getFullYear() &&
            eventDate.getMonth() === selectedDay.getMonth() &&
            eventDate.getDate() === selectedDay.getDate()
        );
    });

    const statusColorClass = (estado?: string) => {
        switch (estado) {
            case "Pendiente":
                return "text-yellow-700 bg-yellow-100 border-yellow-300";
            case "En curso":
                return "text-blue-700 bg-blue-100 border-blue-300";
            case "Completado":
                return "text-green-700 bg-green-100 border-green-300";
            case "Cancelado":
                return "text-red-700 bg-red-100 border-red-300";
            default:
                return "text-gray-700 bg-gray-100 border-gray-300";
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative border border-gray-100 max-h-[90vh] overflow-y-auto">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    aria-label="Cerrar modal"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>

                <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-3 capitalize">
                    {formattedDate}
                </h3>

                {/* Lista de eventos */}
                {eventsForDay.length > 0 ? (
                    <ul className="space-y-3">
                        {eventsForDay.map((ev, i) => (
                            <li
                                key={i}
                                className={`p-3 rounded-lg border ${statusColorClass(
                                    ev.estado
                                )} flex flex-col gap-1`}
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-sm">{ev.nombre}</h4>
                                    <span className="text-xs italic">{ev.estado}</span>
                                </div>
                                {ev.descripcion && (
                                    <p className="text-xs text-gray-700">{ev.descripcion}</p>
                                )}
                                {ev.lugar && (
                                    <p className="text-xs text-gray-500">📍 {ev.lugar}</p>
                                )}

                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => onEditEvent(ev)}
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => onDeleteEvent(ev)}
                                        className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic text-sm mb-3">
                        No hay eventos registrados para este día.
                    </p>
                )}

                <div className="flex justify-end pt-6 border-t mt-6 gap-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-xl hover:bg-gray-300 transition shadow-md"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={onAddEvent}
                        className="bg-blue-600 text-white font-bold py-2 px-5 rounded-xl hover:bg-blue-700 transition shadow-lg"
                    >
                        ➕ Nuevo evento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayEventsModal;
