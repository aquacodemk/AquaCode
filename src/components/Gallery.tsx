import React from 'react';
import { Camera, Trash2, Upload, ImageIcon } from 'lucide-react';
import { GalleryImage } from '../types';

interface GalleryProps {
  images: GalleryImage[];
  addImage: (base64: string, name: string) => void;
  removeImage: (id: number) => void;
}

const Gallery: React.FC<GalleryProps> = ({ images, addImage, removeImage }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large (Max 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        addImage(base64, `Слика ${new Date().toLocaleDateString()}`);
      };
      reader.readAsDataURL(file);
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
          <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md transition-all active:scale-95">
            <Upload size={20} />
            <span>Прикачи</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all active:scale-95">
            <Camera size={20} />
            <span>Камера</span>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
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