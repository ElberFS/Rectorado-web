// src/components/ExpandableText.tsx (Final)
import React, { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    limit?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, limit = 250 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text || text.length <= limit) {
        return <span className="text-gray-800 dark:text-gray-300 break-words align-middle">{text}</span>;
    }

    const truncatedText = text.substring(0, limit).trim() + (text.length > limit ? '...' : '');
    const displayText = isExpanded ? text : truncatedText;

    return (
        <div className="flex flex-col">
            <span className={`text-gray-800 dark:text-gray-300 text-sm break-words`}>
                {displayText}
            </span>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="self-start mt-1 text-blue-400 hover:text-blue-500 font-semibold text-xs transition duration-150 underline"
                title={isExpanded ? "Ocultar detalles" : "Mostrar detalles completos"}
            >
                {isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
        </div>
    );
};

export default ExpandableText;