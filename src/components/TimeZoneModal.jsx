import React, { useState } from 'react';
import { X, ArrowUpDown } from 'lucide-react';

export default function TimeZoneModal({ isOpen, onClose }) {
  const [useSeparate, setUseSeparate] = useState(false);
  const [startTimezone, setStartTimezone] = useState('(GMT+01:00) Czas środkowoeuropejski - Warszawa');
  const [endTimezone, setEndTimezone] = useState('(GMT+01:00) Czas środkowoeuropejski - Warszawa');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#282a2d] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[470px] p-6 border-0 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-[22px] font-normal text-[#e3e3e3] mb-5">
          Strefa czasowa wydarzenia
        </h2>

        {/* Checkbox: Użyj innych stref czasowych... */}
        <label className="flex items-center space-x-3 text-sm text-[#e3e3e3] cursor-pointer mb-5 select-none">
          <input
            type="checkbox"
            checked={useSeparate}
            onChange={(e) => setUseSeparate(e.target.checked)}
            className="w-4.5 h-4.5 rounded-[3px] bg-transparent border-2 border-[#8e918f] text-[#8ab4f8] focus:ring-0 cursor-pointer"
          />
          <span>Użyj innych stref czasowych dla godziny rozpoczęcia i zakończenia</span>
        </label>

        {/* Strefa czasowa rozpoczęcia wydarzenia */}
        <div className="bg-[#1e1f20] px-4 py-2.5 rounded-lg border-b border-[#8ab4f8] relative">
          <div className="text-xs text-[#9aa0a6] mb-0.5">Strefa czasowa rozpoczęcia wydarzenia</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#e3e3e3] truncate font-normal">
              {startTimezone}
            </span>
            <button 
              type="button" 
              onClick={() => setStartTimezone('')}
              className="p-1 text-[#9aa0a6] hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Double arrow icon */}
        <div className="flex justify-end pr-6 py-2">
          <button 
            type="button" 
            onClick={() => {
              const temp = startTimezone;
              setStartTimezone(endTimezone);
              setEndTimezone(temp);
            }}
            className="p-1.5 hover:bg-[#35373a] text-[#9aa0a6] hover:text-white rounded-full transition"
            title="Zamień strefy czasowe"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Strefa czasowa zakończenia wydarzenia */}
        <div className="bg-[#1e1f20] px-4 py-2.5 rounded-lg border-b border-[#8ab4f8] relative">
          <div className="text-xs text-[#9aa0a6] mb-0.5">Strefa czasowa zakończenia wydarzenia</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#e3e3e3] truncate font-normal">
              {endTimezone}
            </span>
            <button 
              type="button" 
              onClick={() => setEndTimezone('')}
              className="p-1 text-[#9aa0a6] hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-4">
          <button
            type="button"
            onClick={() => {
              setStartTimezone('(GMT+01:00) Czas środkowoeuropejski - Warszawa');
              setEndTimezone('(GMT+01:00) Czas środkowoeuropejski - Warszawa');
            }}
            className="text-sm font-medium text-[#a8c7fa] hover:bg-[#a8c7fa]/15 rounded-full px-3 py-1.5 transition"
          >
            Użyj bieżącej strefy czasowej
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-[#a8c7fa] hover:bg-[#a8c7fa]/15 rounded-full px-4 py-2 transition"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
