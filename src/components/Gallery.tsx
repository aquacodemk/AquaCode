
import React, { useState } from 'react';
import { Camera, Trash2, Upload, ImageIcon, Loader } from 'lucide-react';
import { GalleryImage } from '../types';

interface GalleryProps {
  images: GalleryImage[];
  addImage: (base64: string, name: string) => void;
  removeImage: (id: number) => void;
}

const Gallery: React.FC<GalleryProps> = ({ images, addImage, removeImage }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Функција за намалување (компресија) на сликата
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Максимална димензија 800px (доволно за телефон, штеди меморија)
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Компресирај во JPEG со 70% квалитет
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressedBase64 = await compressImage(file);
        
        // Проверка дали има место во меморијата
        try {
            addImage(compressedBase64, `Слика ${new Date().toLocaleDateString()}`);
        } catch (storageError) {
            alert("Меморијата е полна! Избришете стари слики за да додадете нови.");
        }
      } catch (error) {
        console.error("Error processing image", error);
        alert("Грешка при обработка на сликата.");
      } finally {
        setIsProcessing(false);
        // Ресетирај го input-от за да може истата слика пак да се одбере ако треба
        e.target.value = '';
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Галерија на Тренинзи</h2>
          <p className="text-gray-500 dark:text-gray-400">Следете го вашиот физички напредок</p>
        </div>
        
        <div className="flex gap-3">
          <label className={`cursor-pointer flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md transition-all active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isProcessing ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
            <span>{isProcessing ? 'Се обработува...' : 'Прикачи'}</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isProcessing} />
          </label>
          <label className={`cursor-pointer flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Camera size={20} />
            <span>Камера</span>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} disabled={isProcessing} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon size={64} className="mb-4 opacity-20" />
            <p>Галеријата е празна</p>
          </div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm hover:shadow-lg transition-all">
              <img 
                src={img.data} 
                alt={img.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex justify-between items-center text-white">
                  <span className="text-xs font-medium truncate pr-2">{new Date(img.timestamp).toLocaleDateString()}</span>
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
