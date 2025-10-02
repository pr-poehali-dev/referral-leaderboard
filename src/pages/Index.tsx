import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
  { place: 1, energy: 5000, medal: '🥇', gradient: 'from-yellow-400 via-yellow-500 to-yellow-600' },
  { place: 2, energy: 3000, medal: '🥈', gradient: 'from-gray-300 via-gray-400 to-gray-500' },
  { place: 3, energy: 1000, medal: '🥉', gradient: 'from-orange-400 via-orange-500 to-orange-600' },
];

export default function Index() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://devapi.arnld.ai/api/minigames/referral-contest');
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

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ShaderAnimation />
        </div>
        <div className="relative z-10">
          <div className="animate-spin">
            <Icon name="Loader2" size={64} className="text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <ShaderAnimation />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-16 animate-fade-in">
            <div className="mb-6">
              <div className="inline-block p-3 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20 mb-6">
                <Icon name="Trophy" size={48} className="text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent">
                Реферальный
              </span>
              <br />
              <span className="text-white">Конкурс</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
              Приглашайте друзей и получайте награды в энергии
            </p>
          </div>

          <div className="backdrop-blur-xl bg-card/40 rounded-3xl border border-white/10 p-8 md:p-12 mb-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                  <Icon name="Clock" size={28} className="text-primary" />
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Осталось времени</span>
                </div>
                <p className="text-2xl font-semibold text-white">14 октября 2025</p>
              </div>
              
              <div className="flex gap-3">
                {[
                  { label: 'Дней', value: timeLeft.days },
                  { label: 'Часов', value: timeLeft.hours },
                  { label: 'Минут', value: timeLeft.minutes },
                  { label: 'Секунд', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="backdrop-blur-sm bg-black/40 rounded-2xl px-5 py-4 min-w-[80px] border border-white/5">
                    <div className="text-4xl font-bold text-primary mb-1 tabular-nums">{item.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {prizes.map((prize, idx) => (
              <div
                key={prize.place}
                className={`backdrop-blur-xl bg-gradient-to-br ${
                  idx === 0 ? 'from-yellow-500/20 to-yellow-700/20 border-yellow-500/30' :
                  idx === 1 ? 'from-gray-400/20 to-gray-600/20 border-gray-400/30' :
                  'from-orange-500/20 to-orange-700/20 border-orange-500/30'
                } rounded-3xl border p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-500 shadow-2xl`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${prize.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                    {prize.medal}
                  </div>
                  <div className="text-5xl font-bold mb-4 text-white">{prize.place}</div>
                  <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Приз</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                    {prize.energy.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">энергии</div>
                </div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-primary/5 rounded-2xl border border-primary/20 p-6 mb-12">
            <div className="flex items-center gap-3">
              <Icon name="Gift" size={24} className="text-primary" />
              <p className="text-gray-300">
                <span className="font-semibold text-white">Места 4-9:</span> по 1 000 энергии
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-8 text-white flex items-center gap-3">
              <Icon name="Users" size={36} className="text-primary" />
              Лидеры
            </h2>
          </div>

          {participants.length === 0 ? (
            <div className="backdrop-blur-xl bg-card/40 rounded-3xl border border-white/10 p-16 text-center">
              <Icon name="Users" size={64} className="mx-auto mb-6 text-gray-600" />
              <p className="text-xl text-gray-400">Таблица лидеров появится совсем скоро</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant, index) => {
                const isTop3 = index < 3;
                const prize = prizes[index];
                const hasPrize = index < 9;
                
                return (
                  <div
                    key={participant.profile_id}
                    className={`backdrop-blur-xl rounded-2xl border p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      isTop3
                        ? index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-700/10 border-yellow-500/30'
                          : index === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-600/10 border-gray-400/30'
                          : 'bg-gradient-to-r from-orange-500/10 to-orange-700/10 border-orange-500/30'
                        : 'bg-card/30 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold ${
                        isTop3 ? 'bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50' : 'bg-black/40 border border-white/10'
                      }`}>
                        {prize ? prize.medal : `#${index + 1}`}
                      </div>

                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-xl md:text-2xl text-white truncate mb-1">
                          {participant.full_name}
                        </h3>
                        <p className="text-gray-400">@{participant.username}</p>
                      </div>

                      <div className="flex items-center gap-6 md:gap-10">
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <Icon name="CheckCircle2" size={20} className="text-green-400" />
                            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent tabular-nums">
                              {participant.claimed_referrals}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Активных</p>
                        </div>

                        {hasPrize && (
                          <div className="hidden md:block text-right backdrop-blur-sm bg-primary/10 rounded-xl px-5 py-3 border border-primary/30">
                            <div className="text-2xl font-bold text-primary tabular-nums">
                              {index < 3 ? prizes[index].energy.toLocaleString() : '1,000'}
                            </div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Энергии</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-16 backdrop-blur-xl bg-card/30 rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <Icon name="Sparkles" size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-white">Как участвовать</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span>Поделитесь реферальной ссылкой с друзьями</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span>Получайте баллы за каждого активированного пользователя</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span>Поднимайтесь в рейтинге и выигрывайте призы</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span>Победители получат энергию после 14 октября</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
