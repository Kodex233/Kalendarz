import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export default function CreateDropdown({ onSelectType }) {
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
      {/* Button: Smaller rounding (rounded-2xl), normal white +, text Utwórz, arrow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-5 py-3.5 bg-[#303134] hover:bg-[#3c4043] border border-[#444746] shadow-md hover:shadow-lg rounded-2xl text-white font-medium transition duration-150 active:scale-[0.98]"
        title="Utwórz nowe"
      >
        {/* Normal white plus */}
        <Plus className="w-5 h-5 text-white stroke-[2.5]" />
        
        {/* Text */}
        <span className="text-sm font-['Product_Sans',sans-serif] text-[#e3e3e3] font-medium tracking-wide">
          Utwórz
        </span>

        {/* Dropdown arrow */}
        <ChevronDown className={`w-4 h-4 text-[#c4c7c5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown list matching image */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-52 bg-[#282a2d] border border-[#3c4043] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => handleSelect('Wydarzenie')}
            className="w-full text-left px-4 py-2.5 text-sm text-[#e3e3e3] hover:bg-[#35373a] hover:text-white transition flex items-center justify-between"
          >
            <span>Wydarzenie</span>
          </button>
          
          <button
            onClick={() => handleSelect('Zadanie')}
            className="w-full text-left px-4 py-2.5 text-sm text-[#e3e3e3] hover:bg-[#35373a] hover:text-white transition flex items-center justify-between"
          >
            <span>Zadanie</span>
          </button>

          <button
            onClick={() => handleSelect('Harmonogram spotkań')}
            className="w-full text-left px-4 py-2.5 text-sm text-[#e3e3e3] hover:bg-[#35373a] hover:text-white transition flex items-center justify-between"
          >
            <span>Harmonogram spotkań</span>
          </button>
        </div>
      )}
    </div>
  );
}
