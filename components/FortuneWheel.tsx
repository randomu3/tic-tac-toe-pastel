import React, { useState } from 'react';
import { WHEEL_PRIZES } from '../services/gameLogic';
import { X, Heart, Sparkles } from 'lucide-react';

interface FortuneWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinComplete: (prizeValue: number) => void;
  canSpin: boolean;
}

const FortuneWheel: React.FC<FortuneWheelProps> = ({ isOpen, onClose, onSpinComplete, canSpin }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    
    // Random prize
    const randomIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    setPrizeIndex(randomIndex);

    // Calculate rotation
    // 360 / length = deg per segment. 
    // We want the pointer (top center) to land on the segment.
    // NOTE: CSS Conic gradient starts at 12 o'clock and goes clockwise.
    // If pointer is at 12 o'clock.
    const segmentAngle = 360 / WHEEL_PRIZES.length;
    
    // Add multiple full rotations + offset to land in middle of segment
    // We rotate the wheel counter-clockwise or clockwise to bring the segment to top.
    // Let's rotate clockwise. The segment at index i is at (i * segmentAngle) degrees.
    // To bring it to top (0/360), we need to rotate by - (i * segmentAngle).
    // Adding randomness to land inside the segment (+/- half segment).
    
    const randomOffset = Math.random() * (segmentAngle - 4) + 2; // Keep 2deg padding
    const targetAngle = 360 * 5 + (360 - (randomIndex * segmentAngle)) - (segmentAngle / 2) + randomOffset;
    
    setRotation(rotation + targetAngle);

    setTimeout(() => {
        setIsSpinning(false);
        onSpinComplete(WHEEL_PRIZES[randomIndex].value);
    }, 4000); // 4s spin
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative flex flex-col items-center">
        
        <button 
            onClick={onClose}
            disabled={isSpinning}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all disabled:opacity-50"
        >
            <X size={20} />
        </button>

        <h2 className="text-2xl font-heading font-bold text-slate-700 mb-1">Daily Surprise</h2>
        <p className="text-slate-400 text-sm mb-6">Spin for free rewards!</p>

        {/* Pointer */}
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20 text-slate-700 filter drop-shadow-md">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-slate-700"></div>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mb-8">
             <div 
                className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden transition-transform cubic-bezier(0.15, 0, 0.2, 1)"
                style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? '4s' : '0s',
                    background: `conic-gradient(
                        ${WHEEL_PRIZES.map((p, i) => `${p.color} ${i * (100/WHEEL_PRIZES.length)}% ${(i+1) * (100/WHEEL_PRIZES.length)}%`).join(', ')}
                    )`
                }}
             >
                {/* Segment Labels */}
                {WHEEL_PRIZES.map((prize, i) => {
                    const angle = (360 / WHEEL_PRIZES.length) * i + (360 / WHEEL_PRIZES.length) / 2;
                    return (
                        <div 
                            key={prize.id}
                            className="absolute top-1/2 left-1/2 w-full h-4 -translate-y-1/2 origin-left flex justify-end pr-8"
                            style={{ transform: `rotate(${angle - 90}deg)` }} // -90 because conic starts at top, but rotation calc assumes 0 is right for labels? No, just trial/error alignment
                        >
                            <div className="flex items-center gap-1 font-bold text-white drop-shadow-sm" style={{ transform: 'rotate(90deg)' }}>
                                <span className="text-lg">{prize.label}</span>
                                <Heart size={14} fill="currentColor" />
                            </div>
                        </div>
                    );
                })}
             </div>
             
             {/* Center Cap */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-rose-400">
                <Sparkles size={24} />
             </div>
        </div>

        {/* Spin Button */}
        <button
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
            className={`
                px-10 py-3 rounded-full font-bold text-white shadow-lg transition-all
                ${!canSpin 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : isSpinning 
                        ? 'bg-rose-300 scale-95' 
                        : 'bg-gradient-to-r from-rose-400 to-pink-500 hover:shadow-xl hover:scale-105 active:scale-95'}
            `}
        >
            {isSpinning ? 'Spinning...' : canSpin ? 'Spin Now' : 'Come back tomorrow'}
        </button>
        
        {!canSpin && !isSpinning && (
            <p className="text-xs text-slate-400 mt-2 font-bold">Resets daily</p>
        )}

      </div>
    </div>
  );
};

export default FortuneWheel;