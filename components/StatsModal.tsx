import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../types';
import { ACHIEVEMENTS, AVATARS } from '../services/gameLogic';
import { Trophy, Flame, Shield, Swords, Medal, X, Lock, Edit2, Check, Cat, Dog, Rabbit, Bird, Fish, Turtle, User } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateName: (name: string) => void;
  onUpdateAvatar: (id: string) => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats, onUpdateName, onUpdateAvatar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stats.displayName);

  useEffect(() => {
    setEditName(stats.displayName);
  }, [stats.displayName, isOpen]);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(editName.trim());
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.totalWins / stats.gamesPlayed) * 100) 
    : 0;

  const getIcon = (iconName: string, size: number, className: string) => {
    const props = { size, className };
    switch (iconName) {
      case 'flame': return <Flame {...props} />;
      case 'shield': return <Shield {...props} />;
      case 'swords': return <Swords {...props} />;
      case 'trophy': return <Trophy {...props} />;
      case 'medal': return <Medal {...props} />;
      default: return <Medal {...props} />;
    }
  };

  const getAvatarIcon = (id: string, size: number = 32) => {
      const props = { size };
      switch(id) {
          case 'cat': return <Cat {...props} />;
          case 'dog': return <Dog {...props} />;
          case 'rabbit': return <Rabbit {...props} />;
          case 'bird': return <Bird {...props} />;
          case 'fish': return <Fish {...props} />;
          case 'turtle': return <Turtle {...props} />;
          default: return <User {...props} />;
      }
  };

  const currentAvatar = AVATARS.find(a => a.id === stats.avatarId) || AVATARS[0];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-pop">
      <div className="bg-white/95 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-rose-100 to-teal-50 p-6 pb-6 shrink-0">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-all"
            >
                <X size={20} />
            </button>
            <div className="flex flex-col items-center">
                <div className={`w-20 h-20 ${currentAvatar.bg} ${currentAvatar.color} rounded-full shadow-md flex items-center justify-center text-3xl mb-3 border-4 border-white`}>
                    {getAvatarIcon(currentAvatar.id, 40)}
                </div>
                
                {/* Editable Name */}
                <div className="flex items-center gap-2 mb-2 h-8">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <input 
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-white/60 border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 w-32 focus:outline-none focus:border-rose-400"
                                maxLength={12}
                                autoFocus
                            />
                            <button onClick={handleSaveName} className="p-1 bg-emerald-400 text-white rounded-full">
                                <Check size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-slate-700">{stats.displayName}</h2>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1 text-rose-500 font-bold text-sm bg-white/60 px-3 py-1 rounded-full">
                    <Trophy size={14} />
                    <span>{stats.totalWins} Wins</span>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Avatar Selector */}
            <div className="mb-6">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 px-1">Choose Avatar</h3>
                <div className="flex gap-2 justify-between">
                    {AVATARS.map((avatar) => (
                        <button
                            key={avatar.id}
                            onClick={() => onUpdateAvatar(avatar.id)}
                            className={`
                                flex items-center justify-center w-10 h-10 rounded-full transition-all
                                ${avatar.bg} ${avatar.color}
                                ${stats.avatarId === avatar.id ? 'ring-2 ring-slate-400 scale-110 shadow-sm' : 'opacity-70 hover:opacity-100 hover:scale-105'}
                            `}
                        >
                            {getAvatarIcon(avatar.id, 20)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Played</span>
                    <span className="text-xl font-bold text-slate-700">{stats.gamesPlayed}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Rate</span>
                    <span className="text-xl font-bold text-emerald-500">{winRate}%</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Streak</span>
                    <div className="flex items-center gap-1 text-xl font-bold text-orange-400">
                        <Flame size={16} fill="currentColor" />
                        <span>{stats.currentStreak}</span>
                    </div>
                </div>
            </div>

            {/* Achievements List */}
            <div className="mb-6">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 px-1">Achievements</h3>
                <div className="space-y-3">
                    {ACHIEVEMENTS.map((ach) => {
                        const isUnlocked = stats.unlockedAchievements.includes(ach.id);
                        return (
                            <div 
                                key={ach.id} 
                                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                                    isUnlocked 
                                    ? 'bg-gradient-to-r from-rose-50 to-white border-rose-100 shadow-sm' 
                                    : 'bg-slate-50 border-transparent opacity-60'
                                }`}
                            >
                                <div className={`p-2 rounded-xl ${isUnlocked ? 'bg-white text-rose-400 shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                                    {isUnlocked ? getIcon(ach.icon, 20, "") : <Lock size={20} />}
                                </div>
                                <div>
                                    <div className={`font-bold text-sm ${isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {ach.title}
                                    </div>
                                    <div className="text-[10px] text-slate-400 leading-tight">
                                        {ach.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StatsModal;