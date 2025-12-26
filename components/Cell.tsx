import React from 'react';
import { PlayerSymbol, Theme } from '../types';
import { X, Circle, Heart, Star, Flower, Leaf } from 'lucide-react';

interface CellProps {
  value: PlayerSymbol;
  onClick: () => void;
  disabled: boolean;
  highlight: boolean;
  theme: Theme;
  isFading?: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, disabled, highlight, theme, isFading = false }) => {
  
  const renderIcon = () => {
    if (value === 'X') {
      // Player Icons
      switch (theme) {
        case 'love':
          return <Heart size={52} strokeWidth={2.5} className="fill-rose-400 text-rose-500 drop-shadow-sm" />;
        case 'nature':
          return <Flower size={52} strokeWidth={2.5} className="text-pink-500 drop-shadow-sm" />;
        default: // classic
          return <X size={52} strokeWidth={2.5} className="text-rose-400 drop-shadow-sm" />;
      }
    }
    
    if (value === 'O') {
      // CPU Icons
      switch (theme) {
        case 'love':
          return <Star size={48} strokeWidth={2.5} className="fill-amber-300 text-amber-400 drop-shadow-sm" />;
        case 'nature':
          return <Leaf size={48} strokeWidth={2.5} className="text-emerald-500 drop-shadow-sm" />;
        default: // classic
          return <Circle size={48} strokeWidth={2.5} className="text-purple-400 drop-shadow-sm" />;
      }
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl 
        flex items-center justify-center 
        transition-all duration-300 ease-out
        backdrop-blur-sm
        ${!value && !disabled ? 'hover:bg-white/60 active:scale-95 cursor-pointer shadow-sm' : ''}
        ${highlight 
          ? 'bg-gradient-to-br from-green-100 to-emerald-50 shadow-[0_0_20px_rgba(167,243,208,0.6)] border-2 border-green-200 scale-105 z-10' 
          : 'bg-white/40 shadow-[inset_0px_0px_10px_rgba(255,255,255,0.8)] border border-white/60'}
        ${isFading ? 'opacity-40 scale-90 grayscale' : ''}
      `}
    >
      {value && (
        <div className={`animate-pop filter drop-shadow-sm ${isFading ? 'animate-pulse' : ''}`}>
          {renderIcon()}
        </div>
      )}
    </button>
  );
};

export default Cell;