'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from './icons';
import { Card } from './card';

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestionsUrl?: string;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

export function TagSelector({
  tags,
  onChange,
  suggestionsUrl,
  suggestions = [],
  placeholder = 'Buscar o crear etiqueta...',
  maxTags = 10,
}: TagSelectorProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allSuggestions, setAllSuggestions] = useState<string[]>(suggestions);
  const loadedRef = useRef(false);

  // Cargar sugerencias del API solo una vez al montar
  useEffect(() => {
    if (!suggestionsUrl) return;
    if (loadedRef.current) return; // Evitar doble carga
    loadedRef.current = true;

    const loadSuggestions = async () => {
      try {
        const res = await fetch(suggestionsUrl);
        if (res.ok) {
          const data = await res.json();
          setAllSuggestions(data);
        }
      } catch (err) {
        console.error('Error loading suggestions:', err);
      }
    };

    loadSuggestions();
  }, [suggestionsUrl]);

  // Filtrar sugerencias
  const filteredSuggestions = allSuggestions.filter(
    (t) =>
      t.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(t.toLowerCase())
  );

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      {/* Input para buscar/crear etiquetas */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (input.trim()) addTag(input);
            }
            if (e.key === ',') {
              e.preventDefault();
              if (input.trim()) addTag(input.replace(',', ''));
            }
            if (e.key === 'Backspace' && !input && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
          className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] placeholder:text-[#adb5bd]"
        />

        {/* Panel de sugerencias como burbujas */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Card padding="sm" className="absolute z-10 w-full mt-1 shadow-lg border border-[#dee2e6]">
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 30).map((t) => (
                <button
                  key={t}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(t);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-full border border-[#dee2e6] text-[#495057] hover:bg-[#f8f9fa] hover:border-[#1a472a] hover:text-[#1a472a] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Opción para crear nueva etiqueta */}
        {showSuggestions && input.trim() && !allSuggestions.some(t => t.toLowerCase() === input.toLowerCase().trim()) && (
          <Card padding="sm" className="absolute z-10 w-full mt-1 shadow-lg border border-[#dee2e6]">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(input);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1a472a] hover:bg-[#f8f9fa] rounded-lg transition-colors"
            >
              <Icon.Plus className="w-4 h-4" />
              Crear "{input.trim()}"
            </button>
          </Card>
        )}
      </div>

      {/* Etiquetas seleccionadas */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-1 bg-[#1a472a] text-white text-xs rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-[#ffb3b3] transition-colors"
              >
                <Icon.Close className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Contador */}
      <p className="text-xs text-[#adb5bd] mt-1.5">
        {tags.length}/{maxTags} etiquetas
        {allSuggestions.length > 0 && (
          <span className="ml-1">({allSuggestions.length} disponibles)</span>
        )}
      </p>
    </div>
  );
}
