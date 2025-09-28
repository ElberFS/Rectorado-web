// src/components/ConfirmationModal.tsx
import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden'; 
        } else {
            const timeout = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const overlayClass = isOpen ? 'opacity-100' : 'opacity-0';
    const modalClass = isOpen ? 'scale-100' : 'scale-95';


    return (
        <div className={`fixed inset-0  z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${overlayClass} bg-opacity-50`}>
            <div 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 ${modalClass}`}
                onClick={(e) => e.stopPropagation()} 
            >
                
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b pb-2">
                    {title}
                </h3>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {message}
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;