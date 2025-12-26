import React, { useState, useEffect, useRef } from 'react';
import { GameStatus, PlayerSymbol, Theme, GameMode, PlayerStats, DailyQuest, Affirmation, Wallpaper } from './types';
import { checkWinner, isBoardFull, getBestMove, generatePromoCode, checkNewAchievements, ACHIEVEMENTS, getRandomPhrase, AVATARS, STICKER_CONFIG, WALLPAPER_CONFIG } from './services/gameLogic';
import { notifyTelegramBot, triggerHaptic, triggerNotification } from './services/telegramService';
import { playPop, playSoftTap, playWin, playLose, playDraw, initAudio, setGlobalMute } from './services/audioService';
import { getStats, updateGameStats, getSettings, saveSettings, getDailyQuest, saveDailyQuest, updateDisplayName, updateAvatar, purchaseTheme, claimQuestReward, purchaseSticker, checkAndUnlockAffirmation, canSpinWheel, recordSpin, purchaseWallpaper, saveEarnedPromoCode, redeemPromoCode, getActiveDiscount, getEarnedPromoCodes, addHearts } from './services/storage';
import { Decorations, Confetti, TouchParticles } from './components/Decorations';
import Cell from './components/Cell';
import Overlay from './components/Overlay';
import StatsModal from './components/StatsModal';
import JournalModal from './components/JournalModal';
import CardReveal from './components/CardReveal';
import FortuneWheel from './components/FortuneWheel';
import LivingAvatar from './components/LivingAvatar';
import { RefreshCw, User, Cpu, Users, RotateCcw, Volume2, VolumeX, Cat, Dog, Rabbit, Bird, Fish, Turtle, Heart, MessageCircle, Home, Infinity, Menu, X } from 'lucide-react';

interface HistoryItem {
  board: PlayerSymbol[];
  isPlayerTurn: boolean;
  xMoves: number[]; // For Zen Mode Undo
  oMoves: number[];
}

const App: React.FC = () => {
  const [board, setBoard] = useState<PlayerSymbol[]>(Array(9).fill(null));
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [theme, setTheme] = useState<Theme>('classic');
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  const [playerStats, setPlayerStats] = useState<PlayerStats>(getStats());
  const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  
  // Zen Mode Logic: Queues to track move order
  const [xMoves, setXMoves] = useState<number[]>([]);
  const [oMoves, setOMoves] = useState<number[]>([]);

  // Sticker Logic
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [playerEmote, setPlayerEmote] = useState<string | null>(null);
  const [aiEmote, setAiEmote] = useState<string | null>(null);
  
  // Affirmation Logic
  const [newAffirmation, setNewAffirmation] = useState<Affirmation | null>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // Wheel Logic
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  // Shop Logic
  const [shopTab, setShopTab] = useState<'themes' | 'stickers' | 'wallpapers'>('themes');

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const cpuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiEmoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // UI State
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    // Initial Load
    const stats = getStats();
    
    const tg = (window as any).Telegram?.WebApp;
    if (stats.displayName === 'Player' && tg?.initDataUnsafe?.user?.first_name) {
       const newName = tg.initDataUnsafe.user.first_name;
       const updated = updateDisplayName(newName);
       setPlayerStats(updated);
    } else {
       setPlayerStats(stats);
    }
    
    // Daily Quest
    setDailyQuest(getDailyQuest());

    const settings = getSettings();
    setSoundEnabled(settings.soundEnabled);
    setGlobalMute(!settings.soundEnabled);

    // Handle startapp parameter from Telegram
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('startapp') || tg?.initDataUnsafe?.start_param;
    
    const timer = setTimeout(() => {
      setStatus(GameStatus.WELCOME);
      
      // Open specific screen based on startapp parameter
      if (startParam) {
        setTimeout(() => {
          switch (startParam) {
            case 'stats':
              setIsStatsOpen(true);
              break;
            case 'daily':
              setIsWheelOpen(true);
              break;
            case 'shop':
              setShopTab('themes');
              break;
            case 'hearts':
              setShopTab('themes');
              break;
          }
        }, 100);
      }
    }, 2000);
    
    // 3D Tilt Listener
    const handleMove = (e: MouseEvent) => {
        // Only tilt on desktop/larger screens with hover capability to avoid mobile scroll issues
        if (window.matchMedia("(hover: hover)").matches) {
            // Calculate tilt based on center of screen
            // Range: -5deg to 5deg
            const x = (e.clientX / window.innerWidth - 0.5) * 10; 
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            
            // Use RAF for performance if needed, but react state update might be enough for simple effect
            // For smoother performance, we could use a ref and update style directly, but state is cleaner to read here
            requestAnimationFrame(() => setTilt({ x, y }));
        }
    };
    window.addEventListener('mousemove', handleMove);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  useEffect(() => {
    if (status === GameStatus.PLAYING && !isPlayerTurn && gameMode !== 'local') {
      if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
      
      // AI thinking phrase
      if (Math.random() > 0.8) triggerAiReaction('thinking');

      cpuTimerRef.current = setTimeout(() => {
        makeComputerMove();
      }, 800); 
    }
    return () => {
      if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isPlayerTurn, board, gameMode]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setGlobalMute(!newState);
    saveSettings({ soundEnabled: newState });
    if (newState) {
      initAudio();
      playSoftTap();
    }
  };

  const handleUpdateName = (name: string) => {
      const updated = updateDisplayName(name);
      setPlayerStats(updated);
  };

  const handleUpdateAvatar = (id: string) => {
      const updated = updateAvatar(id);
      setPlayerStats(updated);
  };

  const handleBuyTheme = (t: Theme) => {
      const result = purchaseTheme(t);
      if (result.success) {
          setPlayerStats(result.stats);
          setTheme(t);
          playWin();
          triggerNotification('success');
          notifyTelegramBot(`Purchased theme: ${t}`);
      } else {
          triggerHaptic('rigid');
          notifyTelegramBot("Not enough hearts!");
      }
  };

  const handleBuySticker = (id: string) => {
      const result = purchaseSticker(id);
      if (result.success) {
          setPlayerStats(result.stats);
          triggerHaptic('light');
          triggerNotification('success');
      } else {
          triggerHaptic('rigid');
          notifyTelegramBot("Not enough hearts!");
      }
  };

  const handleBuyWallpaper = (id: Wallpaper) => {
      const result = purchaseWallpaper(id);
      if (result.success) {
          setPlayerStats(result.stats);
          triggerHaptic('light');
          triggerNotification('success');
      } else {
          triggerHaptic('rigid');
          notifyTelegramBot("Not enough hearts!");
      }
  };

  const handleRedeemCode = (code: string) => {
      const result = redeemPromoCode(code);
      if (result.success) {
          setPlayerStats(result.stats);
          playWin();
          triggerNotification('success');
          notifyTelegramBot(`Promo redeemed: ${code}`, { type: 'promo', code });
      } else {
          triggerHaptic('rigid');
          notifyTelegramBot(result.message);
      }
  };

  const handleAddHearts = (hearts: number) => {
      const newStats = addHearts(hearts);
      setPlayerStats(newStats);
      playWin();
      triggerNotification('success');
  };

  const handleSpinComplete = (prize: number) => {
      const newStats = recordSpin(prize);
      setPlayerStats(newStats);
      playWin();
      triggerNotification('success');
      notifyTelegramBot(`Wheel Reward: ${prize} Hearts`);
      
      // Close after short delay
      setTimeout(() => {
          setIsWheelOpen(false);
      }, 2000);
  };

  const triggerAiReaction = (type: any) => {
      if (gameMode === 'local') return;
      if (aiMessageTimerRef.current) clearTimeout(aiMessageTimerRef.current);
      
      const msg = getRandomPhrase(type);
      setAiMessage(msg);

      aiMessageTimerRef.current = setTimeout(() => {
          setAiMessage(null);
      }, 3000);
  };

  const handleSendEmote = (id: string) => {
      setShowEmotePicker(false);
      setPlayerEmote(STICKER_CONFIG[id].content);
      
      if (emoteTimerRef.current) clearTimeout(emoteTimerRef.current);
      emoteTimerRef.current = setTimeout(() => {
          setPlayerEmote(null);
      }, 3000);

      // AI Reacts
      if (gameMode !== 'local') {
          setTimeout(() => {
              // Simple AI logic: respond randomly from owned stickers (simulated)
              const keys = Object.keys(STICKER_CONFIG);
              const randomKey = keys[Math.floor(Math.random() * keys.length)];
              setAiEmote(STICKER_CONFIG[randomKey].content);
              
              if (aiEmoteTimerRef.current) clearTimeout(aiEmoteTimerRef.current);
              aiEmoteTimerRef.current = setTimeout(() => {
                  setAiEmote(null);
              }, 3000);
          }, 1500);
      }
  };

  const goToShop = () => {
    setShopTab('stickers');
    setStatus(GameStatus.WELCOME);
    setShowEmotePicker(false);
    triggerHaptic('light');
  };

  const startGame = () => {
    initAudio();
    setBoard(Array(9).fill(null));
    setStatus(GameStatus.PLAYING);
    
    // Randomize starting player
    const startPlayer = Math.random() > 0.5;
    setIsPlayerTurn(startPlayer);
    
    setWinningLine(null);
    setPromoCode(null);
    setHistory([]);
    setAiMessage(null);
    setPlayerEmote(null);
    setAiEmote(null);
    setXMoves([]);
    setOMoves([]);
    setShowEmotePicker(false);
    triggerHaptic('light');

    if (gameMode !== 'local') {
        if (!startPlayer) {
             setAiMessage("I'll start!");
             setTimeout(() => setAiMessage(null), 2000);
        } else {
             setTimeout(() => triggerAiReaction('start'), 500);
        }
    } else {
        notifyTelegramBot(startPlayer ? "Player X Starts" : "Player O Starts");
    }
  };

  const goToMenu = () => {
    setStatus(GameStatus.WELCOME);
    triggerHaptic('light');
  };

  const handleUndo = () => {
    if (history.length === 0 || status !== GameStatus.PLAYING) return;
    if (cpuTimerRef.current) {
      clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }
    triggerHaptic('medium');
    playSoftTap();

    const lastState = history[history.length - 1];
    setBoard(lastState.board);
    setIsPlayerTurn(lastState.isPlayerTurn);
    setXMoves(lastState.xMoves);
    setOMoves(lastState.oMoves);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleCellClick = (index: number) => {
    if (board[index] || status !== GameStatus.PLAYING) return;
    if (gameMode !== 'local' && !isPlayerTurn) return;

    triggerHaptic('light');
    if (gameMode === 'local' && !isPlayerTurn) {
        playSoftTap();
    } else {
        playPop();
    }

    setHistory(prev => [...prev, { board: [...board], isPlayerTurn, xMoves: [...xMoves], oMoves: [...oMoves] }]);

    const newBoard = [...board];
    const currentPlayer = isPlayerTurn ? 'X' : 'O';
    let newXMoves = [...xMoves];
    let newOMoves = [...oMoves];

    // ZEN MODE LOGIC
    if (gameMode === 'zen') {
        const moves = isPlayerTurn ? newXMoves : newOMoves;
        if (moves.length >= 3) {
            // Remove the oldest move
            const oldestIndex = moves.shift();
            if (oldestIndex !== undefined) {
                newBoard[oldestIndex] = null;
            }
        }
        moves.push(index);
    }

    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    if (isPlayerTurn) setXMoves(newXMoves); else setOMoves(newOMoves);

    const gameEnded = checkGameEnd(newBoard, currentPlayer);
    if (!gameEnded) {
        setIsPlayerTurn(!isPlayerTurn);
    }
  };

  const makeComputerMove = () => {
    if (status !== GameStatus.PLAYING) return;
    
    // For Zen Mode AI, we fall back to 'easy' heuristics for now as Minimax is complex with fading states
    // But we still apply the fading logic
    const difficulty = gameMode === 'zen' ? 'easy' : gameMode;
    const bestMoveIndex = getBestMove(board, difficulty);
    
    if (bestMoveIndex !== -1) {
      // Check if CPU blocks player (if move prevents X win)
      const tempBoard = [...board];
      tempBoard[bestMoveIndex] = 'X';
      const { winner } = checkWinner(tempBoard);
      if (winner === 'X') {
          triggerAiReaction('block');
      }

      const newBoard = [...board];
      let newOMoves = [...oMoves];

      // ZEN MODE LOGIC FOR CPU
      if (gameMode === 'zen') {
          if (newOMoves.length >= 3) {
              const oldestIndex = newOMoves.shift();
              if (oldestIndex !== undefined) {
                  newBoard[oldestIndex] = null;
              }
          }
          newOMoves.push(bestMoveIndex);
          setOMoves(newOMoves);
      }

      newBoard[bestMoveIndex] = 'O';
      setBoard(newBoard);
      triggerHaptic('soft');
      playSoftTap();
      const gameEnded = checkGameEnd(newBoard, 'O');
      if (!gameEnded) {
          setIsPlayerTurn(true);
      }
    }
  };

  const checkQuestProgress = (result: 'win' | 'loss' | 'draw') => {
      if (!dailyQuest || dailyQuest.isCompleted || gameMode === 'local') return;

      let increment = 0;
      
      switch (dailyQuest.type) {
          case 'play': increment = 1; break;
          case 'win': if (result === 'win') increment = 1; break;
          case 'win_hard': if (result === 'win' && gameMode === 'hard') increment = 1; break;
          case 'draw': if (result === 'draw') increment = 1; break;
      }

      if (dailyQuest.type === 'streak') {
           const currentStats = getStats(); 
           if (currentStats.currentStreak >= dailyQuest.target) {
               completeQuest();
               return;
           }
      }

      if (increment > 0) {
          const newProgress = Math.min(dailyQuest.target, dailyQuest.progress + increment);
          const isCompleted = newProgress >= dailyQuest.target;
          
          const updatedQuest = { ...dailyQuest, progress: newProgress, isCompleted };
          setDailyQuest(updatedQuest);
          saveDailyQuest(updatedQuest);

          if (isCompleted) {
             completeQuest();
          }
      }
  };

  const completeQuest = () => {
      if (!dailyQuest) return;
      const updatedQuest = { ...dailyQuest, isCompleted: true, progress: dailyQuest.target };
      setDailyQuest(updatedQuest);
      saveDailyQuest(updatedQuest);
      
      const newStats = claimQuestReward();
      setPlayerStats(newStats);
      notifyTelegramBot("Daily Quest Completed! +50 Hearts");
  };

  const updateStatsAfterGame = (result: 'win' | 'loss' | 'draw') => {
      if (gameMode === 'local') return;
      
      const updatedStats = updateGameStats(result);
      
      setPlayerStats(updatedStats);

      checkQuestProgress(result);

      // Check achievements
      const newUnlockIds = checkNewAchievements(updatedStats);
      if (newUnlockIds.length > 0) {
          const finalStats = updateGameStats(result, newUnlockIds); 
          setPlayerStats(finalStats);
          const achNames = newUnlockIds.map(id => ACHIEVEMENTS.find(a => a.id === id)?.title).join(', ');
          notifyTelegramBot(`Achievement Unlocked: ${achNames}`);
      }
      
      // Check for Daily Affirmation
      if (result === 'win') {
          const { stats: afterAffirmationStats, newAffirmation } = checkAndUnlockAffirmation();
          if (newAffirmation) {
              setPlayerStats(afterAffirmationStats);
              // Delay the reveal slightly so it appears after game end visuals
              setTimeout(() => {
                  setNewAffirmation(newAffirmation);
                  playWin(); // Play sound again for the drop
              }, 1500);
          }
      }
  };

  const checkGameEnd = (currentBoard: PlayerSymbol[], lastPlayer: PlayerSymbol): boolean => {
    const { winner, line } = checkWinner(currentBoard);

    if (winner) {
      setWinningLine(line);
      
      if (winner === 'X') {
        setScores(prev => ({ ...prev, player1: prev.player1 + 1 }));
        if (gameMode !== 'local') {
            updateStatsAfterGame('win');
            triggerAiReaction('lose');
            const code = generatePromoCode();
            setPromoCode(code);
            saveEarnedPromoCode(code);
            notifyTelegramBot(`Victory! Code: ${code}`, { type: 'win', code });
        }
        setTimeout(() => {
          setStatus(GameStatus.WON);
          triggerNotification('success');
          playWin();
        }, 500);
      } else {
        setScores(prev => ({ ...prev, player2: prev.player2 + 1 }));
        if (gameMode !== 'local') {
            updateStatsAfterGame('loss');
            triggerAiReaction('win');
            setAiEmote(STICKER_CONFIG['party'].content);
            setTimeout(() => setAiEmote(null), 3000);
        }
        setTimeout(() => {
          setStatus(GameStatus.LOST);
          triggerNotification('error');
          playLose();
          if (gameMode !== 'local') notifyTelegramBot("Loss", { type: 'lose' });
        }, 500);
      }
      return true;
    } else if (isBoardFull(currentBoard) && gameMode !== 'zen') {
      // Draw is only possible if board is full AND not zen mode (zen mode is infinite unless board full check needs adjustment, but queues prevent full board usually. Technically 3+3=6, never 9)
      if (gameMode !== 'local') {
          updateStatsAfterGame('draw');
          triggerAiReaction('draw');
      }
      setTimeout(() => {
        setStatus(GameStatus.DRAW);
        triggerNotification('warning');
        playDraw();
      }, 500);
      return true;
    }
    return false;
  };

  const getStatusText = () => {
      if (status !== GameStatus.PLAYING) return "Pastel Edition";
      if (gameMode === 'local') {
          return isPlayerTurn ? `${playerStats.displayName} (X) Turn` : "Player 2 (O) Turn";
      } else {
          return isPlayerTurn ? "Your turn" : "Computer is thinking...";
      }
  };

  const currentWallpaperConfig = WALLPAPER_CONFIG[playerStats.activeWallpaper];
  const textColorClass = currentWallpaperConfig.textColor;

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ perspective: '1000px' }}>
      <Decorations wallpaper={playerStats.activeWallpaper} />
      <TouchParticles wallpaper={playerStats.activeWallpaper} />
      
      {status === GameStatus.WON && <Confetti theme={theme} />}

      {/* Affirmation Reveal Overlay */}
      {newAffirmation && (
          <CardReveal 
             affirmation={newAffirmation}
             onClose={() => setNewAffirmation(null)}
          />
      )}

      {/* Fortune Wheel Modal */}
      <FortuneWheel 
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onSpinComplete={handleSpinComplete}
        canSpin={canSpinWheel()}
      />

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-rose-500 text-xs font-bold">
            <Heart size={14} fill="currentColor" />
            <span>{playerStats.currency}</span>
        </div>
        <button 
          onClick={toggleSound}
          className={`self-end p-3 bg-white/40 backdrop-blur-md rounded-full shadow-sm hover:text-rose-500 transition-all hover:bg-white active:scale-95 ${playerStats.activeWallpaper === 'starry' ? 'text-white' : 'text-slate-500'}`}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <header className="z-30 mb-6 text-center animate-pop relative w-full max-w-sm">
        <h1 className={`text-4xl font-heading font-bold drop-shadow-sm tracking-wide ${playerStats.activeWallpaper === 'starry' ? 'text-indigo-200' : 'text-rose-400'}`}>
          Tic-Tac-Toe
        </h1>
        {gameMode === 'zen' && (
             <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1">
                 <Infinity size={10} /> Zen Mode
             </div>
        )}
        <p className={`font-medium mt-1 mb-4 h-6 transition-all ${playerStats.activeWallpaper === 'starry' ? 'text-indigo-300' : 'text-slate-500'}`}>
          {getStatusText()}
        </p>

        {(status === GameStatus.PLAYING || status === GameStatus.WON || status === GameStatus.LOST || status === GameStatus.DRAW) && (
            <div className="flex justify-between items-end px-4 relative">
                
                {/* Player 1 Stats - NOW WITH LIVING AVATAR */}
                 <div className="flex flex-col items-center gap-1 relative z-30 animate-float">
                    {/* Emote Bubble */}
                    {playerEmote && (
                        <div className="absolute bottom-full mb-2 left-0 animate-pop">
                            <div className="bg-white rounded-2xl rounded-bl-none px-3 py-2 shadow-lg text-2xl">
                                {playerEmote}
                            </div>
                        </div>
                    )}
                    
                    {/* Emote Picker Trigger */}
                     {status === GameStatus.PLAYING && (
                         <button 
                             onClick={() => setShowEmotePicker(!showEmotePicker)}
                             className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm text-slate-400 hover:text-rose-500 transition-colors z-40"
                         >
                             <MessageCircle size={14} fill="currentColor" />
                         </button>
                     )}
                     
                     {/* Emote Picker Grid */}
                     {showEmotePicker && (
                         <div className="absolute top-full mt-2 left-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-2 grid grid-cols-4 gap-2 w-48 z-50 animate-pop border border-slate-100">
                             {playerStats.ownedStickers.map(id => (
                                 <button 
                                    key={id}
                                    onClick={() => handleSendEmote(id)}
                                    className="text-2xl hover:scale-110 transition-transform p-1"
                                 >
                                     {STICKER_CONFIG[id]?.content}
                                 </button>
                             ))}
                             <button onClick={goToShop} className="col-span-4 text-[10px] text-slate-400 font-bold uppercase py-1 hover:text-rose-500">
                                 Get more in Shop
                             </button>
                         </div>
                     )}

                    {/* LIVING AVATAR COMPONENT */}
                    <div className="w-16 h-16 drop-shadow-md">
                        <LivingAvatar 
                           avatarId={playerStats.avatarId}
                           status={status}
                           isPlayerTurn={isPlayerTurn}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-rose-500 font-bold bg-white/60 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        <span>{scores.player1}</span>
                    </div>
                 </div>

                 <div className="h-full pb-6 opacity-30">
                    <div className={`w-px h-8 ${playerStats.activeWallpaper === 'starry' ? 'bg-indigo-300' : 'bg-slate-400'}`}></div>
                 </div>

                 {/* CPU Stats */}
                 <div className="flex flex-col items-center gap-1 relative z-20 animate-float-delayed">
                    {/* AI Chat Bubble (Text) */}
                    {aiMessage && (
                        <div className="absolute bottom-full mb-2 right-0 w-32 bg-white rounded-2xl rounded-br-none p-2 shadow-lg animate-pop">
                            <p className="text-[10px] font-bold text-slate-600 text-center leading-tight">
                                {aiMessage}
                            </p>
                        </div>
                    )}
                    
                    {/* AI Emote Bubble (Emoji) */}
                    {aiEmote && (
                        <div className="absolute bottom-full mb-10 right-0 animate-pop z-30">
                             <div className="bg-white rounded-2xl rounded-br-none px-3 py-2 shadow-lg text-2xl border border-purple-100">
                                {aiEmote}
                            </div>
                        </div>
                    )}
                    
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-400 flex items-center justify-center shadow-sm border-2 border-white">
                        {gameMode === 'local' ? <Users size={24} /> : <Cpu size={24} />}
                    </div>
                    <div className="flex items-center gap-2 text-purple-500 font-bold bg-white/60 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        <span>{scores.player2}</span>
                    </div>
                 </div>
            </div>
        )}
      </header>

      <div 
        className="z-10 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] shadow-xl border border-white/60 transition-transform duration-100 ease-out"
        style={{
            transform: `perspective(1000px) rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)`
        }}
      >
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {board.map((cell, index) => {
              // Check for fading in Zen Mode
              let isFading = false;
              if (gameMode === 'zen') {
                  if (cell === 'X' && xMoves.length === 3 && xMoves[0] === index) isFading = true;
                  if (cell === 'O' && oMoves.length === 3 && oMoves[0] === index) isFading = true;
              }
              
              return (
                <Cell
                  key={index}
                  value={cell}
                  onClick={() => handleCellClick(index)}
                  disabled={status !== GameStatus.PLAYING || (gameMode !== 'local' && !isPlayerTurn)}
                  highlight={winningLine?.includes(index) ?? false}
                  theme={theme}
                  isFading={isFading}
                />
              );
          })}
        </div>
      </div>

      {/* Floating Menu Button - Top Left */}
      {status === GameStatus.PLAYING && (
        <div className="fixed left-4 top-4 z-50">
          {/* Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-rose-400 text-white shadow-lg flex items-center justify-center hover:bg-rose-500 active:scale-95 transition-all"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Menu Items */}
          {isMenuOpen && (
            <div className="absolute top-12 left-0 flex flex-col gap-2 animate-pop">
              <button
                onClick={() => { handleUndo(); setIsMenuOpen(false); }}
                disabled={history.length === 0}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                  history.length > 0 
                    ? 'bg-white text-slate-600 hover:text-rose-500 active:scale-95' 
                    : 'bg-white/50 text-slate-300 cursor-not-allowed'
                }`}
                title="Undo"
              >
                <RotateCcw size={20} />
              </button>
              
              <button
                onClick={() => { startGame(); setIsMenuOpen(false); }}
                className="w-12 h-12 rounded-full bg-white text-slate-600 shadow-lg flex items-center justify-center hover:text-rose-500 active:scale-95 transition-all"
                title="Restart"
              >
                <RefreshCw size={20} />
              </button>
              
              <button
                onClick={() => { goToMenu(); setIsMenuOpen(false); }}
                className="w-12 h-12 rounded-full bg-white text-slate-600 shadow-lg flex items-center justify-center hover:text-rose-500 active:scale-95 transition-all"
                title="Menu"
              >
                <Home size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {status === GameStatus.LOADING && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-rose-50/80 backdrop-blur-sm">
            <div className="animate-spin text-rose-400">
               <RefreshCw size={40} />
            </div>
         </div>
      )}

      <Overlay 
        status={status} 
        promoCode={promoCode} 
        onStart={startGame} 
        onRestart={startGame}
        theme={theme}
        onSetTheme={setTheme}
        onBuyTheme={handleBuyTheme}
        onBuySticker={handleBuySticker}
        onBuyWallpaper={handleBuyWallpaper}
        totalWins={playerStats.totalWins}
        currency={playerStats.currency}
        ownedThemes={playerStats.ownedThemes}
        ownedStickers={playerStats.ownedStickers}
        ownedWallpapers={playerStats.ownedWallpapers}
        activeWallpaper={playerStats.activeWallpaper}
        gameMode={gameMode}
        onSetGameMode={setGameMode}
        onShowStats={() => setIsStatsOpen(true)}
        onShowJournal={() => setIsJournalOpen(true)}
        onShowWheel={() => setIsWheelOpen(true)}
        canSpin={canSpinWheel()}
        dailyQuest={dailyQuest}
        shopTab={shopTab}
        onSetShopTab={setShopTab}
        earnedCodes={getEarnedPromoCodes()}
        activeDiscount={getActiveDiscount()}
        onRedeemCode={handleRedeemCode}
        onAddHearts={handleAddHearts}
      />

      <StatsModal 
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={playerStats}
        onUpdateName={handleUpdateName}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <JournalModal 
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        stats={playerStats}
      />
    </div>
  );
};

export default App;