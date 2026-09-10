import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SearchableLocationInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const SearchableLocationInput: React.FC<SearchableLocationInputProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Type or select...',
  icon,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsTyping(false);
        setFilterQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute filtered list of options based on user typing or browsing
  const filteredOptions = useMemo(() => {
    if (!isTyping || !filterQuery.trim()) {
      return options;
    }
    const q = filterQuery.toLowerCase().trim();
    return options.filter(opt => opt.toLowerCase().includes(q));
  }, [options, isTyping, filterQuery]);

  // Handle typing directly in the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setIsTyping(true);
    setFilterQuery(newVal);
    onChange(newVal);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Toggle dropdown on arrow button click
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      setIsTyping(false);
      setFilterQuery('');
    } else {
      setIsTyping(false);
      setFilterQuery('');
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  // Select an option from the dropdown list
  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setIsTyping(false);
    setFilterQuery('');
    inputRef.current?.focus();
  };

  // Handle keyboard keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsTyping(false);
      setFilterQuery('');
    } else if (e.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
        setIsTyping(false);
      }
    } else if (e.key === 'Enter') {
      // If there's an exact match in filtered options, pick it; otherwise keep typed value and close
      if (isOpen && filteredOptions.length > 0 && isTyping) {
        const exact = filteredOptions.find(o => o.toLowerCase() === value.toLowerCase().trim());
        if (exact) {
          onChange(exact);
        }
      }
      setIsOpen(false);
      setIsTyping(false);
      setFilterQuery('');
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Optional Leading Icon */}
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#0EA5A5] z-10">
          {icon}
        </div>
      )}

      {/* Input Field: allows free typing and searching */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (!isOpen) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full ${
          icon ? 'pl-9.5' : 'px-3.5'
        } pr-9 py-2.5 rounded-xl border border-[#D9CFC2] text-sm focus:outline-none focus:border-[#0EA5A5] bg-[#FBF7F2] text-[#1F2937] font-medium transition-colors`}
      />

      {/* Dropdown toggle arrow button */}
      <button
        type="button"
        tabIndex={-1}
        onClick={handleToggleClick}
        title="Browse full list"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#374151] hover:text-[#0EA5A5] transition-colors cursor-pointer"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0EA5A5]' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-white border border-[#D9CFC2] rounded-xl shadow-xl z-50 py-1"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => {
              const isSelected = option.toLowerCase() === value.toLowerCase().trim();
              return (
                <div
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={e => {
                    e.preventDefault(); // Prevents input blur before selection
                    handleSelectOption(option);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#E6F7F7] text-[#0EA5A5] font-semibold'
                      : 'text-[#1F2937] hover:bg-[#FBF7F2]'
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0EA5A5] shrink-0 ml-2" />}
                </div>
              );
            })
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-[#6B7280]">
              <span className="italic">No preset matching "{filterQuery}"</span>
              <p className="mt-0.5 text-[11px] text-[#0EA5A5] font-medium">
                Custom input "{value}" will be used.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
