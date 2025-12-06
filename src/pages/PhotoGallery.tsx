import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const PHOTO_API = 'https://functions.poehali.dev/2c130d56-19b9-42d8-a731-3ae0e2c8c4b3';

interface Photo {
  id: number;
  filename: string;
  content_type: string;
  uploaded_at: string;
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadPhotos = async () => {
    const response = await fetch(PHOTO_API);
    const data = await response.json();
    setPhotos(data.photos || []);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Можно загружать только изображения',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];

      const response = await fetch(PHOTO_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
          data: base64,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Готово!',
          description: 'Фото загружено',
        });
        loadPhotos();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить фото',
          variant: 'destructive',
        });
      }

      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const deletePhoto = async (id: number) => {
    const response = await fetch(`${PHOTO_API}?id=${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      toast({
        title: 'Удалено',
        description: 'Фото удалено из галереи',
      });
      loadPhotos();
    } else {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить фото',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Моя галерея
          </h1>
          <p className="text-gray-600">
            Загружай фотографии и создавай свою коллекцию
          </p>
        </div>

        <Card className="p-6 mb-8 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button disabled={uploading} size="lg" className="gap-2">
                <Icon name="Upload" size={20} />
                {uploading ? 'Загрузка...' : 'Загрузить фото'}
              </Button>
            </label>
          </div>
        </Card>

        {photos.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur">
            <Icon name="ImageOff" size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">
              Пока нет фотографий. Загрузи первую!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className="overflow-hidden hover:shadow-xl transition-shadow bg-white"
              >
                <div className="aspect-square relative">
                  <img
                    src={`${PHOTO_API}?id=${photo.id}`}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium text-sm text-gray-800 truncate mb-2">
                    {photo.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(photo.uploaded_at).toLocaleDateString('ru-RU')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePhoto(photo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
