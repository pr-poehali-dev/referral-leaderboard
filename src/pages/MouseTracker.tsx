import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const WS_URL = 'wss://functions.poehali.dev/8a5b608e-a729-4986-940a-705c7fededf8';

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        if (data.action === 'tracked' && data.coordinates) {
          setCoordinates(data.coordinates);
        } else if (data.action === 'stats') {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }, 3000);
    };

    wsRef.current = ws;
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendCoordinates = useCallback((x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        action: 'track',
        x,
        y,
        sessionId,
      });
      wsRef.current.send(message);
    }
  }, [sessionId]);

  const loadStats = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        action: 'getStats',
        sessionId,
      });
      wsRef.current.send(message);
    }
  }, [sessionId]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  useEffect(() => {
    if (!isTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && isConnected) {
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
  }, [isTracking, isConnected, sendCoordinates]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🖱️ Mouse Tracker WebSocket
          </h1>
          <p className="text-gray-300">
            Отслеживание координат мыши через WebSocket в реальном времени
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-white text-sm">
              {isConnected ? 'WebSocket подключен' : 'Подключение...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Зона отслеживания</h2>
                <button
                  onClick={() => setIsTracking(!isTracking)}
                  disabled={!isConnected}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isTracking
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed'
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
                    Двигайте мышью здесь (WebSocket)
                  </div>
                )}
                
                {coordinates.slice(0, 30).map((coord, idx) => (
                  <div
                    key={coord.id}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
                    style={{
                      left: `${coord.x}px`,
                      top: `${coord.y}px`,
                      opacity: 1 - idx * 0.03,
                      animationDuration: `${1 + idx * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-300 space-y-1">
                <p>Session ID: <span className="font-mono text-blue-400">{sessionId}</span></p>
                <p>Protocol: <span className="font-mono text-green-400">WebSocket (wss://)</span></p>
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
                  disabled={!isConnected}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
