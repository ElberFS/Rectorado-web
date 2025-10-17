import React, { useState } from "react";
import type { CalendarEvent } from "./CalendarList";
import ConfirmationModal from "./ConfirmationModal";

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
    const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    if (!isOpen || !selectedDate) return null;

    const formatDateForDisplay = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00-05:00');
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatDateForComparison = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00-05:00');
        if (isNaN(date.getTime())) return dateString;
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDateForDisplay(selectedDate);
    const comparisonDate = formatDateForComparison(selectedDate);

    const eventsForDay = events.filter((ev) => {
        if (!ev.fechaInicio) return false;
        
        const eventComparisonDate = formatDateForComparison(ev.fechaInicio);
        return eventComparisonDate === comparisonDate;
    });

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

    const formatTime = (time?: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const handleDeleteClick = (event: CalendarEvent) => {
        setEventToDelete(event);
        setIsConfirmationOpen(true);
    };

    const handleConfirmDelete = () => {
        if (eventToDelete) {
            onDeleteEvent(eventToDelete);
            setEventToDelete(null);
        }
        setIsConfirmationOpen(false);
    };

    const handleCancelDelete = () => {
        setEventToDelete(null);
        setIsConfirmationOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative border border-gray-100 max-h-[90vh] overflow-y-auto">
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

                    <div className="mb-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">
                            {eventsForDay.length} evento{eventsForDay.length !== 1 ? 's' : ''} programado{eventsForDay.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {eventsForDay.length > 0 ? (
                        <ul className="space-y-3">
                            {eventsForDay.map((ev, i) => (
                                <li
                                    key={i}
                                    className={`p-4 rounded-lg ${getColorByEstado(ev.estado)} flex flex-col gap-2 transition-all hover:shadow-md`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-base flex-1">{ev.nombre}</h4>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white bg-opacity-50">
                                            {ev.estado}
                                        </span>
                                    </div>

                                    {(ev.horaInicio || ev.horaFin) && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <span className="text-gray-600">⏰</span>
                                            <span className="font-medium">
                                                {formatTime(ev.horaInicio)} 
                                                {ev.horaFin && ` - ${formatTime(ev.horaFin)}`}
                                            </span>
                                        </div>
                                    )}

                                    {ev.lugar && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <span className="text-gray-600">📍</span>
                                            <span className="text-gray-700">{ev.lugar}</span>
                                        </div>
                                    )}

                                    {ev.descripcion && (
                                        <p className="text-sm text-gray-700 mt-1 bg-white bg-opacity-50 p-2 rounded">
                                            {ev.descripcion}
                                        </p>
                                    )}

                                    {ev.diasRepetidos && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                            <span>🔄</span>
                                            <span>Se repite: {ev.diasRepetidos}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-opacity-30">
                                        <button
                                            onClick={() => onEditEvent(ev)}
                                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                                        >
                                            <span>✏️</span>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(ev)}
                                            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                                        >
                                            <span>🗑️</span>
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">📅</div>
                            <p className="text-gray-500 italic text-lg mb-2">
                                No hay eventos programados
                            </p>
                            <p className="text-gray-400 text-sm">
                                ¡Agrega un nuevo evento para comenzar!
                            </p>
                        </div>
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
                            className="bg-blue-600 text-white font-bold py-2 px-5 rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                        >
                            <span>➕</span>
                            Nuevo evento
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmationOpen}
                title="Confirmar eliminación"
                message={`¿Estás seguro de que quieres eliminar el evento "${eventToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

export default DayEventsModal;