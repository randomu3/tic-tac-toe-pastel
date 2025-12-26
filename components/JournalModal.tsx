import React from 'react';
import { PlayerStats, Affirmation } from '../types';
import { AFFIRMATIONS } from '../services/gameLogic';
import { X, Lock, Sun, Cloud, Zap, Heart, Sprout, Sparkles, Feather, Star } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

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

  const unlockedCount = stats.unlockedAffirmations.length;
  const totalCount = AFFIRMATIONS.length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-pop">
      <div className="bg-[#fffdf5] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-[#f0e6d2] h-[80vh] flex flex-col relative">
        {/* Book Spine visual effect */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#f0e6d2] z-10 opacity-50"></div>

        {/* Header */}
        <div className="relative p-6 shrink-0 border-b border-[#f0e6d2] bg-white">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all"
            >
                <X size={20} />
            </button>
            <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-slate-700 tracking-wide">Daily Wisdom</h2>
                <p className="text-slate-400 text-xs mt-1 font-medium uppercase tracking-wider">
                    Collection: {unlockedCount} / {totalCount}
                </p>
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
            <div className="grid grid-cols-2 gap-3">
                {AFFIRMATIONS.map((aff) => {
                    const isUnlocked = stats.unlockedAffirmations.includes(aff.id);
                    return (
                        <div 
                            key={aff.id}
                            className={`
                                relative aspect-[3/4] rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all
                                ${isUnlocked 
                                    ? `bg-white shadow-sm border border-slate-100 ${aff.color.split(' ')[0]}` 
                                    : 'bg-slate-200/50 border border-slate-200'
                                }
                            `}
                        >
                            {isUnlocked ? (
                                <>
                                    <div className={`mb-3 ${aff.color.split(' ')[1]}`}>
                                        {getIcon(aff.icon, 32)}
                                    </div>
                                    <h3 className="font-heading font-bold text-slate-700 text-sm mb-1">{aff.text}</h3>
                                    <p className="text-[10px] text-slate-500 leading-tight">{aff.subText}</p>
                                </>
                            ) : (
                                <div className="text-slate-300">
                                    <Lock size={24} className="mb-2 mx-auto" />
                                    <div className="w-12 h-2 bg-slate-300 rounded-full mx-auto"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {!unlockedCount && (
                <div className="text-center p-8 text-slate-400 text-sm">
                    <p>Win a game each day to unlock a new wisdom card.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default JournalModal;