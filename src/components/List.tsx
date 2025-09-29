// src/components/List.tsx

import React, { useEffect, useState } from "react";
import type { SheetRow } from "../services/useGoogleSheetService";
import { useSheetService } from "../services/GoogleSheetProvider";
import DataTable from "./DataTable";
import AddDocument from "./AddDocument";
import type { NewDocumentData } from "./AddDocument";

const List: React.FC = () => {
    const { data, error, listData, addRow, addDerivationToRow, editDerivation, deleteDerivation, editCell } = useSheetService();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        listData();
    }, [listData]);

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl">
                <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                    Error al cargar datos: {error}
                </div>
                <button
                    onClick={listData}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4"
                >
                    Recargar Datos
                </button>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center p-10 text-blue-600 dark:text-blue-400">
                Cargando datos...
            </div>
        );
    }

    const filteredData = data.filter((row: SheetRow) => {
        const asunto = row["asunto"]?.toLowerCase() || "";
        const exp = row["exp. mesa de partes / sec. gen."]?.toLowerCase() || "";
        return (
            asunto.includes(searchTerm.toLowerCase()) ||
            exp.includes(searchTerm.toLowerCase())
        );
    });

    const reversedData = [...filteredData].reverse();

    const handleAddDocument = async (newDoc: NewDocumentData) => {
        
        await addRow(newDoc);
        await listData(); 
        setShowModal(false);
    };

    return (
        <div className="p-0">
            {/* Contenedor principal para la búsqueda y acciones */}
            <div className="mb-6 space-y-4 sm:space-y-0">
                {/* Campo de Búsqueda: ocupa todo el ancho en móvil */}
                <input
                    type="text"
                    placeholder="Buscar por Asunto o Exp. Mesa de Partes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // w-full en móvil, sm:w-1/2 en desktop
                    className="px-4 py-2 border rounded-lg w-full sm:w-1/2 text-sm dark:bg-gray-800 dark:text-gray-200"
                />
                
                {/* Contenedor de Botones: se alinea a la derecha en desktop */}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={listData}
                        className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition font-medium text-sm"
                    >
                        Recargar ({data.length} filas)
                    </button>
                    {/* Ocultar en móviles (hidden sm:flex) */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition font-medium text-sm hidden sm:flex"
                    >
                        ➕ Nuevo Documento
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-0">
                <DataTable
                    rows={reversedData}
                    expandedRow={expandedRow}
                    onToggleRow={(index) =>
                        setExpandedRow(expandedRow === index ? null : index)
                    }
                    onAddDerivation={(reversedIndex, value) => {
                        const rowToUpdate = reversedData[reversedIndex];
                        const originalIndex = data.findIndex((r) => r === rowToUpdate);

                        if (originalIndex === -1) {
                            return Promise.reject(new Error("Fila original no encontrada."));
                        }
                        return addDerivationToRow(originalIndex, value);
                    }}
                    onEditDerivation={(reversedIndex, key, newValue) => {
                        const rowToUpdate = reversedData[reversedIndex];
                        const originalIndex = data.findIndex((r) => r === rowToUpdate);

                        if (originalIndex === -1) {
                            return Promise.reject(new Error("Fila original no encontrada para editar."));
                        }
                        return editDerivation(originalIndex, key, newValue);
                    }}
                    onDeleteDerivation={(reversedIndex, key) => {
                        const rowToUpdate = reversedData[reversedIndex];
                        const originalIndex = data.findIndex((r) => r === rowToUpdate);

                        if (originalIndex === -1) {
                            return Promise.reject(new Error("Fila original no encontrada para eliminar."));
                        }
                        return deleteDerivation(originalIndex, key);
                    }}
                    onEditCell={(reversedIndex, columnKey, newValue) => { 
                        const rowToUpdate = reversedData[reversedIndex];
                        const originalIndex = data.findIndex((r) => r === rowToUpdate);

                        if (originalIndex === -1) {
                            return Promise.reject(new Error("Fila original no encontrada para editar celda."));
                        }
                        return editCell(originalIndex, columnKey, newValue);
                    }}
                />

            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-zinc-50 dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                            ✖
                        </button>
                        <AddDocument
                            onAddRow={handleAddDocument}
                            disabled={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default List;