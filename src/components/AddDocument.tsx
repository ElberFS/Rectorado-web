// src/components/AddDocument.tsx

import React, { useState } from 'react';

export interface NewDocumentData {
    fecha: string;
    'exp. mesa de partes / sec. gen.': string;
    'dependencia / usuario': string;
    asunto: string;
}

interface AddDocumentProps {
    onAddRow: (data: NewDocumentData) => Promise<void>;
    disabled: boolean;
    // Agregamos una prop para cerrar el modal después del éxito (opcional)
    onSuccess?: () => void; 
}

const initialFormData: NewDocumentData = {
    fecha: new Date().toISOString().slice(0, 10), 
    'exp. mesa de partes / sec. gen.': '',
    'dependencia / usuario': '',
    asunto: '',
};

const AddDocument: React.FC<AddDocumentProps> = ({ onAddRow, disabled, onSuccess }) => {
    const [formData, setFormData] = useState<NewDocumentData>(initialFormData);
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
            await onAddRow(formData);
            setFormData(initialFormData); 
            onSuccess?.(); // Llama a la función de éxito para cerrar el modal
        } catch (error) {
            console.error("Error al añadir la fila:", error);
            alert("Error al guardar el nuevo documento. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    const isOperationDisabled = disabled || isSaving;

    // NOTA: EL FONDO NEGRO Y EL ENVOLTORIO DEL MODAL SE HAN ELIMINADO DE AQUÍ.
    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                ➕ Registrar Nuevo Documento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                
                {/* 1. FECHA */}
                <div className="col-span-1">
                    <label htmlFor="fecha" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        FECHA
                    </label>
                    <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* 2. EXP. MESA DE PARTES / SEC. GEN. */}
                <div className="col-span-1">
                    <label htmlFor="exp" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        EXP. MESA DE PARTES
                    </label>
                    <input
                        type="text"
                        id="exp"
                        name="exp. mesa de partes / sec. gen."
                        value={formData['exp. mesa de partes / sec. gen.']}
                        onChange={handleChange}
                        placeholder="Ej: 001-2024"
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* 3. DEPENDENCIA / USUARIO (Ocupa toda la fila en móvil, dos columnas en escritorio) */}
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
                        placeholder="Ej: Gerencia de Planificación"
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* 4. ASUNTO (Ocupa toda la fila) */}
                <div className="md:col-span-2">
                    <label htmlFor="asunto" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        ASUNTO
                    </label>
                    <textarea
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        placeholder="Descripción detallada del asunto"
                        rows={2}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isOperationDisabled}
                className={`w-full py-3 px-4 rounded-xl text-lg text-white font-bold transition-all shadow-lg hover:shadow-xl ${
                    isOperationDisabled
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                {isSaving ? 'Guardando fila... ⏳' : 'Añadir Nuevo Trámite'}
            </button>
            
        </form>
    );
};

export default AddDocument;