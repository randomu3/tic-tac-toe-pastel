import React, { useState, useEffect } from 'react';
import { Affirmation } from '../types';
import { Sun, Cloud, Zap, Heart, Sprout, Sparkles, Feather, Star, Check } from 'lucide-react';

interface CardRevealProps {
  affirmation: Affirmation;
  onClose: () => void;
}

const CardReveal: React.FC<CardRevealProps> = ({ affirmation, onClose }) => {
  const [showContent, setShowContent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Start animation sequence
    const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
             setShowContent(true);
             setIsAnimating(false);
        }, 300); // Wait for scale down
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
      setIsSaved(true);
      setTimeout(() => {
          onClose();
      }, 1000);
  };

  const getIcon = (name: string, size: number) => {
    const props = { size };
    switch (name) {
      case 'Sun': return <Sun {...props} />;
      case 'Cloud': return <Cloud {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Heart': return <Heart {...props} fill="currentColor" />;
      case 'Sprout': return <Sprout {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Feather': return <Feather {...props} />;
      case 'Star': return <Star {...props} fill="currentColor" />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
       <div className="relative w-64 h-80">
          <div 
            className={`
                w-full h-full rounded-3xl shadow-2xl border-4 border-white transition-transform duration-300 ease-in-out
                ${isAnimating ? 'scale-x-0' : 'scale-x-100'}
                ${showContent ? 'bg-white' : 'bg-gradient-to-br from-rose-400 to-purple-500'}
            `}
          >
             {!showContent ? (
                 <div className="w-full h-full flex items-center justify-center">
                    <Sparkles size={48} className="text-white/50 animate-pulse" />
                 </div>
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-pop">
                    <div className={`mb-6 p-4 rounded-full ${affirmation.color.split(' ')[0]} ${affirmation.color.split(' ')[1]}`}>
                        {getIcon(affirmation.icon, 48)}
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-slate-800 mb-2 text-center">{affirmation.text}</h3>
                    <p className="text-sm text-slate-500 text-center">{affirmation.subText}</p>
                    
                    <div className="mt-8 w-full">
                         <button 
                            onClick={handleSave}
                            disabled={isSaved}
                            className={`
                                w-full px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2
                                ${isSaved 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}
                            `}
                         >
                            {isSaved ? (
                                <>
                                    <Check size={16} />
                                    <span>Saved!</span>
                                </>
                            ) : (
                                "Keep in Journal"
                            )}
                         </button>
                    </div>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default CardReveal;