import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export default function CreateDropdown({ onSelectType, isCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type) => {
    setIsOpen(false);
    onSelectType(type);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Button: border-none, smaller rounding (rounded-2xl), normal white +, text Utwórz, arrow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center bg-[#303134] hover:bg-[#3c4043] shadow-md hover:shadow-xl rounded-2xl text-white font-medium transition duration-150 active:scale-[0.98] border-0 focus:outline-none ${
          isCollapsed ? 'w-12 h-12 justify-center p-0' : 'space-x-3 px-5 py-3.5'
        }`}
        title="Utwórz nowe"
      >
        <Plus className="w-5 h-5 text-white stroke-[2.5]" />
        
        {!isCollapsed && (
          <>
            <span className="text-sm font-['Product_Sans',sans-serif] text-[#e3e3e3] font-medium tracking-wide">
              Utwórz
            </span>
            <ChevronDown className={`w-4 h-4 text-[#c4c7c5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown list: ciemniejsze tło (#1e1f20), mniejszy radius (rounded-xl) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-52 bg-[#1e1f20] border border-[#303134]/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5">
          <button
            onClick={() => handleSelect('Wydarzenie')}
            className="w-full text-left px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] hover:text-white transition flex items-center justify-between"
          >
            <span>Wydarzenie</span>
          </button>
          
          <button
            onClick={() => handleSelect('Zadanie')}
            className="w-full text-left px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] hover:text-white transition flex items-center justify-between"
          >
            <span>Zadanie</span>
          </button>

          <button
            onClick={() => handleSelect('Harmonogram spotkań')}
            className="w-full text-left px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] hover:text-white transition flex items-center justify-between"
          >
            <span>Harmonogram spotkań</span>
          </button>
        </div>
      )}
    </div>
  );
}
