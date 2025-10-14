import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import animationData from '@/contest-ended-animation.json';

const ContestEnded = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="w-64 h-64 mx-auto">
          <Lottie animationData={animationData} loop={true} />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Конкурс завершён! 🎉
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-200">
            Мы подводим итоги конкурса
          </p>

          <p className="text-lg text-purple-300">
            Результаты будут доступны уже сегодня
          </p>
        </div>

        <div className="pt-4">
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg"
            onClick={() => window.open('https://t.me/+QgiLIa1gFRY4Y2Iy', '_blank')}
          >
            Подписаться на Телеграм
          </Button>
          <p className="text-sm text-purple-400 mt-3">
            Чтобы не пропустить результаты
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContestEnded;