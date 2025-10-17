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
    const [customDays, setCustomDays] = useState<string[]>([]);
    const [showCustomSelector, setShowCustomSelector] = useState(false);

    useEffect(() => {
        if (event) {
            setFormData({ ...event });
            
            const diasRepetidos = event.diasRepetidos || "";
            if (diasRepetidos && ![
                "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
                "Lunes,Martes,Miércoles,Jueves,Viernes",
                "Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo",
                ""
            ].includes(diasRepetidos)) {
                setCustomDays(diasRepetidos.split(','));
                setShowCustomSelector(true);
            } else {
                setCustomDays([]);
                setShowCustomSelector(false);
            }
        } else {
            setFormData({});
            setCustomDays([]);
            setShowCustomSelector(false);
        }
    }, [event]);

    if (!isOpen || !event) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const isValid = formData.nombre?.trim() && formData.fechaInicio?.trim();

    const inputClasses =
        "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm placeholder-gray-400";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    const daysOfWeek = [
        { value: "Lunes", label: "Lunes" },
        { value: "Martes", label: "Martes" },
        { value: "Miércoles", label: "Miércoles" },
        { value: "Jueves", label: "Jueves" },
        { value: "Viernes", label: "Viernes" },
        { value: "Sábado", label: "Sábado" },
        { value: "Domingo", label: "Domingo" }
    ];

    const handleDayToggle = (day: string) => {
        const updatedDays = customDays.includes(day)
            ? customDays.filter(d => d !== day)
            : [...customDays, day];
        
        setCustomDays(updatedDays);
        setFormData({ 
            ...formData, 
            diasRepetidos: updatedDays.join(',') 
        });
    };

    const handleRepetitionChange = (value: string) => {
        if (value === "personalizado") {
            setShowCustomSelector(true);
            if (customDays.length > 0) {
                setFormData({ ...formData, diasRepetidos: customDays.join(',') });
            } else {
                setFormData({ ...formData, diasRepetidos: "" });
            }
        } else {
            setShowCustomSelector(false);
            setCustomDays([]);
            setFormData({ ...formData, diasRepetidos: value });
        }
    };

    const getSelectValue = () => {
        if (showCustomSelector && customDays.length > 0) {
            return "personalizado";
        }
        return formData.diasRepetidos || "";
    };

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-100 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
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

                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-3 flex items-center gap-2">
                    ✏️ Editar evento
                </h2>

                <div className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClasses}>Hora inicio</label>
                            <input
                                type="time"
                                value={formData.horaInicio || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, horaInicio: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Hora fin</label>
                            <input
                                type="time"
                                value={formData.horaFin || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, horaFin: e.target.value })
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
                            value={formData.nombre || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, nombre: e.target.value })
                            }
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Descripción</label>
                        <textarea
                            placeholder="Detalles del evento"
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

                    <div>
                        <label className={labelClasses}>Días de repetición</label>
                        <select
                            value={getSelectValue()}
                            onChange={(e) => handleRepetitionChange(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="Lunes">Lunes</option>
                            <option value="Martes">Martes</option>
                            <option value="Miércoles">Miércoles</option>
                            <option value="Jueves">Jueves</option>
                            <option value="Viernes">Viernes</option>
                            <option value="Sábado">Sábado</option>
                            <option value="Domingo">Domingo</option>
                            <option value="Lunes,Martes,Miércoles,Jueves,Viernes">Lunes a Viernes</option>
                            <option value="Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo">Todos los días</option>
                            <option value="personalizado">Personalizado...</option>
                        </select>
                        
                        {showCustomSelector && (
                            <div className="mt-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Selecciona los días:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {daysOfWeek.map(day => (
                                        <label key={day.value} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={customDays.includes(day.value)}
                                                onChange={() => handleDayToggle(day.value)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{day.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {customDays.length > 0 && (
                                    <p className="text-xs text-green-600 mt-2">
                                        Días seleccionados: {customDays.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona días específicos para repetición semanal
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 mb-2">💡 Información sobre repeticiones</h4>
                        <p className="text-xs text-blue-700">
                            • Si defines fechas de inicio y fin diferentes, el evento se expandirá automáticamente a todos los días en ese rango.<br/>
                            • Si seleccionas días de repetición, el evento solo aparecerá en esos días específicos dentro del rango de fechas.
                        </p>
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
                        onClick={() => {
                            if (isValid) {
                                onSave(formData as CalendarEvent);
                            }
                        }}
                        disabled={!isValid}
                        className="bg-blue-600 text-white font-bold py-2 px-5 rounded-xl hover:bg-blue-700 transition shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span>💾</span>
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditEventModal;