import { useState, useEffect } from 'react';
import { ShaderAnimation } from '@/components/ui/shader-animation';

const prizes = [
  { place: 1, energy: 10000, medal: '🥇' },
  { place: 2, energy: 3000, medal: '🥈' },
  { place: 3, energy: 2000, medal: '🥉' },
];

export default function Mini() {
  const [hideShader, setHideShader] = useState(false);
  const [gradientOpacity, setGradientOpacity] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date('2025-10-14T23:59:59');
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('Конкурс завершён');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}д ${hours}ч ${minutes}м ${seconds}с`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHideShader(true);
      setTimeout(() => {
        setGradientOpacity(1);
      }, 100);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div 
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{
          opacity: gradientOpacity * 0.9,
          background: `
            radial-gradient(circle at 20% 30%, rgba(251, 0, 0, 0.18) 0%, transparent 30%),
            radial-gradient(circle at 80% 20%, rgba(255, 193, 7, 0.16) 0%, transparent 30%),
            radial-gradient(circle at 40% 80%, rgba(76, 175, 80, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 90% 70%, rgba(0, 35, 218, 0.14) 0%, transparent 25%),
            radial-gradient(circle at 10% 50%, rgba(255, 196, 0, 0.13) 0%, transparent 20%),
            radial-gradient(circle at 70% 90%, rgba(255, 235, 59, 0.15) 0%, transparent 28%),
            radial-gradient(circle at 60% 10%, rgba(233, 30, 99, 0.12) 0%, transparent 22%)
          `,
          backgroundSize: '200% 200%'
        }}
      />
      
      {!hideShader && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <ShaderAnimation />
        </div>
      )}

      <div className="relative z-40 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-semibold text-white/95 leading-tight">
              Разыгрываем <span className="text-white font-bold">15 000</span> энергии
            </h1>
            <p className="text-base text-white/60">
              В честь 1000 вайбкодеров
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {prizes.map((prize) => (
              <div
                key={prize.place}
                className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 aspect-square flex flex-col items-center justify-center"
              >
                <div className="text-3xl mb-2">{prize.medal}</div>
                <div className="text-base font-medium text-white/70">{prize.energy.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 px-6 py-5 text-center space-y-2">
            <p className="text-base text-white/60">
              <a 
                href="http://poehali.dev/?show=free" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                style={{ color: '#fbb040' }}
              >
                Приглашай друзей
              </a>
              {' '}и выигрывай энергию
            </p>
            <p className="text-sm text-white/50">
              Итоги через <span className="font-medium">{timeLeft}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
