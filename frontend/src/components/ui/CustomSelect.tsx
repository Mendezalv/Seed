import React, { useState, useRef, useEffect } from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: {
    text: string;
    className: string;
  };
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (CustomSelectOption | string)[];
  placeholder?: string;
  id?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção...',
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normaliza lista de opções
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-wrapper ${className}`} ref={containerRef} id={id}>
      <div
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-label">
          {selectedOption ? (
            <>
              {selectedOption.badge && (
                <span className={`focus-badge ${selectedOption.badge.className}`} style={{ fontSize: '10px' }}>
                  {selectedOption.badge.text}
                </span>
              )}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </span>
        <svg
          className="trigger-chevron"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      <div className={`custom-select-dropdown ${isOpen ? 'open' : ''}`} role="listbox">
        {normalizedOptions.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div
              key={opt.value}
              className={`custom-select-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
              role="option"
              aria-selected={isSelected}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {opt.badge && (
                  <span className={`focus-badge ${opt.badge.className}`} style={{ fontSize: '10px' }}>
                    {opt.badge.text}
                  </span>
                )}
                <span>{opt.label}</span>
              </div>
              <svg className="item-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
