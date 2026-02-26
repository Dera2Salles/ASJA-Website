import React from 'react';

interface PromptSuggestionsProps {
    onSelect: (text: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelect }) => {
    const suggestions: string[] = [
        'Quels sont les frais de scolarité ?',
        "Quels documents faut-il pour l'inscription ?",
        'Comment contacter le service de la scolarité ?',
    ];

    return (
        <div className="p-3 pt-2">
            <h4 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(s)}
                        className="cursor-pointer rounded-full border px-3 py-2 text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-700"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PromptSuggestions;
