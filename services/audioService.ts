// Simple synth for UI sounds without external assets
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;
let isMuted = false;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
};

export const setGlobalMute = (muted: boolean) => {
  isMuted = muted;
};

const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0, vol = 0.1) => {
  if (isMuted) return;
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
  
  // Envelope to avoid clicking sounds
  gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration);
};

export const playPop = () => {
    initAudio();
    // High soft sine wave
    playTone(800, 'sine', 0.15, 0, 0.05);
};

export const playSoftTap = () => {
    initAudio();
    // Lower soft sine
    playTone(600, 'sine', 0.15, 0, 0.05);
};

export const playWin = () => {
    initAudio();
    // Major Arpeggio (C5, E5, G5, C6)
    playTone(523.25, 'sine', 0.4, 0, 0.08);
    playTone(659.25, 'sine', 0.4, 0.1, 0.08);
    playTone(783.99, 'sine', 0.4, 0.2, 0.08);
    playTone(1046.50, 'sine', 0.8, 0.3, 0.08);
};

export const playLose = () => {
    initAudio();
    // Descending minor interval
    playTone(440, 'triangle', 0.4, 0, 0.05);
    playTone(311.13, 'triangle', 0.6, 0.3, 0.05);
};

export const playDraw = () => {
    initAudio();
    playTone(400, 'sine', 0.2, 0, 0.05);
    playTone(400, 'sine', 0.2, 0.2, 0.05);
};