'use client';

import { useState, useEffect, useRef } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestionsUrl?: string;
  suggestions?: string[];
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Escribe y presiona Enter',
  suggestionsUrl,
  suggestions,
  maxTags = 10,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [allSuggestions, setAllSuggestions] = useState<string[]>(suggestions || []);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar sugerencias del API
  useEffect(() => {
    if (suggestionsUrl) {
      loadSuggestions();
    }
  }, [suggestionsUrl]);

  const loadSuggestions = async () => {
    if (!suggestionsUrl) return;
    setLoading(true);
    try {
      const res = await fetch(suggestionsUrl);
      if (res.ok) {
        const data = await res.json();
        setAllSuggestions(data);
      }
    } catch (err) {
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar sugerencias según input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const query = input.toLowerCase().trim();
    const filtered = allSuggestions
      .filter(
        (tag) =>
          tag.toLowerCase().includes(query) && // Coincide con el texto
          !tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()) // No está ya seleccionada
      )
      .slice(0, 8); // Máximo 8 sugerencias

    setFilteredSuggestions(filtered);
  }, [input, allSuggestions, tags]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    if (tags.length >= maxTags) return;
    if (tags.map((t) => t.toLowerCase()).includes(cleanTag.toLowerCase())) return;

    onChange([...tags, cleanTag]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      } else {
        addTag(input);
      }
    } else if (e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full">
      {/* Tags seleccionados */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a472a] text-white text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-200 transition-colors"
                title="Eliminar"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input con autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : 'Agregar más...'}
            className="flex-1 px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm"
            maxLength={50}
            disabled={tags.length >= maxTags}
          />
          <button
            type="button"
            onClick={() => {
              if (showSuggestions && filteredSuggestions.length > 0) {
                addTag(filteredSuggestions[0]);
              } else {
                addTag(input);
              }
            }}
            disabled={!input.trim() || tags.length >= maxTags}
            className="px-4 py-2 bg-[#f8f9fa] border border-[#dee2e6] rounded-lg hover:bg-[#e9ecef] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Agregar'}
          </button>
        </div>

        {/* Dropdown de sugerencias */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-[#dee2e6] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((tag, index) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-[#f8f9fa] transition-colors flex items-center justify-between group"
              >
                <span>{tag}</span>
                <span className="text-xs text-[#868e96] opacity-0 group-hover:opacity-100 transition-opacity">
                  Agregar
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {showSuggestions && input.trim() && filteredSuggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-[#dee2e6] rounded-lg shadow-lg p-3">
            <p className="text-sm text-[#868e96] text-center">
              No hay sugerencias. Presiona Enter para crear "{input.trim()}"
            </p>
          </div>
        )}
      </div>

      {/* Contador */}
      <p className="text-xs text-[#868e96] mt-2">
        {tags.length}/{maxTags} etiquetas
        {allSuggestions.length > 0 && (
          <span className="ml-2">
            ({allSuggestions.length} disponibles)
          </span>
        )}
      </p>
    </div>
  );
}
