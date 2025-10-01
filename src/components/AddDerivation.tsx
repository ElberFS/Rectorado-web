import React, { useState } from "react";

interface AddDerivationProps {
    onAdd: (value: string) => void;
    disabled?: boolean;
}

const AddDerivation: React.FC<AddDerivationProps> = ({ onAdd, disabled = false }) => {
    const [value, setValue] = useState("");

    const handleAdd = () => {
        if (value.trim() !== "" && !disabled) {
            onAdd(value);
            setValue("");
        }
    };

    return (
        <div className="flex items-center space-x-2 mt-2">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nueva derivación..."
                className={`flex-1 px-3 py-2 border rounded-lg text-sm  ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={disabled}
            />
            <button
                onClick={handleAdd}
                className={`px-3 py-2 text-white rounded-lg text-sm ${disabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                disabled={disabled}
            >
                {disabled ? '...' : '+'}
            </button>
        </div>
    );
};

export default AddDerivation;