export type PlayerSymbol = 'X' | 'O' | null;

export type Theme = 'classic' | 'love' | 'nature';

export type Wallpaper = 'cloudy' | 'starry' | 'sakura' | 'mint';

export type GameMode = 'easy' | 'hard' | 'local' | 'zen';

export enum GameStatus {
  LOADING = 'LOADING',
  WELCOME = 'WELCOME',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  DRAW = 'DRAW',
}

export interface CellProps {
  index: number;
  value: PlayerSymbol;
  onClick: (index: number) => void;
  disabled: boolean;
  isWinningCell: boolean;
}

export interface GameState {
  board: PlayerSymbol[];
  status: GameStatus;
  isPlayerTurn: boolean;
  promoCode: string | null;
  winningLine: number[] | null;
  gameMode: GameMode;
}

export interface TelegramMock {
  sendData: (data: string) => void;
  close: () => void;
  expand: () => void;
}

export interface PlayerStats {
  displayName: string;
  avatarId: string;
  currency: number; 
  ownedThemes: Theme[];
  ownedStickers: string[];
  ownedWallpapers: Wallpaper[]; // New
  activeWallpaper: Wallpaper; // New
  unlockedAffirmations: string[];
  lastAffirmationDate: string | null;
  lastSpinDate: string | null; 
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; 
}

export interface Affirmation {
  id: string;
  text: string;
  subText: string;
  icon: string;
  color: string;
}

export type QuestType = 'play' | 'win' | 'win_hard' | 'draw' | 'streak';

export interface DailyQuest {
  date: string; // YYYY-MM-DD
  id: string;
  type: QuestType;
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
}

export type ReactionType = 'start' | 'thinking' | 'block' | 'win' | 'lose' | 'draw' | 'good_move';