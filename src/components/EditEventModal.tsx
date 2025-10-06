import React, { useState, useEffect } from "react";
import type { CalendarEvent } from "./CalendarList";

type EditEventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
    onSave: (updatedEvent: CalendarEvent) => void;
};

const EditEventModal: React.FC<EditEventModalProps> = ({
    isOpen,
    onClose,
    event,
    onSave,
}) => {
    const [formData, setFormData] = useState<Partial<CalendarEvent>>({});

    // Sincroniza el evento seleccionado con el formulario
    useEffect(() => {
        if (event) {
            setFormData({ ...event });
        } else {
            setFormData({});
        }
    }, [event]);

    if (!isOpen || !event) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const isValid = formData.nombre?.trim() && formData.fechaInicio?.trim();

    const inputClasses =
        "w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-100 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-3 flex items-center gap-2">
                    ✏️ Editar evento
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>Nombre</label>
                        <input
                            type="text"
                            placeholder="Nombre del evento"
                            value={formData.nombre || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, nombre: e.target.value })
                            }
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Lugar</label>
                        <input
                            type="text"
                            placeholder="Lugar del evento"
                            value={formData.lugar || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, lugar: e.target.value })
                            }
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Descripción</label>
                        <textarea
                            placeholder="Descripción del evento"
                            value={formData.descripcion || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, descripcion: e.target.value })
                            }
                            className={inputClasses}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClasses}>Fecha inicio</label>
                            <input
                                type="date"
                                value={formData.fechaInicio || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, fechaInicio: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Fecha fin</label>
                            <input
                                type="date"
                                value={formData.fechaFin || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, fechaFin: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Estado</label>
                        <select
                            value={formData.estado || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, estado: e.target.value })
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

                <div className="flex justify-between mt-6 border-t pt-4">
                    
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                if (isValid) {
                                    onSave(formData as CalendarEvent);
                                    onClose(); // cerrar modal al guardar
                                }
                            }}
                            disabled={!isValid}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 shadow-md"
                        >
                            💾 Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEventModal;
