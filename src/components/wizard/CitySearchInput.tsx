import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Plane, Check } from 'lucide-react';
import { searchCities, CityItem } from '../../data/citiesData';

interface CitySearchInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onSelectCity?: (item: CityItem) => void;
  onSubmitCustom?: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  icon?: 'map-pin' | 'plane';
  helperText?: string;
  excludeCities?: string[];
}

export const CitySearchInput: React.FC<CitySearchInputProps> = ({
  id,
  label,
  value,
  onChange,
  onSelectCity,
  onSubmitCustom,
  placeholder = 'Type to search a city...',
  autoFocus = false,
  icon = 'map-pin',
  helperText,
  excludeCities = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CityItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update suggestions whenever value changes
  useEffect(() => {
    const rawMatches = searchCities(value, 10);
    const filtered = excludeCities.length > 0
      ? rawMatches.filter(
          item =>
            !excludeCities.some(
              ex =>
                ex.toLowerCase().includes(item.city.toLowerCase()) ||
                item.city.toLowerCase().includes(ex.toLowerCase())
            )
        )
      : rawMatches;
    setSuggestions(filtered);
    setHighlightedIndex(-1);
  }, [value, excludeCities]);

  // Click outside listener to close guide bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: CityItem) => {
    const chosenText = `${item.city}, ${item.country}`;
    onChange(chosenText);
    if (onSelectCity) {
      onSelectCity(item);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0 && value.trim()) {
        handleSelect(suggestions[0]);
      } else if (value.trim() && onSubmitCustom) {
        onSubmitCustom(value.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-[#1F2937] mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {isOpen && suggestions.length > 0 && (
            <span className="text-[11px] font-normal text-[#0EA5A5]">
              Select from guided suggestions
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0EA5A5]">
          {icon === 'plane' ? (
            <Plane className="w-4 h-4 transform -rotate-45" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9CFC2] focus:border-[#0EA5A5] focus:ring-2 focus:ring-[#0EA5A5]/20 text-sm font-medium text-[#1F2937] bg-[#FBF7F2] transition-all placeholder:text-[#9CA3AF]"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {helperText && !isOpen && (
        <p className="text-[11px] text-[#4B5563] mt-1">{helperText}</p>
      )}

      {/* Guide Bar / Suggestions Dropdown */}
      {isOpen && (
        <div
          id={`${id}-guide-bar`}
          className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-[#D9CFC2] z-50 overflow-hidden animate-fade-in max-h-72 flex flex-col"
        >
          <div className="px-3.5 py-2 bg-[#F9F6F0] border-b border-[#EFEAE2] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3 h-3 text-[#0EA5A5]" />
              {value.trim() ? `Matching Cities (${suggestions.length})` : 'Popular Travel Hubs'}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">Click city to select</span>
          </div>

          <div className="overflow-y-auto divide-y divide-gray-50 p-1">
            {suggestions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500">No exact match found for "{value}".</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 text-xs font-bold text-[#0EA5A5] hover:underline cursor-pointer"
                >
                  Use custom input: "{value}"
                </button>
              </div>
            ) : (
              suggestions.map((item, idx) => {
                const isExact =
                  value.trim().toLowerCase() === item.city.toLowerCase() ||
                  value.trim().toLowerCase() === item.display.toLowerCase();

                return (
                  <button
                    key={`${item.city}-${item.country}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] transition-colors flex items-center justify-between cursor-pointer group ${
                      isExact || highlightedIndex === idx ? 'bg-[#0EA5A5]/10 ring-1 ring-[#0EA5A5]/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0EA5A5]/10 group-hover:bg-[#0EA5A5] text-[#0EA5A5] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                        {icon === 'plane' ? (
                          <Plane className="w-4 h-4 transform -rotate-45" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0EA5A5] transition-colors flex items-center gap-1.5">
                          <span>{item.city}</span>
                          <span className="text-gray-400 font-normal">•</span>
                          <span className="text-xs font-medium text-gray-600">{item.country}</span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {item.display}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.airport && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-mono font-semibold border border-gray-200">
                          {item.airport}
                        </span>
                      )}
                      {isExact && <Check className="w-4 h-4 text-[#0EA5A5]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
