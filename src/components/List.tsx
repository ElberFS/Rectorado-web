import React, { useEffect, useState } from "react";
import type { SheetRow } from "../services/useGoogleSheetService";
import { useSheetService } from "../services/GoogleSheetProvider";
import DataTable from "./DataTable";

const List: React.FC = () => {
    const { data, error, listData, addDerivationToRow } = useSheetService();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Filtrar
    const filteredData = data.filter((row: SheetRow) => {
        const asunto = row["asunto"]?.toLowerCase() || "";
        const exp = row["exp. mesa de partes / sec. gen."]?.toLowerCase() || "";
        return (
            asunto.includes(searchTerm.toLowerCase()) ||
            exp.includes(searchTerm.toLowerCase())
        );
    });

    // Revertir para mostrar último registro primero
    const reversedData = [...filteredData].reverse();

    return (
        <div className="p-0">
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Buscar por Asunto o Exp. Mesa de Partes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-lg w-1/2 text-sm dark:bg-gray-800 dark:text-gray-200"
                />
                <button
                    onClick={listData}
                    className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition font-medium text-sm"
                >
                    Recargar ({data.length} filas)
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-0">
                <DataTable
                    rows={reversedData}
                    expandedRow={expandedRow}
                    onToggleRow={(index) =>
                        setExpandedRow(expandedRow === index ? null : index)
                    }
                    onAddDerivation={(reversedIndex, value) => {
                        // ⭐️ CORRECCIÓN CLAVE: Encontrar la fila en el array NO revertido
                        const rowToUpdate = reversedData[reversedIndex];
                        const originalIndex = data.findIndex(
                            (r) => r === rowToUpdate
                        );

                        if (originalIndex === -1) {
                            throw new Error("Fila original no encontrada para actualizar.");
                        }

                        // originalIndex es base 0 y corresponde a la fila de datos (después de la cabecera)
                        return addDerivationToRow(originalIndex, value);
                    }}
                />
            </div>
        </div>
    );
};

export default List;