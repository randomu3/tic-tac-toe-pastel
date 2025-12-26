import React, { useEffect, useRef, useState } from 'react';
import { Star, Heart, Flower, Cloud, Moon, Leaf } from 'lucide-react';
import { Theme, Wallpaper } from '../types';
import { WALLPAPER_CONFIG } from '../services/gameLogic';

interface DecorationsProps {
    wallpaper: Wallpaper;
}

export const Decorations: React.FC<DecorationsProps> = ({ wallpaper }) => {
  const config = WALLPAPER_CONFIG[wallpaper];
  const bgGradient = config ? config.colors : 'from-rose-100 to-purple-100';
  
  // Parallax State
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
      let rafId: number;
      const handleMove = (e: MouseEvent) => {
          // Calculate normalized position -1 to 1 based on screen center
          const x = (e.clientX / window.innerWidth) * 2 - 1;
          const y = (e.clientY / window.innerHeight) * 2 - 1;
          
          // Use RAF to smooth out updates
          rafId = requestAnimationFrame(() => {
              setOffset({ x, y });
          });
      };
      
      window.addEventListener('mousemove', handleMove);
      return () => {
          window.removeEventListener('mousemove', handleMove);
          cancelAnimationFrame(rafId);
      };
  }, []);

  // Helper to generate parallax style
  // Depth > 0 moves with mouse (foreground), Depth < 0 moves opposite (background)
  // Higher magnitude = faster movement
  const parallax = (depth: number) => ({
      transform: `translate(${offset.x * depth * 15}px, ${offset.y * depth * 15}px)`,
      transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)'
  });

  // Determine floating icons based on wallpaper
  const renderIcons = () => {
      switch (wallpaper) {
          case 'starry':
              return (
                  <>
                    <div className="absolute top-10 left-10 text-yellow-100 opacity-60 animate-float" style={parallax(-2)}>
                        <Moon size={32} fill="currentColor" />
                    </div>
                    <div className="absolute top-1/4 right-8 text-blue-200 opacity-40 animate-float-delayed" style={parallax(-1)}>
                        <Star size={24} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-20 left-12 text-indigo-300 opacity-30 animate-float" style={parallax(-3)}>
                        <Star size={40} />
                    </div>
                    <div className="absolute bottom-1/3 right-1/3 text-white opacity-20 animate-pulse" style={parallax(-0.5)}>
                        <Star size={20} fill="currentColor" />
                    </div>
                  </>
              );
           case 'sakura':
               return (
                  <>
                    <div className="absolute top-10 left-10 text-rose-300 opacity-60 animate-float" style={parallax(-2)}>
                        <Flower size={32} />
                    </div>
                    <div className="absolute top-1/4 right-8 text-pink-200 opacity-50 animate-float-delayed" style={parallax(-1)}>
                        <Flower size={24} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-20 left-12 text-red-200 opacity-40 animate-float" style={parallax(-3)}>
                        <Heart size={40} />
                    </div>
                    <div className="absolute bottom-1/3 right-1/3 text-rose-200 opacity-30 animate-pulse" style={parallax(-0.5)}>
                        <Flower size={20} fill="currentColor" />
                    </div>
                  </>
               );
           case 'mint':
               return (
                   <>
                    <div className="absolute top-10 left-10 text-emerald-300 opacity-50 animate-float" style={parallax(-2)}>
                        <Leaf size={32} />
                    </div>
                    <div className="absolute top-1/4 right-8 text-teal-200 opacity-40 animate-float-delayed" style={parallax(-1)}>
                        <Cloud size={24} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-20 left-12 text-cyan-300 opacity-30 animate-float" style={parallax(-3)}>
                        <Leaf size={40} />
                    </div>
                   </>
               );
           default: // cloudy
              return (
                  <>
                    <div className="absolute top-10 left-10 text-rose-300 opacity-40 animate-float" style={parallax(-2)}>
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <div className="absolute top-1/4 right-8 text-purple-300 opacity-40 animate-float-delayed" style={parallax(-1)}>
                        <Cloud size={24} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-20 left-12 text-teal-300 opacity-40 animate-float" style={parallax(-3)}>
                        <Flower size={40} />
                    </div>
                    <div className="absolute bottom-1/3 right-1/3 text-pink-200 opacity-20 animate-pulse" style={parallax(-0.5)}>
                        <Heart size={20} fill="currentColor" />
                    </div>
                  </>
              );
      }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br ${bgGradient} transition-colors duration-1000`}>
      {/* Soft Gradients with Parallax */}
      {wallpaper === 'starry' ? (
          // Special dark mode blobs
          <>
             <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" style={parallax(1)} />
             <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float-delayed" style={parallax(1.5)} />
          </>
      ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-float" style={parallax(1)} />
            <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-float-delayed" style={parallax(0.5)} />
            <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-float" style={parallax(1.2)} />
          </>
      )}

      {renderIcons()}
    </div>
  );
};

export const TouchParticles: React.FC<{ wallpaper: Wallpaper }> = ({ wallpaper }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Config based on wallpaper
    const getColors = () => {
        switch(wallpaper) {
            case 'starry': return ['#fef08a', '#ffffff', '#bfdbfe']; // Yellow, White, Blue
            case 'sakura': return ['#fda4af', '#fecdd3', '#fff1f2']; // Pinks
            case 'mint': return ['#6ee7b7', '#a7f3d0', '#ecfdf5']; // Greens
            default: return ['#bae6fd', '#e0f2fe', '#ffffff']; // Blues/Whites
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: {x: number, y: number, vx: number, vy: number, life: number, color: string, size: number}[] = [];
        let animationFrameId: number;
        const colors = getColors();

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const createParticles = (x: number, y: number) => {
            for (let i = 0; i < 2; i++) {
                particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1.0,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 4 + 2
                });
            }
        };

        const onMove = (e: MouseEvent | TouchEvent) => {
            let x, y;
            if ('touches' in e) {
                 x = e.touches[0].clientX;
                 y = e.touches[0].clientY;
            } else {
                 x = (e as MouseEvent).clientX;
                 y = (e as MouseEvent).clientY;
            }
            createParticles(x, y);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                p.size *= 0.95;

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [wallpaper]);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-50"
        />
    );
};

interface ConfettiProps {
  theme: Theme;
}

export const Confetti: React.FC<ConfettiProps> = ({ theme }) => {
  // Simple CSS based confetti particles
  const particles = Array.from({ length: 40 });
  
  const getThemeColors = () => {
    switch (theme) {
      case 'love':
        return ['bg-rose-400', 'bg-pink-300', 'bg-red-400', 'bg-rose-200'];
      case 'nature':
        return ['bg-emerald-400', 'bg-green-300', 'bg-teal-400', 'bg-lime-200'];
      default:
        return ['bg-rose-400', 'bg-purple-400', 'bg-teal-400', 'bg-yellow-300'];
    }
  };

  const colors = getThemeColors();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex justify-center overflow-hidden">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const animDelay = Math.random() * 1;
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        const sizeClass = Math.random() > 0.5 ? 'w-3 h-3' : 'w-2 h-2';
        
        return (
            <div
                key={i}
                className={`absolute top-0 rounded-full ${sizeClass} ${colorClass} shadow-sm`}
                style={{
                    left: `${left}%`,
                    animation: `fall 3s linear forwards ${animDelay}s`
                }}
            />
        );
      })}
      <style>{`
        @keyframes fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            20% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};