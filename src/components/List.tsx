// src/components/List.tsx (Tal como lo proporcionaste, es correcto)
import React, { useEffect, useState } from "react";
import type { SheetRow } from "../services/useGoogleSheetService";
import { useSheetService } from "../services/GoogleSheetProvider";
import ExpandableText from "./ExpandableText";

// Definición de las columnas con anchos fijos y adaptativos (table-fixed)
const DISPLAY_COLUMNS = [
    { key: "fecha", label: "FECHA", width: "w-20" },
    { key: "exp. mesa de partes / sec. gen.", label: "EXP. MESA DE PARTES", width: "w-32" },
    { key: "dependencia / usuario", label: "DEPENDENCIA / USUARIO", width: "min-w-64" },
    { key: "asunto", label: "ASUNTO", width: "min-w-[400px] flex-1" },
];

const List: React.FC = () => {
    const { isSignedIn, data, error, listData, signOut } = useSheetService();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        if (isSignedIn) listData();
    }, [isSignedIn, listData]);

    // --- Lógica de Manejo de Estados (Carga, Error, Sesión) ---
    if (!isSignedIn) {
        return (
            <div className="text-center p-10 text-red-600 dark:text-red-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Sesión expirada. Por favor, vuelva a iniciar sesión.
            </div>
        );
    }

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
            <div className="text-center p-10 text-blue-600 dark:text-blue-400">Cargando datos...</div>
        );
    }

    // --- Lógica de Paginación ---
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedRows = data.slice(startIndex, startIndex + rowsPerPage);

    const goToNextPage = () => setCurrentPage(p => p < totalPages ? p + 1 : p);
    const goToPrevPage = () => setCurrentPage(p => p > 1 ? p - 1 : p);

    return (
        <div className="p-0">

            {/* Botones de acción: Fluyen con el contenido */}
            <div className="flex justify-end space-x-4 mb-6">
                <button
                    onClick={listData}
                    className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition font-medium text-sm"
                >
                    Recargar ({data.length} filas)
                </button>
                <button
                    onClick={signOut}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition font-medium text-sm"
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* Contenedor principal de Tabla y Paginación (con bordes redondeados) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-0">

                <div className="overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-700 table-fixed bg-white dark:bg-gray-900">

                        {/* ENCABEZADO: Fluye con la tabla (no sticky) */}
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                {DISPLAY_COLUMNS.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${col.width}`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedRows.map((row: SheetRow, index: number) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 even:bg-gray-50 dark:even:bg-gray-900"
                                >
                                    {DISPLAY_COLUMNS.map((col) => (
                                        <td
                                            key={`${index}-${col.key}`}
                                            className="px-6 py-4 text-sm dark:text-gray-300 align-top"
                                        >
                                            {col.key === "asunto" ? (
                                                <ExpandableText
                                                    text={row[col.key] || "N/A"}
                                                    limit={250} // Límite de 250 caracteres
                                                />
                                            ) : (
                                                <div className="break-words font-medium">
                                                    {row[col.key]}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex justify-between items-center mt-0 p-4 border-t border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Página {currentPage} de {totalPages}.
                    </p>
                    <div className="space-x-3">
                        <button
                            disabled={currentPage === 1}
                            onClick={goToPrevPage}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${currentPage === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                                }`}
                        >
                            Anterior
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={goToNextPage}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${currentPage === totalPages
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-800 hover:bg-gray-900 text-white"
                                }`}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default List;