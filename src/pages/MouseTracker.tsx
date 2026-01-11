import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

interface Coordinate {
  id: number;
  x: number;
  y: number;
  timestamp: string;
}

interface Stats {
  totalPoints: number;
  firstPoint: string | null;
  lastPoint: string | null;
  recentCoordinates: Array<{ x: number; y: number; timestamp: string }>;
}

export default function MouseTracker() {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const containerRef = useRef<HTMLDivElement>(null);

  const API_URL = 'https://functions.poehali.dev/dafcdddd-0f6f-4ce4-8646-4465da3c52f6';

  const sendCoordinates = async (x: number, y: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'track',
          x,
          y,
          sessionId,
        }),
      });

      const data = await response.json();
      if (data.coordinates) {
        setCoordinates(data.coordinates);
      }
    } catch (error) {
      console.error('Failed to send coordinates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStats',
          sessionId,
        }),
      });

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    if (!isTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        sendCoordinates(x, y);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isTracking, sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🖱️ Mouse Tracker WebSocket
          </h1>
          <p className="text-gray-300">
            Отслеживание координат мыши в реальном времени с сохранением в БД
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Зона отслеживания</h2>
                <button
                  onClick={() => setIsTracking(!isTracking)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isTracking
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isTracking ? 'Остановить' : 'Начать отслеживание'}
                </button>
              </div>

              <div
                ref={containerRef}
                className={`relative h-96 rounded-xl border-2 ${
                  isTracking
                    ? 'border-green-400 bg-gradient-to-br from-green-900/20 to-blue-900/20'
                    : 'border-gray-600 bg-gray-800/50'
                } transition-all cursor-crosshair overflow-hidden`}
              >
                {isTracking && (
                  <div className="absolute top-2 left-2 text-sm text-white/80 font-mono bg-black/40 px-3 py-1 rounded">
                    Двигайте мышью здесь
                  </div>
                )}
                
                {coordinates.slice(0, 20).map((coord, idx) => (
                  <div
                    key={coord.id}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
                    style={{
                      left: `${coord.x}px`,
                      top: `${coord.y}px`,
                      opacity: 1 - idx * 0.05,
                      animationDuration: `${1 + idx * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-300">
                <p>Session ID: <span className="font-mono text-blue-400">{sessionId}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Последние координаты
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {coordinates.length === 0 ? (
                  <p className="text-gray-400 text-sm">Нет данных</p>
                ) : (
                  coordinates.map((coord) => (
                    <div
                      key={coord.id}
                      className="bg-white/5 rounded-lg p-3 text-sm font-mono"
                    >
                      <div className="text-white">
                        X: {coord.x}, Y: {coord.y}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(coord.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Статистика</h3>
                <button
                  onClick={loadStats}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Icon name="RefreshCw" size={20} className="text-white" />
                </button>
              </div>

              {stats ? (
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Всего точек</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.totalPoints}
                    </div>
                  </div>
                  {stats.firstPoint && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-400 text-sm">Первая точка</div>
                      <div className="text-xs text-white font-mono">
                        {new Date(stats.firstPoint).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {stats.lastPoint && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-400 text-sm">Последняя точка</div>
                      <div className="text-xs text-white font-mono">
                        {new Date(stats.lastPoint).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Нажмите кнопку обновления для загрузки статистики
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
