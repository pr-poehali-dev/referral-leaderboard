import { useState } from 'react';
import WinnerRoulette from '@/components/WinnerRoulette';
import Icon from '@/components/ui/icon';
import TelegramLoginButton from '@/components/extensions/telegram-bot/TelegramLoginButton';

export default function Index() {
  const [planet, setPlanet] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchPlanet = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/102d91a6-acf4-411a-a306-6e53a7e61bcc');
      const data = await response.json();
      setPlanet(data.planet);
    } catch (error) {
      console.error('Failed to fetch planet:', error);
      setPlanet('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramLogin = () => {
    const botUsername = 'YOUR_BOT_USERNAME';
    window.open(`https://t.me/${botUsername}?start=web_auth`, '_blank');
  };

  return (
    <div>
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-4 shadow-lg">
          <div className="text-center mb-3">
            <div className="text-sm text-white/60 mb-1">Тестовая функция</div>
            {planet && (
              <div className="text-2xl font-bold text-white mb-2">
                🪐 {planet}
              </div>
            )}
            <button
              onClick={fetchPlanet}
              disabled={loading}
              className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 disabled:opacity-50 border border-purple-400/30 text-white px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Icon name="Rocket" size={16} />
                  Получить планету
                </>
              )}
            </button>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-4 shadow-lg">
          <TelegramLoginButton onClick={handleTelegramLogin} />
        </div>
      </div>
      <WinnerRoulette />
    </div>
  );
}