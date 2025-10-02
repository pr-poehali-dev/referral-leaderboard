import { useState, useEffect } from 'react';
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
  { place: 1, energy: 5000, medal: '🥇' },
  { place: 2, energy: 3000, medal: '🥈' },
  { place: 3, energy: 1000, medal: '🥉' },
];

export default function Index() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideShader, setHideShader] = useState(false);
  const [gradientOpacity, setGradientOpacity] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://devapi.arnld.ai/api/minigames/referral-contest');
        const data = await response.json();
        const sorted = data.sort((a: Participant, b: Participant) => b.claimed_referrals - a.claimed_referrals);
        setParticipants(sorted.slice(0, 9));
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
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-semibold text-white/90 mb-2">
              Празднуем <span className="text-white font-bold">1000</span> вайбкодеров
            </h1>
            <p className="text-sm md:text-base text-white/50">
              <a 
                href="http://poehali.dev/?show=free" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white/80 underline decoration-white/30 hover:decoration-white/50 transition-colors group relative"
                title="Приглашенный должен забрать бесплатную энергию за вход, чтобы засчитаться в конкурсе"
              >
                Пригласи друзей
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white/90 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-xl border border-white/10">
                  Приглашенный должен забрать бесплатную энергию за вход
                </span>
              </a>
              {' '}в{' '}
              <a 
                href="https://t.me/+-Lwo9EkIwNc4YjIy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white/80 underline decoration-white/30 hover:decoration-white/50 transition-colors"
              >
                сообществе
              </a>
              {' '}poehali.dev · До 14 октября
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {prizes.map((prize) => (
              <div
                key={prize.place}
                className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 px-4 py-3 text-center"
              >
                <div className="text-2xl mb-1">{prize.medal}</div>
                <div className="text-sm font-medium text-white/60">{prize.energy.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {participants.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/40">Таблица лидеров скоро появится</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {participants.map((participant, index) => (
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

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Icon name="CheckCircle2" size={14} className="text-green-400/80" />
                      <span className="text-lg font-semibold text-white/90 tabular-nums">
                        {participant.claimed_referrals}
                      </span>
                    </div>

                    <div className="text-right bg-white/10 rounded-lg px-3 py-1.5 min-w-[70px]">
                      <div className="text-sm font-medium text-white/80 tabular-nums">
                        {index < 3 ? prizes[index].energy.toLocaleString() : '1,000'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}