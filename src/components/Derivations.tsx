// src/components/Derivations.tsx
import React from "react";
import type { SheetRow } from "../services/useGoogleSheetService";

interface Props {
    row: SheetRow;
    onClose: () => void;
}

const Derivations: React.FC<Props> = ({ row, onClose }) => {
    const derivations = Object.keys(row)
    .filter(key => key.toLowerCase().includes("derivado"))
    .filter(key => row[key] && row[key].trim() !== "")
    .map(key => ({ key, value: row[key] }));


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white  p-6 rounded-xl shadow-xl max-w-2xl w-full">
                <h2 className="text-lg font-bold mb-4 ">Derivaciones del Expediente</h2>
                {derivations.length === 0 ? (
                    <p className="text-gray-600 ">No hay derivaciones registradas.</p>
                ) : (
                    <ul className="list-disc list-inside space-y-2">
                        {derivations.map((d, i) => (
                            <li key={i} className="text-gray-800 ">
                                <span className="font-semibold">{d.key}:</span> {d.value}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default Derivations;
