import React, { useState } from "react";
import type { SheetRow } from "../services/useGoogleSheetService";
import ExpandableText from "./ExpandableText";
import AddDerivation from "./AddDerivation";
import ConfirmationModal from "./ConfirmationModal";
import EditDocument from "./EditDocument";


interface EditingState {
    rowIndex: number;
    key: string;
    currentValue: string;
}

interface DeletingState {
    rowIndex: number;
    key: string;
    label: string;
}

interface DerivationItem {
    key: string;
    value: string;
}

interface DocumentEditingState {
    rowIndex: number;
    formData: {
        fecha: string;
        'exp. mesa de partes / sec. gen.': string;
        'dependencia / usuario': string;
        asunto: string;
    };
}


interface DataTableProps {
    rows: SheetRow[];
    expandedRow: number | null;
    onToggleRow: (index: number) => void;
    onAddDerivation: (rowIndex: number, value: string) => Promise<void>;
    onEditDerivation: (rowIndex: number, key: string, newValue: string) => Promise<void>;
    onDeleteDerivation: (rowIndex: number, key: string) => Promise<void>;
    onEditCell: (rowIndex: number, key: string, newValue: string) => Promise<void>;
}

const DISPLAY_COLUMNS = [
    // CAMBIO CLAVE: Ocultar 'fecha' en móvil (hidden) y mostrar desde 'sm' (sm:table-cell).
    { key: "fecha", label: "FECHA", width: "w-16 hidden sm:table-cell" }, 
    {
        key: "exp. mesa de partes / sec. gen.",
        // CAMBIO CLAVE: Ocultar en móvil (hidden) y mostrar desde 'sm' (sm:table-cell).
        label: "EXP. MESA DE PARTES",
        width: "w-32 hidden sm:table-cell",
    },
    { 
        key: "dependencia / usuario", 
        label: "DEPENDENCIA / USUARIO", 
        // CAMBIO CLAVE: Ocultar en móvil (hidden) y mostrar desde 'md' (md:table-cell).
        width: "min-w-64 hidden md:table-cell" 
    },
    // COLUMNA PRINCIPAL (ASUNTO): visible siempre, ocupa todo el espacio restante.
    { key: "asunto", label: "ASUNTO", width: "min-w-[180px] flex-1" },
];

const DataTable: React.FC<DataTableProps> = ({ rows, expandedRow, onToggleRow, onAddDerivation, onEditDerivation, onDeleteDerivation, onEditCell }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isAdding, setIsAdding] = useState<number | null>(null);
    const [editing, setEditing] = useState<EditingState | null>(null);
    const [deleting, setDeleting] = useState<DeletingState | null>(null);
    const [docEditing, setDocEditing] = useState<DocumentEditingState | null>(null);
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

    const handleEditSave = async () => {
        if (!editing) return;

        const { rowIndex, key, currentValue } = editing;

        if (currentValue.trim() === "") {
            alert("La derivación no puede estar vacía.");
            return;
        }

        try {
            await onEditDerivation(rowIndex, key, currentValue);
            setEditing(null);
        } catch (error) {
            console.error("Error al editar:", error);
            alert("Error al guardar la edición. Inténtalo de nuevo.");
        }
    };

    const confirmDelete = (rowIndex: number, key: string, label: string) => {
        setDeleting({ rowIndex, key, label });
    };

    const cancelDelete = () => {
        setDeleting(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleting) return;

        const { rowIndex, key } = deleting;
        setDeleting(null);

        try {
            await onDeleteDerivation(rowIndex, key);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar la derivación. Inténtalo de nuevo.");
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
                                    // CAMBIO CLAVE: Usa col.width para ocultar las celdas de encabezado.
                                    className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider ${col.width}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {/* Ajuste de ancho para la columna de acciones */}
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider w-24">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedRows.map((row: SheetRow, index: number) => {
                            const rowIndex = startIndex + index;
                            const isExpanded = expandedRow === rowIndex;
                            const addingState = isAdding === rowIndex;

                            const derivations: DerivationItem[] = Object.keys(row)
                                .filter((key) => key.toLowerCase().includes("derivado"))
                                .filter((key) => row[key] && row[key].trim() !== "")
                                .map((key) => ({ key, value: row[key] }));

                            return (
                                <React.Fragment key={rowIndex}>
                                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 even:bg-gray-50 dark:even:bg-gray-900">
                                        {DISPLAY_COLUMNS.map((col) => (
                                            <td
                                                key={`${rowIndex}-${col.key}`}
                                                // Clase de padding reducida a px-3 para móvil
                                                // CAMBIO CLAVE: Usa col.width para que las celdas del cuerpo se oculten.
                                                className={`px-3 py-4 dark:text-gray-300 align-top ${col.width} whitespace-normal ${col.key === 'fecha' ? 'text-xs' : 'text-sm'}`}
                                            >
                                                {col.key === "asunto" ? (
                                                    // Ya usa ExpandableText para evitar el desborde
                                                    <ExpandableText text={row[col.key] || "N/A"} limit={250} />
                                                ) : (
                                                    <div className="break-words font-medium">
                                                        {/* Se mantiene el texto para las demás columnas (aunque estará oculto en móvil por la clase de arriba) */}
                                                        {row[col.key]}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-3 py-4">
                                            {/* Los botones de acción siempre se muestran */}
                                            <div className="flex flex-col gap-1 md:gap-2 justify-start items-center">
                                                <button
                                                    onClick={() => onToggleRow(rowIndex)}
                                                    
                                                    className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition text-xs font-semibold whitespace-nowrap"
                                                >
                                                    
                                                    <span className="sm:hidden">
                                                        {isExpanded ? "➖" : "➕"}
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        {isExpanded ? "Ocultar" : "Ver Derivados"}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setDocEditing({
                                                            rowIndex,
                                                            formData: {
                                                                fecha: row.fecha || "",
                                                                "exp. mesa de partes / sec. gen.": row["exp. mesa de partes / sec. gen."] || "",
                                                                "dependencia / usuario": row["dependencia / usuario"] || "",
                                                                asunto: row.asunto || "",
                                                            },
                                                        })
                                                    }
                                                    className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition text-xs font-semibold whitespace-nowrap"
                                                >
                                                    {/* Ícono visible solo en móvil, texto visible desde 'sm' */}
                                                    <span className="sm:hidden">
                                                        📝
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        ✏️ Editar
                                                    </span>
                                                </button>
                                            </div>

                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr>
                                            <td 
                                                colSpan={DISPLAY_COLUMNS.length + 1} 
                                                className="bg-gray-50 dark:bg-gray-800 px-6 py-6"
                                            >
                                                {derivations.length === 0 ? (
                                                    <p className="text-gray-600 dark:text-gray-400">No hay derivaciones registradas.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {derivations.map((d, i) => (
                                                            editing?.rowIndex === rowIndex && editing.key === d.key ? (
                                                                <div key={i} className="flex space-x-2 p-4 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 rounded-lg">
                                                                    <input
                                                                        type="text"
                                                                        value={editing.currentValue}
                                                                        onChange={(e) => setEditing({ ...editing, currentValue: e.target.value })}
                                                                        className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-white dark:bg-gray-700"
                                                                    />
                                                                    <button
                                                                        onClick={handleEditSave}
                                                                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                                                                    >
                                                                        Guardar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditing(null)}
                                                                        className="bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition text-sm font-semibold"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    key={i}
                                                                    className="border-l-4 border-blue-600 bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 flex justify-between items-start"
                                                                >
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                                                        <span className="font-semibold text-blue-700 dark:text-blue-400">
                                                                            {d.key.replace(/_/g, " ")}:
                                                                        </span>{" "}
                                                                        {d.value}
                                                                    </p>
                                                                    <div className="flex space-x-2 ml-4">
                                                                        <button
                                                                            onClick={() => setEditing({ rowIndex, key: d.key, currentValue: d.value })}
                                                                            className="text-yellow-600 hover:text-yellow-800 transition p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                                            title="Editar"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={() => confirmDelete(rowIndex, d.key, d.value)}
                                                                            className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                                            title="Eliminar"
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}

                                                {addingState && (
                                                    <p className="text-blue-500 dark:text-blue-400 mt-2 font-semibold">Guardando derivación... ⏳</p>
                                                )}

                                                <AddDerivation
                                                    disabled={addingState || editing !== null || deleting !== null}
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
            {docEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full p-6 relative">
                        <button
                            onClick={() => setDocEditing(null)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                            ✖
                        </button>

                        <EditDocument
                            initialData={docEditing.formData}
                            disabled={false}
                            onEditRow={async (updatedData) => {
                                try {
                                    const updatePromises = Object.keys(updatedData).map(key =>
                                        onEditCell(
                                            docEditing.rowIndex,
                                            key,
                                            updatedData[key as keyof typeof updatedData]
                                        )
                                    );
                                    await Promise.all(updatePromises);
                                    setDocEditing(null); 
                                } catch (err) {
                                    console.error("Error al guardar cambios del documento:", err);
                                    alert("Error al guardar cambios.");
                                }
                            }}
                            onSuccess={() => setDocEditing(null)}
                        />
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleting !== null}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar la derivación "${deleting?.label || 'seleccionada'}"? Esta acción no se puede deshacer.`}
                onConfirm={handleConfirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
};

export default DataTable;