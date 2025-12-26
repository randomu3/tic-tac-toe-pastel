import React, { useEffect, useRef, useState } from 'react';
import { GameStatus } from '../types';
import { Heart } from 'lucide-react';

interface LivingAvatarProps {
  avatarId: string;
  status: GameStatus;
  isPlayerTurn: boolean;
  size?: number;
}

const LivingAvatar: React.FC<LivingAvatarProps> = ({ avatarId, status, isPlayerTurn, size = 64 }) => {
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [hearts, setHearts] = useState<{id: number, x: number, y: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Eye Tracking Logic
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      // Calculate localized coordinates (-1 to 1)
      const x = Math.min(Math.max((clientX - centerX) / (window.innerWidth / 2), -1), 1);
      const y = Math.min(Math.max((clientY - centerY) / (window.innerHeight / 2), -1), 1);

      setLook({ x: x * 6, y: y * 6 }); // Multiplier limits eye movement range
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  // Blinking Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePet = () => {
     // Add heart particle
     const newHeart = { id: Date.now(), x: (Math.random() - 0.5) * 40, y: -20 };
     setHearts(prev => [...prev, newHeart]);
     setTimeout(() => {
         setHearts(prev => prev.filter(h => h.id !== newHeart.id));
     }, 1000);
  };

  // Avatar Configuration
  const getConfig = () => {
      switch(avatarId) {
          case 'dog': return { color: '#fcd34d', secondary: '#fbbf24', ears: 'floppy' }; // Amber
          case 'rabbit': return { color: '#f472b6', secondary: '#ec4899', ears: 'long' }; // Pink
          case 'bird': return { color: '#38bdf8', secondary: '#0ea5e9', ears: 'tuft' }; // Sky
          case 'fish': return { color: '#2dd4bf', secondary: '#14b8a6', ears: 'fin' }; // Teal
          case 'turtle': return { color: '#34d399', secondary: '#10b981', ears: 'none' }; // Emerald
          default: return { color: '#fb7185', secondary: '#f43f5e', ears: 'pointy' }; // Cat (Rose) - Default
      }
  };

  const config = getConfig();

  // Render Ears based on type
  const renderEars = () => {
      switch(config.ears) {
          case 'floppy': // Dog
             return (
                 <>
                    <path d="M10 25 C 0 25, -10 40, 5 55" fill={config.color} stroke={config.secondary} strokeWidth="3" />
                    <path d="M90 25 C 100 25, 110 40, 95 55" fill={config.color} stroke={config.secondary} strokeWidth="3" />
                 </>
             );
          case 'long': // Rabbit
             return (
                 <>
                    <ellipse cx="25" cy="10" rx="8" ry="25" fill={config.color} stroke={config.secondary} strokeWidth="3" transform="rotate(-10 25 40)" />
                    <ellipse cx="75" cy="10" rx="8" ry="25" fill={config.color} stroke={config.secondary} strokeWidth="3" transform="rotate(10 75 40)" />
                    <ellipse cx="25" cy="10" rx="4" ry="15" fill="#fff" opacity="0.4" transform="rotate(-10 25 40)" />
                    <ellipse cx="75" cy="10" rx="4" ry="15" fill="#fff" opacity="0.4" transform="rotate(10 75 40)" />
                 </>
             );
          case 'tuft': // Bird
              return (
                   <path d="M40 20 Q 50 0, 60 20 L 50 10 Z" fill={config.secondary} />
              );
          case 'fin': // Fish
               return (
                  <>
                    <path d="M5 40 Q -5 50, 5 60" fill={config.secondary} />
                    <path d="M95 40 Q 105 50, 95 60" fill={config.secondary} />
                  </>
               );
          case 'none': // Turtle (Shell/Head only)
               return null;
          default: // Pointy (Cat)
              return (
                  <>
                    <path d="M15 40 L 25 10 L 45 30 Z" fill={config.color} stroke={config.secondary} strokeWidth="3" strokeLinejoin="round" />
                    <path d="M85 40 L 75 10 L 55 30 Z" fill={config.color} stroke={config.secondary} strokeWidth="3" strokeLinejoin="round" />
                  </>
              );
      }
  };

  // Determine Mouth Expression
  const getMouthPath = () => {
      if (status === GameStatus.WON) return "M 35 65 Q 50 75 65 65"; // Big Smile
      if (status === GameStatus.LOST) return "M 35 70 Q 50 60 65 70"; // Frown
      if (!isPlayerTurn && status === GameStatus.PLAYING) return "M 40 70 Q 50 70 60 70"; // Concentrating (flat)
      return "M 40 68 Q 50 72 60 68"; // Idle Smile
  };

  return (
    <div 
        ref={containerRef}
        className="relative cursor-pointer select-none"
        style={{ width: size, height: size }}
        onClick={handlePet}
    >
      {/* Floating Hearts from Interaction */}
      {hearts.map(h => (
          <div 
            key={h.id}
            className="absolute z-50 text-rose-400 animate-float"
            style={{ 
                left: '50%', 
                top: 0,
                transform: `translate(${h.x}px, ${h.y}px)`,
                animation: 'popIn 0.5s ease-out forwards'
            }}
          >
              <Heart size={16} fill="currentColor" />
          </div>
      ))}

      <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible transition-transform duration-300 ${status === GameStatus.WON ? 'animate-bounce' : 'animate-float'}`}>
        {/* Ears (Behind head) */}
        {renderEars()}

        {/* Head Base */}
        <circle cx="50" cy="50" r="40" fill={config.color} stroke={config.secondary} strokeWidth="3" />
        
        {/* Face Group */}
        <g transform={`translate(${look.x}, ${look.y})`}>
            {/* Eyes */}
            <g>
                {/* Left Eye */}
                <circle cx="35" cy="45" r="8" fill="white" />
                {!blink ? (
                    <circle cx={35 + look.x/2} cy={45 + look.y/2} r="3" fill="#1e293b" />
                ) : (
                    <line x1="27" y1="45" x2="43" y2="45" stroke="#1e293b" strokeWidth="2" />
                )}

                {/* Right Eye */}
                <circle cx="65" cy="45" r="8" fill="white" />
                {!blink ? (
                    <circle cx={65 + look.x/2} cy={45 + look.y/2} r="3" fill="#1e293b" />
                ) : (
                    <line x1="57" y1="45" x2="73" y2="45" stroke="#1e293b" strokeWidth="2" />
                )}
            </g>

            {/* Cheeks (Blush) */}
            <ellipse cx="30" cy="55" rx="5" ry="3" fill="#fda4af" opacity="0.6" />
            <ellipse cx="70" cy="55" rx="5" ry="3" fill="#fda4af" opacity="0.6" />

            {/* Mouth */}
            <path d={getMouthPath()} fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default LivingAvatar;
