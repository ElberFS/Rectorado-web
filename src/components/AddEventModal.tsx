import React from "react";
import type { CalendarEvent } from "./CalendarList";

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    newEvent: Partial<CalendarEvent>;
    setNewEvent: (ev: Partial<CalendarEvent>) => void;
    selectedDate: string | null;
    events: CalendarEvent[];
}

const AddEventModal: React.FC<AddEventModalProps> = ({
    isOpen,
    onClose,
    onSave,
    newEvent,
    setNewEvent,
    selectedDate,
}) => {
    if (!isOpen) return null;

    const selectedDayDate = selectedDate ? new Date(selectedDate) : null;
    const formattedDateTitle = selectedDayDate
        ? selectedDayDate.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : "Nuevo Evento";

    const inputClasses =
        "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm placeholder-gray-400";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 ">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative border border-gray-100 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
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
                    {formattedDateTitle}
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClasses}>Fecha inicio</label>
                            <input
                                type="date"
                                value={newEvent.fechaInicio || selectedDate || ""}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, fechaInicio: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Fecha fin</label>
                            <input
                                type="date"
                                value={newEvent.fechaFin || ""}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, fechaFin: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Nombre</label>
                        <input
                            type="text"
                            placeholder="Nombre del evento (Requerido)"
                            value={newEvent.nombre || ""}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, nombre: e.target.value })
                            }
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Descripción</label>
                        <textarea
                            placeholder="Detalles del evento"
                            value={newEvent.descripcion || ""}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, descripcion: e.target.value })
                            }
                            className={inputClasses}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClasses}>Lugar</label>
                            <input
                                type="text"
                                placeholder="Lugar del evento"
                                value={newEvent.lugar || ""}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, lugar: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Estado</label>
                            <select
                                value={newEvent.estado || ""}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, estado: e.target.value })
                                }
                                className={inputClasses}
                            >
                                <option value="">(ninguno)</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En curso">En curso</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-xl hover:bg-gray-300 transition shadow-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        className="bg-blue-600 text-white font-bold py-2 px-5 rounded-xl hover:bg-blue-700 transition shadow-lg transform hover:scale-[1.01] disabled:opacity-50"
                        disabled={!newEvent.nombre || !newEvent.fechaInicio}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;