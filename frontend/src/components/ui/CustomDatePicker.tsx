import React, { useState, useRef, useEffect } from 'react';

interface CustomDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializa a data visível no calendário
  const parseInitialDate = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return { year, month: month - 1, day };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  };

  const initial = parseInitialDate();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // Sincroniza visão se o valor externo mudar
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-').map(Number);
      setViewYear(year);
      setViewMonth(month - 1);
    }
  }, [value]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Se tiver menos de 340px abaixo e mais espaço acima, abre para cima
      setOpenUpwards(spaceBelow < 340 && spaceAbove > 260);
      setAlignRight(window.innerWidth - rect.left < 310);
    }
    setIsOpen((prev) => !prev);
  };

  // Formatação de exibição amigável (DD/MM/AAAA)
  const formatDisplay = (val: string) => {
    if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return '';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewYear((prev) => prev + 1);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const yStr = viewYear.toString();
    const mStr = (viewMonth + 1).toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    const selectedIso = `${yStr}-${mStr}-${dStr}`;
    onChange(selectedIso);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const yStr = now.getFullYear().toString();
    const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const dStr = now.getDate().toString().padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  // Cálculo da grade do mês
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthPadding = Array.from({ length: firstDayOfWeek }, (_, i) => daysInPrevMonth - firstDayOfWeek + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalGridSlots = prevMonthPadding.length + currentMonthDays.length;
  const nextMonthPadding = Array.from({ length: (7 - (totalGridSlots % 7)) % 7 }, (_, i) => i + 1);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const isSelected = (day: number) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };

  return (
    <div
      ref={containerRef}
      className={`custom-datepicker-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Campo Trigger */}
      <div
        className={`custom-datepicker-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
      >
        <span className={`datepicker-text ${!value ? 'placeholder' : ''}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <svg
          className="datepicker-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.7"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
          />
        </svg>
      </div>

      {/* Popover Calendário Tema Dark Opus */}
      {isOpen && (
        <div className={`custom-datepicker-dropdown ${openUpwards ? 'open-upwards' : ''} ${alignRight ? 'align-right' : ''}`}>
          {/* Header do Mês/Ano e Navegação */}
          <div className="datepicker-header">
            <div className="datepicker-nav-group">
              <button
                type="button"
                className="datepicker-nav-btn year"
                onClick={handlePrevYear}
                title="Ano anterior"
              >
                «
              </button>
              <button
                type="button"
                className="datepicker-nav-btn"
                onClick={handlePrevMonth}
                title="Mês anterior"
              >
                ‹
              </button>
            </div>

            <div className="datepicker-title">
              <strong>{MONTH_NAMES[viewMonth]}</strong>
              <span className="datepicker-year-label">{viewYear}</span>
            </div>

            <div className="datepicker-nav-group">
              <button
                type="button"
                className="datepicker-nav-btn"
                onClick={handleNextMonth}
                title="Próximo mês"
              >
                ›
              </button>
              <button
                type="button"
                className="datepicker-nav-btn year"
                onClick={handleNextYear}
                title="Próximo ano"
              >
                »
              </button>
            </div>
          </div>

          {/* Cabeçalho dos Dias da Semana */}
          <div className="datepicker-weekdays">
            {WEEK_DAYS.map((wd, idx) => (
              <span key={idx} className="datepicker-weekday">
                {wd}
              </span>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="datepicker-grid">
            {/* Dias do mês anterior */}
            {prevMonthPadding.map((d, i) => (
              <span key={`prev-${i}`} className="datepicker-day outside">
                {d}
              </span>
            ))}

            {/* Dias do mês atual */}
            {currentMonthDays.map((d) => {
              const sel = isSelected(d);
              const tod = isToday(d);
              return (
                <button
                  type="button"
                  key={`day-${d}`}
                  className={`datepicker-day current ${sel ? 'selected' : ''} ${tod ? 'today' : ''}`}
                  onClick={() => handleSelectDay(d)}
                >
                  {d}
                </button>
              );
            })}

            {/* Dias do próximo mês */}
            {nextMonthPadding.map((d, i) => (
              <span key={`next-${i}`} className="datepicker-day outside">
                {d}
              </span>
            ))}
          </div>

          {/* Rodapé com Atalhos Rápidos */}
          <div className="datepicker-footer">
            <button
              type="button"
              className="datepicker-quick-btn"
              onClick={handleSelectToday}
            >
              Hoje
            </button>
            {value && !required && (
              <button
                type="button"
                className="datepicker-quick-btn clear"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
