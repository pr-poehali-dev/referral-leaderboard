import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Participant {
  profile_id: string;
  full_name: string;
  username: string;
  total_referrals: number;
  claimed_referrals: number;
}

interface Winner {
  participant: Participant;
  place: number;
  prize: number;
}

export default function WinnerRoulette() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<Participant | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);

  const prizes = [
    { place: 1, energy: 10000, medal: '🥇', label: '1-е место' },
    { place: 2, energy: 3000, medal: '🥈', label: '2-е место' },
    { place: 3, energy: 2000, medal: '🥉', label: '3-е место' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.poehali.dev/api/minigames/referral-contest');
        const data = await response.json();
        setParticipants(data);
        setAvailableParticipants(data);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const weightedRandomSelection = (participants: Participant[]): Participant => {
    const totalWeight = participants.reduce((sum, p) => sum + Math.max(p.claimed_referrals, 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const participant of participants) {
      const weight = Math.max(participant.claimed_referrals, 1);
      random -= weight;
      if (random <= 0) {
        return participant;
      }
    }
    
    return participants[participants.length - 1];
  };

  const spinRoulette = () => {
    if (spinning || availableParticipants.length === 0 || winners.length >= 3) return;

    setSpinning(true);
    
    let spinCount = 0;
    const totalSpins = 30 + Math.floor(Math.random() * 20);
    
    const interval = setInterval(() => {
      const randomParticipant = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
      setCurrentDisplay(randomParticipant);
      spinCount++;
      
      if (spinCount >= totalSpins) {
        clearInterval(interval);
        
        setTimeout(() => {
          const winner = weightedRandomSelection(availableParticipants);
          setCurrentDisplay(winner);
          
          const currentPrize = prizes[winners.length];
          const newWinner: Winner = {
            participant: winner,
            place: currentPrize.place,
            prize: currentPrize.energy
          };
          
          setWinners(prev => [...prev, newWinner]);
          setAvailableParticipants(prev => prev.filter(p => p.profile_id !== winner.profile_id));
          setRoundNumber(prev => prev + 1);
          setSpinning(false);
        }, 500);
      }
    }, 50 + Math.floor(spinCount * 2));
  };

  const resetRoulette = () => {
    setWinners([]);
    setAvailableParticipants(participants);
    setCurrentDisplay(null);
    setRoundNumber(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin">
          <Icon name="Loader2" size={64} className="text-white/50" />
        </div>
      </div>
    );
  }

  const currentPrize = winners.length < 3 ? prizes[winners.length] : null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{
          opacity: 0.9,
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">


          {currentPrize && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 px-8 py-4">
                <span className="text-5xl">{currentPrize.medal}</span>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{currentPrize.label}</div>
                  <div className="text-lg text-white/60">{currentPrize.energy.toLocaleString()} энергии</div>
                </div>
              </div>
            </div>
          )}

          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 mb-8">
            {currentDisplay ? (
              <div className="text-center">
                <div className={`text-6xl md:text-8xl font-bold text-white mb-4 transition-all duration-100 ${spinning ? 'scale-95' : 'scale-100'}`}>
                  {currentDisplay.full_name}
                </div>
                <div className="text-xl md:text-2xl text-white/60">
                  {currentDisplay.claimed_referrals} {currentDisplay.claimed_referrals === 1 ? 'реферал' : 'рефералов'}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Sparkles" size={64} className="mx-auto mb-4 text-white/30" />
                <p className="text-2xl text-white/50">Нажмите кнопку для розыгрыша</p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={spinRoulette}
              disabled={spinning || winners.length >= 3 || availableParticipants.length === 0}
              className="backdrop-blur-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-400/30 text-white px-8 py-4 text-xl font-semibold rounded-2xl transition-all duration-200 flex items-center gap-3"
            >
              {spinning ? (
                <>
                  <Icon name="Loader2" size={24} className="animate-spin" />
                  Крутим рулетку...
                </>
              ) : winners.length >= 3 ? (
                <>
                  <Icon name="Trophy" size={24} />
                  Все победители определены!
                </>
              ) : (
                <>
                  <Icon name="Play" size={24} />
                  Крутить рулетку
                </>
              )}
            </button>

            {winners.length > 0 && (
              <button
                onClick={resetRoulette}
                className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 text-lg rounded-2xl transition-all duration-200 flex items-center gap-2"
              >
                <Icon name="RotateCcw" size={20} />
                Сбросить
              </button>
            )}
          </div>

          {winners.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white/90 mb-4 flex items-center gap-2">
                <Icon name="Trophy" size={28} className="text-yellow-400" />
                Победители
              </h2>
              <div className="space-y-3">
                {winners.map((winner, index) => {
                  const prizeInfo = prizes.find(p => p.place === winner.place);
                  return (
                    <div
                      key={winner.participant.profile_id}
                      className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 px-6 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{prizeInfo?.medal}</span>
                        <div>
                          <div className="text-xl font-semibold text-white">
                            {winner.participant.full_name}
                          </div>
                          <div className="text-sm text-white/60">
                            {winner.participant.claimed_referrals} {winner.participant.claimed_referrals === 1 ? 'реферал' : 'рефералов'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {winner.prize.toLocaleString()}
                        </div>
                        <div className="text-sm text-white/60">энергии</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm">
              Осталось участников: <span className="font-bold text-white/60">{availableParticipants.length}</span> из {participants.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}