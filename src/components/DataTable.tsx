import React, { useState } from "react";
import type { SheetRow } from "../services/useGoogleSheetService";
import ExpandableText from "./ExpandableText";
import AddDerivation from "./AddDerivation";


interface DataTableProps {
    rows: SheetRow[];
    expandedRow: number | null;
    onToggleRow: (index: number) => void;
    onAddDerivation: (rowIndex: number, value: string) => Promise<void>;
}

const DISPLAY_COLUMNS = [
    { key: "fecha", label: "FECHA", width: "w-20" },
    {
        key: "exp. mesa de partes / sec. gen.",
        label: "EXP. MESA DE PARTES",
        width: "w-32",
    },
    { key: "dependencia / usuario", label: "DEPENDENCIA / USUARIO", width: "min-w-64" },
    { key: "asunto", label: "ASUNTO", width: "min-w-[400px] flex-1" },
];

const DataTable: React.FC<DataTableProps> = ({ rows, expandedRow, onToggleRow, onAddDerivation }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isAdding, setIsAdding] = useState<number | null>(null);
    const rowsPerPage = 10;

    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedRows = rows.slice(startIndex, startIndex + rowsPerPage);

    const goToNextPage = () => setCurrentPage((p) => (p < totalPages ? p + 1 : p));
    const goToPrevPage = () => setCurrentPage((p) => (p > 1 ? p - 1 : p));

    const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1 && value <= totalPages) {
            setCurrentPage(value);
        }
    };

    const handleAddDerivation = async (rowIndex: number, value: string) => {
        setIsAdding(rowIndex);
        try {
            await onAddDerivation(rowIndex, value);
        } catch (error) {
            console.error("Error al añadir derivación:", error);
            alert("Error al guardar la derivación. Inténtalo de nuevo.");
        } finally {
            setIsAdding(null);
        }
    };

    return (
        <>
            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-700 table-fixed bg-white dark:bg-gray-900">
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
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-24">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedRows.map((row: SheetRow, index: number) => {
                            const rowIndex = startIndex + index;
                            const isExpanded = expandedRow === rowIndex;
                            const addingState = isAdding === rowIndex;

                            // derivaciones con contenido
                            const derivations = Object.keys(row)
                                .filter((key) => key.toLowerCase().includes("derivado"))
                                .filter((key) => row[key] && row[key].trim() !== "")
                                .map((key) => ({ key, value: row[key] }));

                            return (
                                <React.Fragment key={rowIndex}>
                                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 even:bg-gray-50 dark:even:bg-gray-900">
                                        {DISPLAY_COLUMNS.map((col) => (
                                            <td
                                                key={`${rowIndex}-${col.key}`}
                                                className="px-6 py-4 text-sm dark:text-gray-300 align-top"
                                            >
                                                {col.key === "asunto" ? (
                                                    <ExpandableText text={row[col.key] || "N/A"} limit={250} />
                                                ) : (
                                                    <div className="break-words font-medium">
                                                        {row[col.key]}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onToggleRow(rowIndex)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition text-xs font-semibold"
                                            >
                                                {isExpanded ? "Ocultar" : "Ver Derivados"}
                                            </button>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={DISPLAY_COLUMNS.length + 1} className="bg-gray-50 dark:bg-gray-800 px-6 py-6">
                                                {derivations.length === 0 ? (
                                                    <p className="text-gray-600 dark:text-gray-400">No hay derivaciones registradas.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {derivations.map((d, i) => (
                                                            <div
                                                                key={i}
                                                                className="border-l-4 border-blue-600 bg-white dark:bg-gray-900 shadow-md rounded-lg p-4"
                                                            >
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                                                                        {d.key.replace(/_/g, " ")}:
                                                                    </span>{" "}
                                                                    {d.value}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {addingState && (
                                                    <p className="text-blue-500 dark:text-blue-400 mt-2 font-semibold">Guardando derivación... ⏳</p>
                                                )}

                                                <AddDerivation
                                                    disabled={addingState}
                                                    onAdd={(newValue: string) => {
                                                        handleAddDerivation(rowIndex, newValue);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    )}

                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 📌 Paginación */}
            <div className="flex justify-between items-center mt-0 p-4 border-t border-gray-700">
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

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Página
                    </span>
                    <input
                        type="number"
                        value={currentPage}
                        onChange={handlePageInput}
                        min={1}
                        max={totalPages}
                        className="w-16 px-2 py-1 border rounded text-center text-sm dark:bg-gray-800 dark:text-gray-200"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        de {totalPages}
                    </span>
                </div>

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
        </>
    );
};

export default DataTable;