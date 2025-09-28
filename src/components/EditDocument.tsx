// src/components/EditDocument.tsx

import React, { useState } from 'react';


export interface EditDocumentData {
    fecha: string;
    'exp. mesa de partes / sec. gen.': string;
    'dependencia / usuario': string;
    asunto: string;
}

interface EditDocumentProps {
    initialData: EditDocumentData;   // Datos actuales de la fila
    onEditRow: (data: EditDocumentData) => Promise<void>;
    disabled: boolean;
    onSuccess?: () => void;          // Para cerrar modal o refrescar después del éxito
}

const EditDocument: React.FC<EditDocumentProps> = ({ initialData, onEditRow, disabled, onSuccess }) => {
    const [formData, setFormData] = useState<EditDocumentData>(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fields = [
            formData.fecha,
            formData['exp. mesa de partes / sec. gen.'],
            formData['dependencia / usuario'],
            formData.asunto
        ];

        if (fields.some(val => val.trim() === '')) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }

        setIsSaving(true);
        try {
            await onEditRow(formData);
            onSuccess?.(); // cerrar modal o refrescar tabla
        } catch (error) {
            console.error("Error al editar la fila:", error);
            alert("Error al guardar los cambios. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    const isOperationDisabled = disabled || isSaving;

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                ✏️ Editar Documento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                {/* FECHA */}
                <div>
                    <label htmlFor="fecha" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        FECHA
                    </label>
                    <input
                        type="text"   
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition focus:ring-blue-500 focus:border-blue-500"
                    />

                </div>

                {/* EXP */}
                <div>
                    <label htmlFor="exp" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        EXP. MESA DE PARTES
                    </label>
                    <input
                        type="text"
                        id="exp"
                        name="exp. mesa de partes / sec. gen."
                        value={formData['exp. mesa de partes / sec. gen.']}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* DEPENDENCIA */}
                <div className="md:col-span-2">
                    <label htmlFor="dependencia" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        DEPENDENCIA / USUARIO
                    </label>
                    <input
                        type="text"
                        id="dependencia"
                        name="dependencia / usuario"
                        value={formData['dependencia / usuario']}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* ASUNTO */}
                <div className="md:col-span-2">
                    <label htmlFor="asunto" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        ASUNTO
                    </label>
                    <textarea
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        rows={3}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isOperationDisabled}
                className={`w-full py-3 px-4 rounded-xl text-lg text-white font-bold transition-all shadow-lg hover:shadow-xl ${isOperationDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isSaving ? 'Guardando cambios... ⏳' : 'Guardar Cambios'}
            </button>
        </form>
    );
};

export default EditDocument;
