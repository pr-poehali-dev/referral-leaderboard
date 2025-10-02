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
          <Icon name="Loader2" size={64} className="text-primary" />
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

      <div className="relative z-40 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-6">
            <h1 className="font-bold tracking-tight leading-tight">
              <div className="text-6xl md:text-8xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-2">
                1000
              </div>
              <div className="text-3xl md:text-5xl text-white mb-1">
                вайбкодеров
              </div>
              <div className="text-xl md:text-3xl text-gray-400">
                в сообществе poehali.dev
              </div>
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-4">Пригласи друзей и получи энергию · До 14 октября</p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 max-w-2xl mx-auto">
            {prizes.map((prize, idx) => (
              <div
                key={prize.place}
                className={`backdrop-blur-xl bg-gradient-to-br ${
                  idx === 0 ? 'from-yellow-500/15 to-yellow-700/15 border-yellow-500/30' :
                  idx === 1 ? 'from-gray-400/15 to-gray-600/15 border-gray-400/30' :
                  'from-orange-500/15 to-orange-700/15 border-orange-500/30'
                } rounded-xl border p-3 md:p-4 text-center hover:scale-105 transition-all duration-300`}
              >
                <div className="text-3xl md:text-4xl mb-1">{prize.medal}</div>
                <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
                  {prize.energy.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">энергии</div>
              </div>
            ))}
          </div>

          {participants.length === 0 ? (
            <div className="backdrop-blur-xl bg-card/30 rounded-2xl border border-white/10 p-12 text-center">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Таблица лидеров скоро появится</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
              {participants.map((participant, index) => {
                const isTop3 = index < 3;
                const prize = prizes[index];
                
                return (
                  <div
                    key={participant.profile_id}
                    className={`backdrop-blur-xl rounded-xl border p-3 md:p-4 transition-all duration-300 hover:scale-[1.01] ${
                      isTop3
                        ? index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-700/10 border-yellow-500/40'
                          : index === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-600/10 border-gray-400/40'
                          : 'bg-gradient-to-r from-orange-500/10 to-orange-700/10 border-orange-500/40'
                        : 'bg-card/20 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold ${
                        isTop3 ? 'bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50' : 'bg-black/40 border border-white/10'
                      }`}>
                        {prize ? prize.medal : `#${index + 1}`}
                      </div>

                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-base md:text-lg text-white truncate">
                          {participant.full_name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">@{participant.username}</p>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Icon name="CheckCircle2" size={16} className="text-green-400" />
                            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent tabular-nums">
                              {participant.claimed_referrals}
                            </span>
                          </div>
                        </div>

                        <div className="text-right backdrop-blur-sm bg-primary/10 rounded-lg px-2 md:px-3 py-1 md:py-2 border border-primary/30 min-w-[60px] md:min-w-[70px]">
                          <div className="text-base md:text-lg font-bold text-primary tabular-nums">
                            {index < 3 ? prizes[index].energy.toLocaleString() : '1,000'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}