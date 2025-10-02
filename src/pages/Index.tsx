import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Participant {
  profile_id: string;
  full_name: string;
  username: string;
  total_referrals: number;
  claimed_referrals: number;
}

const prizes = [
  { place: 1, energy: 5000, icon: '🥇' },
  { place: 2, energy: 3000, icon: '🥈' },
  { place: 3, energy: 1000, icon: '🥉' },
  { place: 4, energy: 1000, icon: '🏆' },
  { place: 5, energy: 1000, icon: '🏆' },
  { place: 6, energy: 1000, icon: '🏆' },
  { place: 7, energy: 1000, icon: '🏆' },
  { place: 8, energy: 1000, icon: '🏆' },
  { place: 9, energy: 1000, icon: '🏆' },
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

  const getPlaceStyle = (index: number) => {
    if (index === 0) return 'from-yellow-600/20 to-yellow-800/20 border-yellow-600/50';
    if (index === 1) return 'from-gray-400/20 to-gray-600/20 border-gray-400/50';
    if (index === 2) return 'from-orange-600/20 to-orange-800/20 border-orange-600/50';
    return 'from-card/50 to-card border-border';
  };

  const getPrize = (index: number) => {
    return prizes.find(p => p.place === index + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin">
          <Icon name="Loader2" size={48} className="text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent">
            Реферальный Конкурс
          </h1>
          <p className="text-muted-foreground text-lg">
            Пригласи друзей и выиграй энергию!
          </p>
        </div>

        <Card className="p-6 md:p-8 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Icon name="Timer" size={32} className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">До окончания конкурса</p>
                <p className="text-2xl font-bold text-primary">14 октября 2025</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-center bg-card/50 rounded-lg px-4 py-2">
                <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground">дней</div>
              </div>
              <div className="text-center bg-card/50 rounded-lg px-4 py-2">
                <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground">часов</div>
              </div>
              <div className="text-center bg-card/50 rounded-lg px-4 py-2">
                <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground">минут</div>
              </div>
              <div className="text-center bg-card/50 rounded-lg px-4 py-2">
                <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-xs text-muted-foreground">сек</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {prizes.slice(0, 3).map((prize, idx) => (
            <Card
              key={prize.place}
              className={`p-6 text-center bg-gradient-to-br ${
                idx === 0
                  ? 'from-yellow-600/20 to-yellow-800/20 border-yellow-600/50'
                  : idx === 1
                  ? 'from-gray-400/20 to-gray-600/20 border-gray-400/50'
                  : 'from-orange-600/20 to-orange-800/20 border-orange-600/50'
              }`}
            >
              <div className="text-5xl mb-2">{prize.icon}</div>
              <div className="text-3xl font-bold mb-1">{prize.place} место</div>
              <div className="text-2xl font-bold text-primary">{prize.energy.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">энергии</div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3">
            <Icon name="Gift" size={24} className="text-primary" />
            <p className="text-sm">
              <span className="font-semibold">Места 3-9:</span> по 1000 энергии каждому победителю
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Trophy" size={28} className="text-primary" />
            Лидерборд
          </h2>

          {participants.length === 0 ? (
            <Card className="p-8 text-center">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Пока нет участников</p>
            </Card>
          ) : (
            participants.map((participant, index) => {
              const prize = getPrize(index);
              return (
                <Card
                  key={participant.profile_id}
                  className={`p-4 md:p-6 bg-gradient-to-br ${getPlaceStyle(index)} transition-all hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-xl md:text-2xl font-bold">
                        {prize ? prize.icon : `#${index + 1}`}
                      </span>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-lg truncate">{participant.full_name}</h3>
                      <p className="text-sm text-muted-foreground">@{participant.username}</p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Icon name="CheckCircle2" size={20} className="text-green-500" />
                          <span className="text-2xl font-bold text-primary">
                            {participant.claimed_referrals}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">активных</p>
                      </div>

                      {participant.total_referrals > participant.claimed_referrals && (
                        <div className="text-right hidden md:block">
                          <div className="flex items-center gap-2">
                            <Icon name="UserPlus" size={20} className="text-muted-foreground" />
                            <span className="text-xl font-semibold text-muted-foreground">
                              {participant.total_referrals}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">всего</p>
                        </div>
                      )}

                      {prize && (
                        <div className="text-right bg-primary/10 rounded-lg px-3 py-2">
                          <div className="text-xl font-bold text-primary">
                            {prize.energy.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">энергии</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Icon name="Info" size={24} className="text-primary flex-shrink-0 mt-1" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Как участвовать:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Поделитесь своей реферальной ссылкой с друзьями</li>
                <li>За каждого активированного пользователя вы получаете балл</li>
                <li>Чем больше активных рефералов, тем выше ваше место в таблице</li>
                <li>Победители получат призы в энергии после окончания конкурса</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
