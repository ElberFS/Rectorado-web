// src/components/EditDocument.tsx
import React, { useState, useRef } from 'react';

export interface EditDocumentData {
    fecha: string;
    'exp. mesa de partes / sec. gen.': string;
    'dependencia / usuario': string;
    asunto: string;
}

interface EditDocumentProps {
    initialData: EditDocumentData;  
    onEditRow: (data: EditDocumentData, file?: File) => Promise<void>;
    disabled: boolean;
    onSuccess?: () => void;          
    currentFileName?: string;
}

// Función para convertir fecha DD/MM/YYYY a YYYY-MM-DD
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    // Si ya está en formato YYYY-MM-DD, retornar tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    
    // Convertir de DD/MM/YYYY a YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
};

// Función para convertir de YYYY-MM-DD a DD/MM/YYYY para guardar
const formatDateForSave = (dateString: string): string => {
    if (!dateString) return '';
    
    // Si está en formato DD/MM/YYYY, retornar tal cual
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    
    // Convertir de YYYY-MM-DD a DD/MM/YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }
    
    return dateString;
};

const EditDocument: React.FC<EditDocumentProps> = ({ 
    initialData, 
    onEditRow, 
    disabled, 
    onSuccess,
    currentFileName 
}) => {
    // Formatear la fecha inicial para el input
    const [formData, setFormData] = useState<EditDocumentData>({
        ...initialData,
        fecha: formatDateForInput(initialData.fecha)
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convertir la fecha de vuelta al formato DD/MM/YYYY para guardar
        const dataToSave = {
            ...formData,
            fecha: formatDateForSave(formData.fecha)
        };

        const fields = [
            dataToSave.fecha,
            dataToSave['exp. mesa de partes / sec. gen.'],
            dataToSave['dependencia / usuario'],
            dataToSave.asunto
        ];

        if (fields.some(val => val.trim() === '')) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }

        setIsSaving(true);
        try {
            await onEditRow(dataToSave, selectedFile || undefined);
            onSuccess?.(); 
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">
                ✏️ Editar Documento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                <div>
                    <label htmlFor="fecha" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        FECHA
                    </label>
                    <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="exp" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        EXP. MESA DE PARTES
                    </label>
                    <input
                        type="text"
                        id="exp"
                        name="exp. mesa de partes / sec. gen."
                        value={formData['exp. mesa de partes / sec. gen.']}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="dependencia" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        DEPENDENCIA / USUARIO
                    </label>
                    <input
                        type="text"
                        id="dependencia"
                        name="dependencia / usuario"
                        value={formData['dependencia / usuario']}
                        onChange={handleChange}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="asunto" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        ASUNTO
                    </label>
                    <textarea
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        rows={3}
                        disabled={isOperationDisabled}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg resize-none transition focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* 👇 Nuevo campo para archivos en edición */}
                <div className="md:col-span-2">
                    <label htmlFor="file" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        ACTUALIZAR ARCHIVO PDF (opcional)
                    </label>
                    {currentFileName && (
                        <p className="text-sm text-gray-600 mb-2">
                            Archivo actual: <span className="font-medium">{currentFileName}</span>
                        </p>
                    )}
                    <input
                        type="file"
                        id="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isOperationDisabled}
                        className="w-full text-sm text-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Selecciona un nuevo archivo solo si quieres reemplazar el actual
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isOperationDisabled}
                className={`w-full py-3 px-4 rounded-xl text-lg text-white font-bold transition-all shadow-lg hover:shadow-xl ${
                    isOperationDisabled
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