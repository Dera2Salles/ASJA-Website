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
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(s)}
                        className="cursor-pointer rounded-full border px-3 py-2 text-xs text-muted-foreground transition-colors duration-200 hover:bg-muted"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PromptSuggestions;
