import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessorResponse {
  processor_used: string;
  original_text: string;
  processed_text: string;
  request_id: string;
}

const TestBackend = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/fbb75c12-b345-46c8-a8ed-c8cab70ea408');
      
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
            <Button 
              onClick={handleTest} 
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
                  <strong>Использован процессор:</strong> {result.processor_used}
                </div>

                <div className="p-4 bg-gray-100 rounded-lg">
                  <strong className="block mb-2">Исходный текст:</strong>
                  <pre className="whitespace-pre-wrap text-sm">{result.original_text}</pre>
                </div>

                <div className="p-4 bg-green-100 rounded-lg">
                  <strong className="block mb-2">Обработанный текст:</strong>
                  <pre className="whitespace-pre-wrap text-sm">{result.processed_text}</pre>
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
