import React, { useRef, useEffect } from 'react';
import { Check, Plus } from 'lucide-react';

export const GOOGLE_CALENDAR_COLORS = [
  '#d04760', '#e86b36', '#f1be42', '#3f9b69', '#6077be', '#9c54b6',
  '#e2536b', '#f27b40', '#c3d258', '#389d8d', '#7986cb', '#9f7560',
  '#e65100', '#f5a623', '#7cb342', '#1e88e5', '#b39ddb', '#757575',
  '#e57373', '#fbc02d', '#4caf50', '#5c6bc0', '#ab47bc', '#a1887f'
];

export default function CalendarColorMenu({
  calendar,
  onClose,
  onSelectColor,
  onColorChange,
  onSoloView,
  onSolo,
  onDelete,
  onSettings
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleColorPick = (col) => {
    if (onColorChange) onColorChange(col);
    if (onSelectColor) onSelectColor(calendar.id, col);
  };

  const handleSolo = () => {
    if (onSolo) onSolo();
    if (onSoloView) onSoloView(calendar.id);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-9 z-50 w-56 bg-[#1e1f20] border border-[#3c4043] rounded-2xl shadow-2xl py-2 text-[#e3e3e3] animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Options */}
      <button
        type="button"
        onClick={handleSolo}
        className="w-full text-left px-4 py-2 text-xs font-medium text-[#e3e3e3] hover:bg-[#282a2d] transition"
      >
        Wyświetl tylko ten
      </button>

      <button
        type="button"
        onClick={() => {
          if (onSettings) onSettings(calendar);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-xs font-medium text-[#e3e3e3] hover:bg-[#282a2d] transition"
      >
        Ustawienia i udostępnianie
      </button>

      {/* Divider */}
      <div className="border-t border-[#3c4043] my-1.5"></div>

      {/* 24-color grid */}
      <div className="px-3 py-1">
        <div className="grid grid-cols-6 gap-2 place-items-center">
          {GOOGLE_CALENDAR_COLORS.map((col, idx) => {
            const isSelected = calendar.color && calendar.color.toLowerCase() === col.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleColorPick(col)}
                style={{ backgroundColor: col }}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-115 cursor-pointer shadow-xs"
                title={col}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom color picker */}
        <div className="mt-2.5 flex items-center">
          <label 
            className="w-6 h-6 rounded-full bg-[#282a2d] hover:bg-[#35373a] border border-[#5f6368] flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] cursor-pointer transition"
            title="Wybierz własny kolor"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <input 
              type="color" 
              value={calendar.color || '#1a73e8'}
              onChange={(e) => handleColorPick(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
