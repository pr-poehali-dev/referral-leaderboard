import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessorResponse {
  processor_used: string;
  original_text: string;
  processed_text: string;
  available_processors: string[];
  version: string;
  request_id: string;
}

const TestBackend = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<string>('random');

  const handleTest = async (processorType?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = processorType && processorType !== 'random'
        ? `https://functions.poehali.dev/fbb75c12-b345-46c8-a8ed-c8cab70ea408?processor=${processorType}`
        : 'https://functions.poehali.dev/fbb75c12-b345-46c8-a8ed-c8cab70ea408';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Тест бекенд структуры</CardTitle>
            <CardDescription>
              Проверка работы функции со сложной файловой структурой
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Выберите процессор:</label>
              <select 
                value={selectedProcessor}
                onChange={(e) => setSelectedProcessor(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="random">Случайный</option>
                <option value="markdown">Markdown</option>
                <option value="text">Text (Uppercase)</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <Button 
              onClick={() => handleTest(selectedProcessor)} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Обработка...' : 'Тестировать обработку текста'}
            </Button>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <strong>Ошибка:</strong> {error}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-100 text-blue-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>Использован процессор:</strong> {result.processor_used}
                    </div>
                    <div className="text-xs">
                      v{result.version}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>Доступно процессоров:</strong> {result.available_processors.join(', ')}
                  </div>
                </div>

                <div className="p-4 bg-gray-100 rounded-lg">
                  <strong className="block mb-2 text-gray-700">Исходный текст:</strong>
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">{result.original_text}</pre>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <strong className="block mb-2 text-green-900">Обработанный текст:</strong>
                  <pre className="whitespace-pre-wrap text-sm text-green-900">{result.processed_text}</pre>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
                  <strong>Request ID:</strong> {result.request_id}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestBackend;