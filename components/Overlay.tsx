import React, { useState } from 'react';
import { GameStatus, Theme, GameMode, DailyQuest, Wallpaper } from '../types';
import { THEME_CONFIG, STICKER_CONFIG, WALLPAPER_CONFIG } from '../services/gameLogic';
import { purchaseHearts } from '../services/telegramService';
import { Trophy, Frown, Sparkles, Copy, Check, Ticket, Gift, Share2, Heart, Leaf, X, Lock, Zap, Users, Feather, BarChart2, CheckCircle, ShoppingBag, Smile, BookHeart, Loader, Moon, Cloud, Flower, Image, Infinity, Tag, Percent, Star, Plus } from 'lucide-react';

interface ActiveDiscount {
  percentage: number;
  expiresAt: number;
}

interface OverlayProps {
  status: GameStatus;
  promoCode: string | null;
  onStart: () => void;
  onRestart: () => void;
  theme: Theme;
  onSetTheme: (t: Theme) => void;
  onBuyTheme: (t: Theme) => void;
  onBuySticker: (id: string) => void;
  onBuyWallpaper: (id: Wallpaper) => void;
  totalWins: number;
  currency: number;
  ownedThemes: Theme[];
  ownedStickers: string[];
  ownedWallpapers: Wallpaper[];
  activeWallpaper: Wallpaper;
  gameMode: GameMode;
  onSetGameMode: (m: GameMode) => void;
  onShowStats: () => void;
  onShowJournal: () => void;
  onShowWheel: () => void;
  canSpin: boolean;
  dailyQuest: DailyQuest | null;
  shopTab: 'themes' | 'stickers' | 'wallpapers';
  onSetShopTab: (tab: 'themes' | 'stickers' | 'wallpapers') => void;
  earnedCodes: string[];
  activeDiscount: ActiveDiscount | null;
  onRedeemCode: (code: string) => void;
  onAddHearts: (hearts: number) => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  status, 
  promoCode, 
  onStart, 
  onRestart, 
  theme, 
  onSetTheme, 
  onBuyTheme,
  onBuySticker,
  onBuyWallpaper,
  totalWins, 
  currency,
  ownedThemes,
  ownedStickers,
  ownedWallpapers,
  activeWallpaper,
  gameMode, 
  onSetGameMode, 
  onShowStats,
  onShowJournal,
  onShowWheel,
  canSpin,
  dailyQuest,
  shopTab,
  onSetShopTab,
  earnedCodes,
  activeDiscount,
  onRedeemCode,
  onAddHearts
}) => {
  const [copied, setCopied] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleBuyHearts = async (packageId: string) => {
    setIsPurchasing(true);
    await purchaseHearts(packageId, (hearts) => {
      onAddHearts(hearts);
    });
    setIsPurchasing(false);
  };

  const handleCopy = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const tg = (window as any).Telegram?.WebApp;
    const botUsername = 'TicTacToe_3242_robot';
    // Direct Mini App link - requires Mini App with short_name "app" in BotFather
    const appLink = `https://t.me/${botUsername}/app`;
    const shareText = encodeURIComponent(`🎮 I just won in Tic-Tac-Toe! Can you beat the AI?`);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appLink)}&text=${shareText}`;
    
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const ThemeButton = ({ id, label, icon: Icon, colorClass }: any) => {
    const isOwned = ownedThemes.includes(id);
    const isSelected = theme === id;
    const cost = THEME_CONFIG[id as Theme].cost;
    const canAfford = currency >= cost;
    
    return (
      <button 
        onClick={() => {
            if (isOwned) {
                onSetTheme(id);
            } else {
                onBuyTheme(id);
            }
        }}
        className={`
          relative flex flex-col items-center justify-center py-3 rounded-xl transition-all border
          ${isSelected 
            ? 'bg-white shadow-md border-transparent' 
            : 'bg-transparent border-transparent hover:bg-slate-100'}
          ${!isOwned && !canAfford ? 'opacity-80' : ''}
        `}
      >
        {!isOwned ? (
          <div className="flex flex-col items-center text-slate-400">
            <Lock size={20} className="mb-1" />
            <span className="flex items-center gap-1 text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                <Heart size={8} fill="currentColor" className="text-rose-400" />
                {cost}
            </span>
          </div>
        ) : (
          <div className={`flex flex-col items-center ${isSelected ? colorClass : 'text-slate-400'}`}>
            <Icon size={20} className={`mb-1 ${isSelected ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold uppercase">{label}</span>
          </div>
        )}
      </button>
    );
  };

  const WallpaperButton = ({ id, label, icon: iconName }: any) => {
      const isOwned = ownedWallpapers.includes(id);
      const isSelected = activeWallpaper === id;
      const config = WALLPAPER_CONFIG[id as Wallpaper];
      const canAfford = currency >= config.cost;

      let Icon = Cloud;
      if (iconName === 'Moon') Icon = Moon;
      if (iconName === 'Flower') Icon = Flower;
      if (iconName === 'Leaf') Icon = Leaf;

      return (
        <button 
            onClick={() => onBuyWallpaper(id)}
            className={`
            relative flex flex-col items-center justify-center py-3 rounded-xl transition-all border overflow-hidden
            ${isSelected 
                ? 'bg-white shadow-md border-transparent' 
                : 'bg-transparent border-transparent hover:bg-slate-100'}
            ${!isOwned && !canAfford ? 'opacity-80' : ''}
            `}
        >
             {/* Mini Preview Background */}
             <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${config.colors}`}></div>
             
             <div className="relative z-10 flex flex-col items-center">
                 {!isOwned ? (
                    <div className="flex flex-col items-center text-slate-500">
                        <Lock size={20} className="mb-1" />
                        <span className="flex items-center gap-1 text-[9px] font-bold bg-white/80 px-2 py-0.5 rounded-full mt-1">
                            <Heart size={8} fill="currentColor" className="text-rose-400" />
                            {config.cost}
                        </span>
                    </div>
                 ) : (
                    <div className={`flex flex-col items-center ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                        <Icon size={20} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">{label}</span>
                         {isSelected && <CheckCircle size={10} className="text-emerald-500 absolute top-0 right-0" />}
                    </div>
                 )}
             </div>
        </button>
      );
  };

  const StickerButton = ({ id, content, cost }: any) => {
      const isOwned = ownedStickers.includes(id);
      const canAfford = currency >= cost;

      return (
        <button
          onClick={() => {
              if (!isOwned) onBuySticker(id);
          }}
          disabled={isOwned}
          className={`
            relative flex flex-col items-center justify-center py-3 rounded-xl transition-all border
            ${isOwned 
                ? 'bg-white/50 border-transparent opacity-50' 
                : canAfford 
                    ? 'bg-white border-transparent hover:shadow-md'
                    : 'bg-slate-50 border-transparent opacity-80'}
          `}
        >
            <span className="text-3xl mb-1">{content}</span>
            {isOwned ? (
                 <span className="text-[9px] font-bold uppercase text-emerald-500">Owned</span>
            ) : (
                <span className="flex items-center gap-1 text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full mt-1 text-slate-500">
                    <Heart size={8} fill="currentColor" className="text-rose-400" />
                    {cost}
                </span>
            )}
        </button>
      );
  };

  const ModeButton = ({ id, label, icon: Icon, desc }: any) => {
    const isSelected = gameMode === id;
    return (
       <button
        onClick={() => onSetGameMode(id)}
        className={`
          flex flex-col items-center p-1.5 rounded-lg border-2 transition-all w-full
          ${isSelected 
            ? 'bg-rose-50 border-rose-200 text-rose-500' 
            : 'bg-white border-transparent text-slate-400 hover:bg-slate-50'}
        `}
       >
         <Icon size={16} className="mb-0.5" />
         <span className="text-[10px] font-bold">{label}</span>
         <span className="text-[8px] opacity-70 font-medium">{desc}</span>
       </button>
    );
  }

  if (status === GameStatus.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-white/60 backdrop-blur-md transition-all duration-500 overflow-hidden">
      <div className="w-full max-w-sm my-auto max-h-[85vh] flex flex-col">
        
        {/* WELCOME SCREEN */}
        {status === GameStatus.WELCOME && (
          <div className="bg-white/90 rounded-3xl shadow-2xl border-4 border-white ring-4 ring-rose-100 animate-pop text-center relative flex flex-col overflow-hidden h-full">
            
            {/* Header: Buttons, Logo, Currency */}
            <div className="p-6 pb-2 shrink-0 z-10 bg-white/90 backdrop-blur-sm relative">
                {/* Wheel Button - Left */}
                <div className="absolute top-4 left-4 z-20">
                    <button 
                        onClick={onShowWheel}
                        className="relative text-slate-400 hover:text-rose-500 transition-colors p-2"
                        title="Daily Spin"
                    >
                        <Loader size={24} className={canSpin ? 'animate-spin-slow' : ''} />
                        {canSpin && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>}
                    </button>
                </div>

                {/* Right Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                        onClick={onShowJournal}
                        className="text-slate-400 hover:text-indigo-500 transition-colors p-2"
                        title="Daily Journal"
                    >
                        <BookHeart size={24} />
                    </button>
                    
                    <button 
                        onClick={onShowStats}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                        title="View Statistics"
                    >
                        <BarChart2 size={24} />
                    </button>
                </div>
                
                <style>{`
                    .animate-spin-slow { animation: spin 4s linear infinite; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>

                <div className="w-16 h-16 bg-gradient-to-tr from-rose-100 to-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-3 shadow-inner mt-6">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-2xl font-heading font-bold text-slate-700 mb-1">Tic-Tac-Toe</h1>
                
                {/* Heart Count */}
                <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full text-rose-500 text-sm font-bold mb-2 shadow-sm">
                <Heart size={14} fill="currentColor" />
                <span>{currency}</span>
                </div>
            </div>

            {/* Scrollable Body: Quest, Modes, Shop */}
            <div className="overflow-y-auto custom-scrollbar px-6 py-2 flex-1 min-h-0">
                {/* Daily Quest Card */}
                {dailyQuest && (
                <div className={`mb-4 p-3 rounded-2xl border ${dailyQuest.isCompleted ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${dailyQuest.isCompleted ? 'text-emerald-500' : 'text-blue-500'}`}>Daily Quest</span>
                        <span className="text-[9px] font-bold text-slate-400">{dailyQuest.progress}/{dailyQuest.target}</span>
                    </div>
                    <div className="text-left font-bold text-xs text-slate-700 mb-2">
                        {dailyQuest.description}
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden shadow-sm">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${dailyQuest.isCompleted ? 'bg-emerald-400' : 'bg-blue-400'}`}
                            style={{ width: `${Math.min(100, (dailyQuest.progress / dailyQuest.target) * 100)}%` }}
                        />
                    </div>
                </div>
                )}

                {/* Promo Code Section - Compact */}
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag size={12} className="text-amber-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Promo Code</span>
                        {activeDiscount && (
                            <span className="ml-auto flex items-center gap-1 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-bold">
                                <Percent size={8} />
                                {activeDiscount.percentage}% OFF!
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder="XXXXX"
                            maxLength={5}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-center font-mono font-bold text-slate-700 uppercase tracking-widest text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                            onClick={() => {
                                onRedeemCode(promoInput);
                                setPromoInput('');
                            }}
                            disabled={promoInput.length !== 5}
                            className="px-3 py-1.5 bg-amber-400 text-white font-bold text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                    {earnedCodes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {earnedCodes.slice(-3).map(code => (
                                <button
                                    key={code}
                                    onClick={() => setPromoInput(code)}
                                    className="px-2 py-0.5 bg-white rounded text-[9px] font-mono font-bold text-slate-500 hover:bg-amber-100 transition-colors border border-amber-100"
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Game Mode Selector */}
                <div className="mb-4">
                <p className="text-slate-400 text-[9px] font-bold uppercase mb-2 text-left px-1">Mode</p>
                <div className="grid grid-cols-4 gap-1.5">
                    <ModeButton id="easy" label="Relax" icon={Feather} desc="Easy" />
                    <ModeButton id="hard" label="Pro" icon={Zap} desc="Hard" />
                    <ModeButton id="zen" label="Zen" icon={Infinity} desc="∞" />
                    <ModeButton id="local" label="2P" icon={Users} desc="Local" />
                </div>
                </div>

                {/* Buy Hearts Section */}
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Plus size={12} className="text-rose-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600">Get Hearts</span>
                        <Star size={10} className="text-amber-400 ml-auto" fill="currentColor" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleBuyHearts('hearts_100')}
                            disabled={isPurchasing}
                            className="flex flex-col items-center p-2 bg-white rounded-xl border border-rose-100 hover:border-rose-300 transition-all disabled:opacity-50"
                        >
                            <span className="text-lg">💝</span>
                            <span className="text-[10px] font-bold text-slate-700">100</span>
                            <span className="text-[8px] text-amber-500 font-bold flex items-center gap-0.5">
                                <Star size={8} fill="currentColor" />10
                            </span>
                        </button>
                        <button
                            onClick={() => handleBuyHearts('hearts_500')}
                            disabled={isPurchasing}
                            className="flex flex-col items-center p-2 bg-white rounded-xl border border-rose-100 hover:border-rose-300 transition-all disabled:opacity-50 relative"
                        >
                            <span className="absolute -top-1 -right-1 bg-emerald-400 text-white text-[7px] px-1 rounded font-bold">BEST</span>
                            <span className="text-lg">💖</span>
                            <span className="text-[10px] font-bold text-slate-700">500</span>
                            <span className="text-[8px] text-amber-500 font-bold flex items-center gap-0.5">
                                <Star size={8} fill="currentColor" />45
                            </span>
                        </button>
                        <button
                            onClick={() => handleBuyHearts('hearts_1000')}
                            disabled={isPurchasing}
                            className="flex flex-col items-center p-2 bg-white rounded-xl border border-rose-100 hover:border-rose-300 transition-all disabled:opacity-50"
                        >
                            <span className="text-lg">💕</span>
                            <span className="text-[10px] font-bold text-slate-700">1000</span>
                            <span className="text-[8px] text-amber-500 font-bold flex items-center gap-0.5">
                                <Star size={8} fill="currentColor" />80
                            </span>
                        </button>
                    </div>
                </div>

                {/* Shop Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <p className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                            <ShoppingBag size={12} />
                            Shop
                        </p>
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button 
                                onClick={() => onSetShopTab('themes')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shopTab === 'themes' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400'}`}
                            >
                                Themes
                            </button>
                            <button 
                                onClick={() => onSetShopTab('stickers')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shopTab === 'stickers' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400'}`}
                            >
                                Stickers
                            </button>
                            <button 
                                onClick={() => onSetShopTab('wallpapers')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shopTab === 'wallpapers' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400'}`}
                            >
                                Wallpapers
                            </button>
                        </div>
                    </div>

                    {shopTab === 'themes' && (
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            <ThemeButton id="classic" label="Classic" icon={X} colorClass="text-rose-500" />
                            <ThemeButton id="love" label="Love" icon={Heart} colorClass="text-rose-500" />
                            <ThemeButton id="nature" label="Nature" icon={Leaf} colorClass="text-emerald-500" />
                        </div>
                    )}

                    {shopTab === 'stickers' && (
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            {Object.values(STICKER_CONFIG).filter(s => s.id !== 'hi').map(s => (
                                <StickerButton key={s.id} id={s.id} content={s.content} cost={s.cost} />
                            ))}
                        </div>
                    )}

                    {shopTab === 'wallpapers' && (
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            {Object.keys(WALLPAPER_CONFIG).map((id) => (
                                <WallpaperButton 
                                        key={id} 
                                        id={id} 
                                        label={WALLPAPER_CONFIG[id as Wallpaper].name} 
                                        icon={WALLPAPER_CONFIG[id as Wallpaper].icon}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: Start Button */}
            <div className="p-6 pt-2 shrink-0 bg-white/90 backdrop-blur-sm z-10">
                <button
                    onClick={onStart}
                    className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                    Start Game
                </button>
            </div>
          </div>
        )}

        {/* WIN/LOSE/DRAW SCREENS CONTAINER */}
        {(status === GameStatus.WON || status === GameStatus.LOST || status === GameStatus.DRAW) && (
            <div className="flex flex-col p-3">
                
                {/* WIN SCREEN - COUPON STYLE */}
                {status === GameStatus.WON && (
                <div className="animate-pop">
                    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-4">
                    {/* Decorative top stripe */}
                    <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                    
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full text-green-500 mb-4 animate-bounce">
                        <Gift size={32} />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-slate-800 mb-1">Congratulations!</h2>
                        <p className="text-slate-500 text-sm mb-4">
                        {gameMode === 'local' ? "Player X wins the match!" : "You've unlocked a special discount."}
                        </p>

                        {/* Reward Pill */}
                        {gameMode !== 'local' && (
                            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full font-bold text-sm mb-6">
                                <span>+15</span>
                                <Heart size={14} fill="currentColor" />
                            </div>
                        )}
                        
                        {/* Coupon Box - Only show for Single Player */}
                        {gameMode !== 'local' && (
                            <div 
                            onClick={handleCopy}
                            className="relative group cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-5 transition-colors hover:border-teal-400 hover:bg-teal-50/30"
                            >
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Your Promo Code</div>
                            <div className="flex items-center justify-center gap-3">
                                <span className="font-mono text-2xl font-bold text-slate-700 tracking-widest">
                                {promoCode}
                                </span>
                                <div className="text-slate-400 group-hover:text-teal-500 transition-colors">
                                {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20} />}
                                </div>
                            </div>
                            {copied && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-[1px] rounded-lg text-green-600 font-bold text-sm">
                                Copied to clipboard!
                                </div>
                            )}
                            </div>
                        )}
                        
                        {gameMode !== 'local' && <p className="text-[10px] text-slate-400 mt-2">Tap the code to copy</p>}
                    </div>

                    {/* Perforated edge visual at bottom */}
                    <div className="relative h-4 bg-slate-100 flex items-end justify-between px-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-slate-200/50 -mb-2"></div>
                        ))}
                    </div>
                    </div>

                    <div className="flex gap-3">
                    <button
                        onClick={onRestart}
                        className="flex-1 py-4 bg-white text-slate-600 font-bold rounded-2xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-[0.3] flex items-center justify-center py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
                        title="Share with friends"
                    >
                        <Share2 size={24} />
                    </button>
                    </div>
                </div>
                )}

                {/* LOSE SCREEN */}
                {status === GameStatus.LOST && (
                <div className="bg-white/90 rounded-3xl p-8 shadow-2xl border-4 border-white ring-4 ring-rose-50 animate-pop text-center">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-400 mb-4">
                    <Frown size={40} />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-slate-700">
                        {gameMode === 'local' ? "Player O Wins!" : "Better luck next time"}
                    </h2>
                    <p className="text-slate-500 mt-2 mb-4">
                        {gameMode === 'local' ? "Well played both." : "The computer won this round."}
                    </p>
                    {gameMode !== 'local' && (
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full font-bold text-sm mb-8">
                            <span>+2</span>
                            <Heart size={14} fill="currentColor" />
                        </div>
                    )}
                    <button
                    onClick={onRestart}
                    className="w-full py-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                    Try Again
                    </button>
                </div>
                )}

                {/* DRAW SCREEN */}
                {status === GameStatus.DRAW && (
                <div className="bg-white/90 rounded-3xl p-8 shadow-2xl border-4 border-white ring-4 ring-amber-50 animate-pop text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-4">
                    <Ticket size={40} />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-slate-700">It's a Draw!</h2>
                    <p className="text-slate-500 mt-2 mb-4">A close match. One more try?</p>
                    {gameMode !== 'local' && (
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-500 px-4 py-1.5 rounded-full font-bold text-sm mb-8">
                            <span>+5</span>
                            <Heart size={14} fill="currentColor" />
                        </div>
                    )}
                    <button
                    onClick={onRestart}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                    Play Again
                    </button>
                </div>
                )}

            </div>
        )}

      </div>
    </div>
  );
};

export default Overlay;