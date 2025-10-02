import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/icon';
import { ShaderAnimation } from '@/components/ui/shader-animation';

interface Participant {
  profile_id: string;
  full_name: string;
  username: string;
  total_referrals: number;
  claimed_referrals: number;
}

const prizes = [
  { place: 1, energy: 10000, medal: '🥇' },
  { place: 2, energy: 3000, medal: '🥈' },
  { place: 3, energy: 2000, medal: '🥉' },
];

export default function Index() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideShader, setHideShader] = useState(false);
  const [gradientOpacity, setGradientOpacity] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [hoveredPending, setHoveredPending] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.poehali.dev/api/minigames/referral-contest');
        const data = await response.json();
        const sorted = data.sort((a: Participant, b: Participant) => b.claimed_referrals - a.claimed_referrals);
        
        setParticipants(sorted);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
    const shaderTimer = setTimeout(() => {
      setHideShader(true);
      
      let opacity = 0;
      const duration = 8000;
      const interval = 50;
      const step = interval / duration;
      
      const gradientInterval = setInterval(() => {
        opacity += step;
        if (opacity >= 1) {
          opacity = 1;
          clearInterval(gradientInterval);
        }
        setGradientOpacity(opacity);
      }, interval);
      
      return () => clearInterval(gradientInterval);
    }, 3000);

    return () => clearTimeout(shaderTimer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <ShaderAnimation />
        </div>
        <div className="relative z-10 animate-spin">
          <Icon name="Loader2" size={64} className="text-white/50" />
        </div>
      </div>
    );
  }

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

      <div className="relative z-40 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-adaptive-hero font-semibold text-white/90 mb-2 leading-tight md:mt-12">
              Разыгрываем <span className="text-white font-bold">15 000</span> энергии
            </h1>
            <p className="text-xs md:text-lg text-white/50">
              В честь 1000 вайбкодеров в{' '}
              <a 
                href="https://t.me/+-Lwo9EkIwNc4YjIy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white/80 underline decoration-white/30 hover:decoration-white/50 transition-colors"
              >
                нашем сообществе<span className="hidden md:inline"> в Телеграм</span>
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mb-6">
            <div className="grid grid-cols-3 sm:flex sm:justify-center gap-3 w-full sm:w-auto">
              {prizes.map((prize) => (
                <div
                  key={prize.place}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 aspect-square sm:w-24 sm:h-24 flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-1">{prize.medal}</div>
                  <div className="text-sm font-medium text-white/60">{prize.energy.toLocaleString()}</div>
                </div>
              ))}
            </div>
            
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 px-6 py-4 flex-1 sm:max-w-[380px] flex items-center justify-center">
              <p className="text-sm text-white/50 text-center">
                <a 
                  href="http://poehali.dev/?show=free" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity group relative"
                  style={{ color: '#fbb040' }}
                  title="Приглашенный должен забрать бесплатную энергию за вход"
                >
                  Приглашай друзей
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white/90 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-xl border border-white/10">
                    Приглашенный должен забрать бесплатную энергию за вход
                  </span>
                </a>
                {' '}и выигрывай энергию, итоги через <span className="inline-block min-w-[2px] font-medium">{timeLeft}</span>
              </p>
            </div>
          </div>

          {participants.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/40">Таблица лидеров скоро появится</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {participants.map((participant, index) => {
                const hasPending = participant.total_referrals > participant.claimed_referrals;
                const pendingCount = participant.total_referrals - participant.claimed_referrals;
                
                return (
                  <div
                    key={participant.profile_id}
                    className="backdrop-blur-xl bg-white/5 hover:bg-white/8 rounded-xl border border-white/10 px-4 py-3 transition-all duration-200 flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-medium text-white/60">
                      {index + 1}
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-white/90 truncate">
                        {participant.full_name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasPending && (
                        <div
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                            setHoveredPending(participant.profile_id);
                          }}
                          onMouseLeave={() => setHoveredPending(null)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 cursor-help"
                        >
                          <Icon name="Clock" size={14} className="text-yellow-400/70" />
                          <span className="text-xs font-medium text-yellow-400/70 tabular-nums">
                            +{pendingCount}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Icon name="UsersRound" size={16} className="text-white/60" />
                        <span className="text-lg font-semibold text-white/90 tabular-nums">
                          {participant.claimed_referrals}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="relative z-40 mt-12 pb-8">
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <Icon name="Box" size={18} className="text-white/40" />
            <p>
              Сайт собран за 15 минут на{' '}
              <a 
                href="https://poehali.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white/70 transition-colors underline decoration-white/20"
              >
                poehali.dev
              </a>
            </p>
          </div>
        </footer>
      </div>

      {hoveredPending && createPortal(
        <div
          className="fixed px-3 py-2 bg-black border border-white/20 text-white text-xs rounded-lg shadow-xl z-[9999] pointer-events-none max-w-[85vw] sm:max-w-none sm:whitespace-nowrap"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          Пользователям нужно забрать бесплатную энергию за вход, чтобы они засчитались как рефералы.
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        </div>,
        document.body
      )}
    </div>
  );
}