import React from 'react';
import { ParticleType } from '../types';

interface ControlPanelProps {
  selectedMaterial: ParticleType;
  onSelect: (material: ParticleType) => void;
  onClear: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ selectedMaterial, onSelect, onClear }) => {
  const buttons = [
    { type: ParticleType.SAND, label: 'SAND', colorClass: 'bg-amber-400' },
    { type: ParticleType.WATER, label: 'H2O', colorClass: 'bg-blue-400' },
    { type: ParticleType.STONE, label: 'ROCK', colorClass: 'bg-stone-400' },
    { type: ParticleType.VOID, label: 'DEL', colorClass: 'bg-gray-200' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {buttons.map((btn) => {
        const isSelected = selectedMaterial === btn.type;
        return (
          <button
            key={btn.type}
            onClick={() => onSelect(btn.type)}
            className={`
              relative px-4 py-3 md:px-6 md:py-4 transition-all duration-75
              border-4 border-black
              ${isSelected 
                ? `${btn.colorClass} translate-y-1 translate-x-1 shadow-none` 
                : 'bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
              }
              active:translate-y-1 active:translate-x-1 active:shadow-none
            `}
          >
            {/* Selection indicator pixel */}
            {isSelected && (
                <div className="absolute top-1 left-1 w-2 h-2 bg-black animate-pulse"></div>
            )}
            
            <span className={`block text-xs md:text-sm uppercase tracking-widest ${isSelected ? 'font-bold' : ''}`}>
                {btn.label}
            </span>
          </button>
        );
      })}
      
      {/* Divider */}
      <div className="w-1 md:w-2 h-12 bg-black mx-2 hidden sm:block pattern-diagonal-lines"></div>

      <button
        onClick={onClear}
        className="
          relative px-4 py-3 md:px-6 md:py-4
          border-4 border-black bg-red-500 text-white
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          hover:bg-red-600 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5
          active:translate-y-1 active:translate-x-1 active:shadow-none
          transition-all duration-75
        "
      >
        <span className="block text-xs md:text-sm uppercase tracking-widest font-bold">
            RESET
        </span>
      </button>
    </div>
  );
};

export default ControlPanel;