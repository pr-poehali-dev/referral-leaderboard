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
      <WinnerRoulette />
    </div>
  );
}