// src/components/SearchBar.tsx
import React from "react";

interface SearchBarProps {
    query: string;
    setQuery: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery }) => {
    return (
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por asunto o EXP. MESA DE PARTES..."
            className="w-full sm:w-96 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 e"
        />
    );
};

export default SearchBar;
