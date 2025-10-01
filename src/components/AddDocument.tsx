// src/components/AddDocument.tsx
import React, { useState, useRef } from 'react';

export interface NewDocumentData {
    fecha: string;
    'exp. mesa de partes / sec. gen.': string;
    'dependencia / usuario': string;
    asunto: string;
}

interface AddDocumentProps {
    onAddRow: (data: NewDocumentData, file?: File) => Promise<void>; 
    disabled: boolean;
    onSuccess?: () => void; 
}

const initialFormData: NewDocumentData = {
    fecha: new Date().toISOString().slice(0, 10), 
    'exp. mesa de partes / sec. gen.': '',
    'dependencia / usuario': '',
    asunto: '',
};

const AddDocument: React.FC<AddDocumentProps> = ({ onAddRow,  disabled, onSuccess }) => {
    const [formData, setFormData] = useState<NewDocumentData>(initialFormData);
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
            // 1) Guardar fila en Sheets
            await onAddRow(formData, selectedFile || undefined);

            

            // Resetear form y archivo
            setFormData(initialFormData); 
            setSelectedFile(null); 
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            onSuccess?.(); 
        } catch (error) {
            console.error("Error al guardar documento:", error);
            alert("Error al guardar el nuevo documento. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    const isOperationDisabled = disabled || isSaving;

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                ➕ Registrar Nuevo Documento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                
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

                {/* 👇 Nuevo campo para PDF */}
                <div className="md:col-span-2">
                    <label htmlFor="file" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        ARCHIVO PDF (opcional)
                    </label>
                    <input
                        type="file"
                        id="file"
                        accept="application/pdf"
                        ref={fileInputRef} // 👈 referencia para reset
                        onChange={handleFileChange}
                        disabled={isOperationDisabled}
                        className="w-full text-sm text-gray-700 dark:text-gray-300"
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
                {isSaving ? 'Guardando... ⏳' : 'Añadir Nuevo Trámite'}
            </button>
            
        </form>
    );
};

export default AddDocument;
