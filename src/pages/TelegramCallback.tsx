import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function TelegramCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Авторизация...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Отсутствует токен авторизации');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    const authenticate = async () => {
      try {
        const response = await fetch(
          'https://functions.poehali.dev/82a78d21-25cc-42d4-b9ff-05b1e9b4990f?action=callback',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (response.ok && data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));

          setStatus('success');
          setMessage('Успешная авторизация!');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Ошибка авторизации');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setStatus('error');
        setMessage('Ошибка подключения к серверу');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    authenticate();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <Icon name="Loader2" size={64} className="mx-auto text-blue-400 animate-spin" />
          )}
          {status === 'success' && (
            <Icon name="CheckCircle" size={64} className="mx-auto text-green-400" />
          )}
          {status === 'error' && (
            <Icon name="XCircle" size={64} className="mx-auto text-red-400" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
        {status === 'success' && (
          <p className="text-white/60">Перенаправление на главную...</p>
        )}
        {status === 'error' && (
          <p className="text-white/60">Возврат на главную...</p>
        )}
      </div>
    </div>
  );
}
