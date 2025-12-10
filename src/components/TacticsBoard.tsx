
import React, { useRef, useState, useEffect } from 'react';
import { Save, RefreshCw, PenTool, Share2 } from 'lucide-react';

interface TacticsBoardProps {
  onSaveToGallery: (base64: string, name: string) => void;
}

type Tool = 'pen' | 'blue-cap' | 'white-cap' | 'red-cap' | 'ball' | 'eraser';

const TacticsBoard: React.FC<TacticsBoardProps> = ({ onSaveToGallery }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);

  // Helper to get context safely
  const getContext = () => canvasRef.current?.getContext('2d');

  const drawPoolBackground = (context: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear
    context.clearRect(0, 0, width, height);
    
    // Water
    context.fillStyle = '#0891b2'; // Cyan-600
    context.fillRect(0, 0, width, height);

    // Lane Lines / Markings
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 2;

    // Center Line
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();

    // 2m Lines (Red)
    context.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Red-500
    const twoMeter = height * 0.12; 
    
    // Top Goal 2m
    context.beginPath();
    context.moveTo(0, twoMeter);
    context.lineTo(width, twoMeter);
    context.stroke();
    
    // Bottom Goal 2m
    context.beginPath();
    context.moveTo(0, height - twoMeter);
    context.lineTo(width, height - twoMeter);
    context.stroke();

    // 5m Lines (Yellow)
    context.strokeStyle = 'rgba(234, 179, 8, 0.6)'; // Yellow-500
    const fiveMeter = height * 0.25; 

    // Top Goal 5m
    context.beginPath();
    context.moveTo(0, fiveMeter);
    context.lineTo(width, fiveMeter);
    context.stroke();

    // Bottom Goal 5m
    context.beginPath();
    context.moveTo(0, height - fiveMeter);
    context.lineTo(width, height - fiveMeter);
    context.stroke();

    // Goals
    context.fillStyle = 'white';
    const goalWidth = width * 0.4;
    const goalX = (width - goalWidth) / 2;
    // Top Goal
    context.fillRect(goalX, 0, goalWidth, 8);
    // Bottom Goal
    context.fillRect(goalX, height - 8, goalWidth, 8);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const isMobile = window.innerWidth < 768;
    // Maintain the requested large size (Mobile: very tall, Desktop: fit screen)
    const height = isMobile 
      ? width * 1.75  
      : Math.min(width * 1.5, window.innerHeight * 0.85);

    // Check if dimensions changed to avoid unnecessary redraws, 
    // but ensures background is drawn correctly on load
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        drawPoolBackground(ctx, width, height);
    }
  };

  // Setup Resize Listener
  useEffect(() => {
    resizeCanvas();
    const timer = setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        clearTimeout(timer);
    };
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX = 0, clientY = 0;
    
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const ctx = getContext();
    if (!ctx) return;

    const { x, y } = getCoordinates(event);
    
    if (activeTool === 'pen') {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      placeIcon(ctx, x, y);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTool !== 'pen') return;
    
    const ctx = getContext();
    if (!ctx) return;
    
    const { x, y } = getCoordinates(event);
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        const ctx = getContext();
        ctx?.closePath();
    }
  };

  const placeIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = 12;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (activeTool === 'blue-cap') {
      ctx.fillStyle = '#1d4ed8'; // Blue-700
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (activeTool === 'white-cap') {
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (activeTool === 'red-cap') {
      ctx.fillStyle = '#ef4444'; // Red-500
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (activeTool === 'ball') {
      ctx.fillStyle = '#facc15'; // Yellow-400
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const clearBoard = () => {
    const ctx = getContext();
    if (canvasRef.current && ctx) {
      if (window.confirm('Дали сигурно сакате да ја избришете таблата?')) {
        drawPoolBackground(ctx, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const saveBoard = () => {
    if (canvasRef.current) {
      try {
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
        const name = `Тактика ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        onSaveToGallery(base64, name);
        alert('Тактиката е зачувана во Галерија! 📸');
      } catch (e) {
        alert('Грешка при зачувување. Меморијата можеби е полна.');
      }
    }
  };

  // --- LOGIC FOR SHARING ---
  const shareBoard = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
            alert('Грешка при креирање на слика.');
            return;
        }
        
        const file = new File([blob], "taktika.png", { type: "image/png" });

        // Проверка: Дали сме на МОБИЛЕН уред?
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // 1. АКО Е МОБИЛЕН: Користи го вграденото мени (Share Sheet)
        if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'AQUA CODE',
                    text: 'Тактика',
                    files: [file]
                });
                return;
            } catch (err) {
                // Ако корисникот откаже, не прави ништо
            }
        } 
        
        // 2. АКО Е КОМПЈУТЕР: Веднаш копирај во Clipboard (не отворај мени)
        try {
            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                alert('✅ Сликата е КОПИРАНА во меморија!\n\nСега отворете Viber на компјутерот и притиснете PASTE (Ctrl+V).');
                return;
            } else {
                throw new Error("Clipboard unavailable");
            }
        } catch (err) {
            console.warn("Clipboard failed:", err);
            
            // 3. FALLBACK: Ако не може да копира (пр. стар прелистувач или HTTP), симни ја
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `taktika-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('⚠️ Сликата е симната (Download).\nПовлечете ја фајлот во Viber.');
        }

    }, 'image/png'); 
  };

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-6 space-y-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <PenTool className="text-orange-500" />
            Тактичка Табла
          </h2>
          <div className="flex gap-2">
             <button 
                onClick={shareBoard}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all active:scale-95 shadow-md text-sm md:text-base"
                title="Сподели (На PC прави Copy/Paste)"
            >
                <Share2 size={18} />
                <span className="hidden md:inline">Сподели</span>
            </button>
            <button 
                onClick={saveBoard}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all active:scale-95 shadow-md text-sm md:text-base"
            >
                <Save size={18} />
                <span className="hidden md:inline">Зачувај</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-4 justify-center md:justify-start">
          <button
            onClick={() => setActiveTool('pen')}
            className={`p-2 md:p-3 rounded-xl border-2 transition-all ${activeTool === 'pen' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-600'}`}
            title="Маркер"
          >
            <PenTool size={20} className="text-gray-800 dark:text-white" />
          </button>

          <button
            onClick={() => setActiveTool('blue-cap')}
            className={`p-2 md:p-3 rounded-xl border-2 transition-all ${activeTool === 'blue-cap' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 dark:border-gray-600'}`}
            title="Син Играч"
          >
            <div className="w-5 h-5 rounded-full bg-blue-700 border-2 border-white shadow-sm"></div>
          </button>

          <button
            onClick={() => setActiveTool('white-cap')}
            className={`p-2 md:p-3 rounded-xl border-2 transition-all ${activeTool === 'white-cap' ? 'border-blue-400 bg-gray-50' : 'border-gray-200 dark:border-gray-600'}`}
            title="Бел Играч"
          >
            <div className="w-5 h-5 rounded-full bg-white border-2 border-blue-700 shadow-sm"></div>
          </button>

          <button
            onClick={() => setActiveTool('red-cap')}
            className={`p-2 md:p-3 rounded-xl border-2 transition-all ${activeTool === 'red-cap' ? 'border-red-500 bg-red-50' : 'border-gray-200 dark:border-gray-600'}`}
            title="Голман"
          >
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
          </button>

          <button
            onClick={() => setActiveTool('ball')}
            className={`p-2 md:p-3 rounded-xl border-2 transition-all ${activeTool === 'ball' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 dark:border-gray-600'}`}
            title="Топка"
          >
            <div className="w-5 h-5 rounded-full bg-yellow-400 border border-black shadow-sm"></div>
          </button>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

          <button
            onClick={clearBoard}
            className="p-2 md:p-3 rounded-xl border-2 border-red-200 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all"
            title="Избриши Сè"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Board Area */}
        <div 
          ref={containerRef} 
          className="w-full relative rounded-xl overflow-hidden shadow-inner border-4 border-cyan-800 bg-cyan-900 touch-none cursor-crosshair"
          style={{ touchAction: 'none' }} 
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block w-full"
          />
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-2">
           Нацртајте акција со прст или глувче. Допрете за да поставите играч.
        </p>
      </div>
    </div>
  );
};

export default TacticsBoard;
