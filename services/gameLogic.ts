import { PlayerSymbol, GameMode, Achievement, PlayerStats, DailyQuest, QuestType, ReactionType, Theme, Affirmation, Wallpaper } from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Economy Config
export const REWARDS = {
    WIN: 15,
    DRAW: 5,
    LOSS: 2,
    QUEST: 50
};

export const WHEEL_PRIZES = [
  { id: 'hearts_10', label: '10', value: 10, color: '#fda4af' }, // rose-300
  { id: 'hearts_50', label: '50', value: 50, color: '#fcd34d' }, // amber-300
  { id: 'hearts_20', label: '20', value: 20, color: '#6ee7b7' }, // emerald-300
  { id: 'hearts_100', label: '100', value: 100, color: '#c4b5fd' }, // violet-300
  { id: 'hearts_15', label: '15', value: 15, color: '#93c5fd' }, // blue-300
  { id: 'jackpot', label: '200', value: 200, color: '#f9a8d4' }, // pink-300
];

export const THEME_CONFIG: Record<Theme, { name: string, cost: number, icon: any, color: string }> = {
    classic: { name: 'Classic', cost: 0, icon: 'X', color: 'text-rose-500' },
    love: { name: 'Love', cost: 100, icon: 'Heart', color: 'text-rose-500' },
    nature: { name: 'Nature', cost: 200, icon: 'Leaf', color: 'text-emerald-500' }
};

export const WALLPAPER_CONFIG: Record<Wallpaper, { name: string, cost: number, colors: string, icon: string, textColor: string }> = {
    cloudy: { name: 'Dreamy', cost: 0, colors: 'from-rose-50 via-purple-50 to-orange-50', icon: 'Cloud', textColor: 'text-slate-700' },
    starry: { name: 'Midnight', cost: 150, colors: 'from-slate-900 via-indigo-950 to-slate-900', icon: 'Moon', textColor: 'text-white' },
    sakura: { name: 'Sakura', cost: 120, colors: 'from-pink-50 via-rose-100 to-red-50', icon: 'Flower', textColor: 'text-rose-800' },
    mint: { name: 'Fresh', cost: 80, colors: 'from-emerald-50 via-teal-50 to-cyan-50', icon: 'Leaf', textColor: 'text-teal-800' }
};

export const STICKER_CONFIG: Record<string, { id: string, content: string, cost: number }> = {
    hi: { id: 'hi', content: '👋', cost: 0 },
    love: { id: 'love', content: '🥰', cost: 50 },
    cool: { id: 'cool', content: '😎', cost: 50 },
    angry: { id: 'angry', content: '😤', cost: 80 },
    cry: { id: 'cry', content: '😭', cost: 80 },
    laugh: { id: 'laugh', content: '😂', cost: 80 },
    party: { id: 'party', content: '🥳', cost: 120 },
    mindblown: { id: 'mindblown', content: '🤯', cost: 150 },
};

export const AVATARS = [
    { id: 'cat', icon: 'Cat', color: 'text-rose-400', bg: 'bg-rose-100' },
    { id: 'dog', icon: 'Dog', color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'rabbit', icon: 'Rabbit', color: 'text-pink-400', bg: 'bg-pink-100' },
    { id: 'bird', icon: 'Bird', color: 'text-sky-400', bg: 'bg-sky-100' },
    { id: 'fish', icon: 'Fish', color: 'text-teal-400', bg: 'bg-teal-100' },
    { id: 'turtle', icon: 'Turtle', color: 'text-emerald-500', bg: 'bg-emerald-100' },
];

export const AFFIRMATIONS: Affirmation[] = [
    { id: 'joy', text: 'Radiate Joy', subText: 'Your smile is contagious.', icon: 'Sun', color: 'bg-amber-100 text-amber-500' },
    { id: 'calm', text: 'Embrace Calm', subText: 'Breathe in peace.', icon: 'Cloud', color: 'bg-blue-100 text-blue-400' },
    { id: 'strength', text: 'Inner Strength', subText: 'You are capable of anything.', icon: 'Zap', color: 'bg-purple-100 text-purple-500' },
    { id: 'love', text: 'Choose Love', subText: 'Be kind to yourself today.', icon: 'Heart', color: 'bg-rose-100 text-rose-500' },
    { id: 'growth', text: 'Keep Growing', subText: 'Every step forward counts.', icon: 'Sprout', color: 'bg-emerald-100 text-emerald-500' },
    { id: 'magic', text: 'Believe in Magic', subText: 'Miracles happen every day.', icon: 'Sparkles', color: 'bg-indigo-100 text-indigo-500' },
    { id: 'balance', text: 'Find Balance', subText: 'Harmony is within you.', icon: 'Feather', color: 'bg-teal-100 text-teal-500' },
    { id: 'brave', text: 'Be Brave', subText: 'Courage looks good on you.', icon: 'Star', color: 'bg-orange-100 text-orange-500' },
];

export const AI_PHRASES: Record<ReactionType, string[]> = {
    start: ["Let's play!", "Ready?", "I won't go easy!", "Good luck!"],
    thinking: ["Hmm...", "Let me see...", "Interesting...", "Calculated..."],
    block: ["Nice try!", "Blocked!", "Not today!", "Close one!"],
    win: ["Victory is mine!", "I win!", "Checkmate!", "Better luck next time!"],
    lose: ["You got me!", "Well played!", "How?!", "Nice move!"],
    draw: ["It's a tie!", "Even match.", "We are equal.", "Again?"],
    good_move: ["Ooh, risky!", "Smart move.", "I see what you did."]
};

export const getRandomPhrase = (type: ReactionType): string => {
    const phrases = AI_PHRASES[type];
    return phrases[Math.floor(Math.random() * phrases.length)];
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', title: 'First Steps', description: 'Win your first game', icon: 'medal' },
  { id: 'streak_3', title: 'On Fire', description: 'Win 3 games in a row', icon: 'flame' },
  { id: 'veteran', title: 'Veteran', description: 'Play 20 games', icon: 'swords' },
  { id: 'pro', title: 'Champion', description: 'Reach 10 total wins', icon: 'trophy' },
  { id: 'pacifist', title: 'Peacekeeper', description: 'Get 5 draws', icon: 'shield' },
];

export const QUEST_TEMPLATES: { type: QuestType, desc: string, target: number }[] = [
    { type: 'play', desc: 'Play 5 games', target: 5 },
    { type: 'win', desc: 'Win 3 games', target: 3 },
    { type: 'win_hard', desc: 'Win 1 game on Hard difficulty', target: 1 },
    { type: 'draw', desc: 'Get 1 draw', target: 1 },
    { type: 'streak', desc: 'Get a 2-win streak', target: 2 },
];

export const generateDailyQuest = (previousQuest: DailyQuest | null): DailyQuest => {
    const today = new Date().toISOString().split('T')[0];
    
    if (previousQuest && previousQuest.date === today) {
        return previousQuest;
    }

    const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
    
    return {
        date: today,
        id: `quest_${today}_${Math.random().toString(36).substr(2, 9)}`,
        type: template.type,
        description: template.desc,
        target: template.target,
        progress: 0,
        isCompleted: false
    };
};

export const checkNewAchievements = (stats: PlayerStats): string[] => {
  const newUnlocks: string[] = [];

  if (stats.totalWins >= 1 && !stats.unlockedAchievements.includes('first_blood')) {
    newUnlocks.push('first_blood');
  }
  if (stats.currentStreak >= 3 && !stats.unlockedAchievements.includes('streak_3')) {
    newUnlocks.push('streak_3');
  }
  if (stats.gamesPlayed >= 20 && !stats.unlockedAchievements.includes('veteran')) {
    newUnlocks.push('veteran');
  }
  if (stats.totalWins >= 10 && !stats.unlockedAchievements.includes('pro')) {
    newUnlocks.push('pro');
  }
  if (stats.totalDraws >= 5 && !stats.unlockedAchievements.includes('pacifist')) {
    newUnlocks.push('pacifist');
  }

  return newUnlocks;
};

export const checkWinner = (board: PlayerSymbol[]): { winner: PlayerSymbol, line: number[] | null } => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
};

export const isBoardFull = (board: PlayerSymbol[]): boolean => {
  return board.every((cell) => cell !== null);
};

// Minimax Algorithm
const scores = {
  O: 10,
  X: -10,
  TIE: 0
};

export const getBestMove = (board: PlayerSymbol[], difficulty: GameMode): number => {
  const availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
  
  if (availableMoves.length === 0) return -1;

  // Difficulty Logic
  const randomThreshold = difficulty === 'hard' ? 0.1 : 0.7;

  // Chance to make a random move
  if (Math.random() < randomThreshold && availableMoves.length > 1) {
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return randomMove;
  }

  // Optimization for first move
  const emptySpots = board.filter(s => s === null).length;
  if (emptySpots === 9 || emptySpots === 8) {
      if (board[4] === null) return 4;
      return 0; 
  }

  // Minimax Logic
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  
  return move !== -1 ? move : availableMoves[0];
};

const minimax = (board: PlayerSymbol[], depth: number, isMaximizing: boolean): number => {
  const { winner } = checkWinner(board);
  
  if (winner === 'O') return scores.O - depth; 
  if (winner === 'X') return scores.X + depth; 
  if (isBoardFull(board)) return scores.TIE;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export const generatePromoCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};