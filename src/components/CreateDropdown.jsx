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
      {/* Button Utwórz: brak białego borderu przy kliknięciu, oryginalne idealne ułożenie */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center bg-[#333538] hover:bg-[#3c3e42] shadow-md hover:shadow-lg rounded-2xl text-white font-medium transition duration-150 active:scale-[0.98] border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none active:ring-0 cursor-pointer ${
          isCollapsed ? 'w-12 h-12 justify-center p-0' : 'space-x-3 px-5 py-3.5 min-h-[52px]'
        }`}
        title="Utwórz nowe"
      >
        {/* Plus SVG ze zdjęcia */}
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        
        {!isCollapsed && (
          <>
            <span className="text-sm font-['Product_Sans',sans-serif] text-[#e3e3e3] font-medium tracking-wide">
              Utwórz
            </span>
            {/* Trójkątna strzałka w dół ze zdjęcia Image 3 */}
            <svg 
              className={`w-2.5 h-2 fill-[#c4c7c5] ml-1 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 10 6"
            >
              <path d="M0 0l5 6 5-6z" />
            </svg>
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
