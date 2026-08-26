"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  priceText?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    (option.group && option.group.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(o => o.value === value);

  // Group the filtered options
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || '';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const hasGroups = Object.keys(groupedOptions).some(key => key !== '');

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-left focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-outline-variant/60'
        }`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-on-surface-variant' : 'text-on-surface'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-container border border-outline-variant/30 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-outline-variant/20 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-2 pl-9 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">
                No results found.
              </div>
            ) : hasGroups ? (
              Object.entries(groupedOptions).map(([group, opts]) => (
                <div key={group} className="mb-2">
                  {group && (
                    <div className="px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-wider bg-surface-container-highest/50 sticky top-0 z-10">
                      {group}
                    </div>
                  )}
                  {opts.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors ${
                        option.value === value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-on-surface hover:bg-surface-container-highest'
                      }`}
                    >
                      <span className="truncate pr-4">{option.label}</span>
                      {option.priceText && (
                        <span className="text-xs text-on-surface-variant font-mono whitespace-nowrap">
                          {option.priceText}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors ${
                    option.value === value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
