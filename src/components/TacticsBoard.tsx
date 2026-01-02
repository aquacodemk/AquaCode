
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, PenTool, Trash2, Info, MousePointer2, Eraser } from 'lucide-react';
import { TacticObject } from '../types';

type Point = { x: number, y: number };
type DrawingPath = { id: string; points: Point[] };
type MovePath = { from: Point; to: Point };
type Tool = 'pen' | 'eraser' | 'blue-cap' | 'white-cap' | 'red-cap' | 'ball' | 'move';

const TacticsBoard: React.FC<{ onSaveToGallery: (base64: string, name: string) => void }> = ({ onSaveToGallery }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [objects, setObjects] = useState<TacticObject[]>([]);
  const [pencilPaths, setPencilPaths] = useState<DrawingPath[]>([]);
  const [movePaths, setMovePaths] = useState<Record<string, MovePath>>({}); // One path per player ID
  const [activeTool, setActiveTool] = useState<Tool>('blue-cap');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[] | null>(null);
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null);
  
  const longPressTimer = useRef<number | null>(null);

  const drawPoolBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0891b2'; 
    ctx.fillRect(0, 0, width, height);
    
    // Middle line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
    ctx.setLineDash([]);

    // 2m Red lines
    ctx.strokeStyle = '#ef4444';
    const twoM = height * 0.12; 
    ctx.beginPath(); ctx.moveTo(0, twoM); ctx.lineTo(width, twoM); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, height - twoM); ctx.lineTo(width, height - twoM); ctx.stroke();

    // 5m Yellow lines
    ctx.strokeStyle = '#eab308';
    const fiveM = height * 0.25; 
    ctx.beginPath(); ctx.moveTo(0, fiveM); ctx.lineTo(width, fiveM); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, height - fiveM); ctx.lineTo(width, height - fiveM); ctx.stroke();

    // Goals
    ctx.fillStyle = 'white';
    const goalW = width * 0.4;
    const goalX = (width - goalW) / 2;
    ctx.fillRect(goalX, 0, goalW, 8);
    ctx.fillRect(goalX, height - 8, goalW, 8);
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    drawPoolBackground(ctx, canvas.width, canvas.height);

    // Draw Pencil Paths
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    pencilPaths.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Draw Current Path (while drawing)
    if (currentPath && currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    // Draw Movement Paths (Arrows)
    Object.entries(movePaths).forEach(([objId, path]) => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.moveTo(path.from.x, path.from.y);
      ctx.lineTo(path.to.x, path.to.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      const angle = Math.atan2(path.to.y - path.from.y, path.to.x - path.from.x);
      ctx.beginPath();
      ctx.moveTo(path.to.x, path.to.y);
      ctx.lineTo(path.to.x - 10 * Math.cos(angle - Math.PI/6), path.to.y - 10 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(path.to.x - 10 * Math.cos(angle + Math.PI/6), path.to.y - 10 * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
    });

    // Draw Preview Arrow (while dragging)
    if (draggedObjectId && dragStartPos) {
      const draggedObj = objects.find(o => o.id === draggedObjectId);
      if (draggedObj) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(dragStartPos.x, dragStartPos.y);
        ctx.lineTo(draggedObj.x, draggedObj.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw Players/Ball
    objects.forEach(obj => {
      const radius = 16;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, radius, 0, 2 * Math.PI);
      
      let fill = '#1d4ed8'; // Blue default
      let stroke = 'white';
      let text = 'white';

      if (obj.type === 'white-cap') { fill = 'white'; stroke = '#1d4ed8'; text = '#1d4ed8'; }
      else if (obj.type === 'red-cap') { fill = '#ef4444'; stroke = 'white'; text = 'white'; }
      else if (obj.type === 'ball') { fill = '#facc15'; stroke = 'black'; text = 'black'; }

      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.stroke();

      if (obj.type !== 'ball') {
        ctx.fillStyle = text;
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.number?.toString() || '', obj.x, obj.y);
      }
    });
  }, [objects, pencilPaths, movePaths, currentPath, draggedObjectId, dragStartPos]);

  useEffect(() => {
    render();
  }, [render]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const width = container.clientWidth;
    const height = window.innerWidth < 768 ? width * 1.5 : Math.min(width * 1.2, window.innerHeight * 0.7);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      render();
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [render]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    const hit = objects.find(obj => Math.sqrt((obj.x - pos.x)**2 + (obj.y - pos.y)**2) < 25);
    
    if (hit) {
      setDraggedObjectId(hit.id);
      setDragStartPos({ x: hit.x, y: hit.y });
      longPressTimer.current = window.setTimeout(() => {
        if (window.confirm('Избриши го овој играч?')) {
          setObjects(prev => prev.filter(o => o.id !== hit.id));
          setMovePaths(prev => {
            const next = { ...prev };
            delete next[hit.id];
            return next;
          });
        }
        setDraggedObjectId(null);
      }, 800);
    } else {
      if (activeTool === 'pen') {
        setIsDrawing(true);
        setCurrentPath([pos]);
      } else if (activeTool === 'eraser') {
        // Erase nearest pencil line
        setPencilPaths(prev => prev.filter(path => 
          !path.points.some(p => Math.sqrt((p.x - pos.x)**2 + (p.y - pos.y)**2) < 20)
        ));
        // Erase nearest movement arrow
        setMovePaths(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(id => {
            const path = next[id];
            const distToTarget = Math.sqrt((path.to.x - pos.x)**2 + (path.to.y - pos.y)**2);
            if (distToTarget < 30) delete next[id];
          });
          return next;
        });
      } else if (activeTool !== 'move') {
        const type = activeTool as TacticObject['type'];
        const teamCount = objects.filter(o => o.type === type).length;
        
        if (type === 'red-cap' && teamCount >= 1) return alert('Максимум 1 голман!');
        if ((type === 'blue-cap' || type === 'white-cap') && teamCount >= 6) return alert('Максимум 6 играчи!');

        const usedNums = objects.filter(o => o.type === type).map(o => o.number || 0);
        let nextNum = 1;
        if (type !== 'red-cap') {
          for (let i = 2; i <= 7; i++) {
            if (!usedNums.includes(i)) { nextNum = i; break; }
          }
        }

        const newObj: TacticObject = {
          id: Math.random().toString(36).substr(2, 9),
          type, x: pos.x, y: pos.y,
          number: type === 'ball' ? undefined : nextNum
        };
        setObjects([...objects, newObj]);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (draggedObjectId) {
      if (longPressTimer.current) { window.clearTimeout(longPressTimer.current); longPressTimer.current = null; }
      setObjects(prev => prev.map(o => o.id === draggedObjectId ? { ...o, x: pos.x, y: pos.y } : o));
    } else if (isDrawing && activeTool === 'pen') {
      setCurrentPath(prev => prev ? [...prev, pos] : [pos]);
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (draggedObjectId && dragStartPos) {
      // Only record path if they actually moved the player
      const dist = Math.sqrt((dragStartPos.x - pos.x)**2 + (dragStartPos.y - pos.y)**2);
      if (dist > 10) {
        setMovePaths(prev => ({
          ...prev,
          [draggedObjectId]: { from: dragStartPos, to: pos }
        }));
      }
    }

    if (isDrawing && currentPath) {
      setPencilPaths(prev => [...prev, { id: Math.random().toString(), points: currentPath }]);
      setCurrentPath(null);
    }

    if (longPressTimer.current) { window.clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    setIsDrawing(false);
    setDraggedObjectId(null);
    setDragStartPos(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const pos = getPos(e);
    const hit = objects.find(obj => Math.sqrt((obj.x - pos.x)**2 + (obj.y - pos.y)**2) < 25);
    if (hit) {
      setObjects(prev => prev.filter(o => o.id !== hit.id));
      setMovePaths(prev => {
        const next = { ...prev };
        delete next[hit.id];
        return next;
      });
    }
  };

  const clearAll = () => {
    if (window.confirm('Целосно чистење на таблата?')) {
      setObjects([]);
      setPencilPaths([]);
      setMovePaths({});
    }
  };

  const saveToGallery = () => {
    if (canvasRef.current) {
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.9);
      onSaveToGallery(base64, `Тактика ${new Date().toLocaleDateString()}`);
      alert('Зачувано во Галерија!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-6 space-y-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <PenTool className="text-indigo-600 dark:text-indigo-400" size={24} />
             </div>
             <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Тактичка Табла</h2>
          </div>
          <div className="flex gap-2">
             <button onClick={clearAll} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-100 dark:border-red-900/30" title="Исчисти се">
                <RefreshCw size={20} />
             </button>
             <button onClick={saveToGallery} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                <Save size={20} />
                <span className="hidden sm:inline">Зачувај</span>
             </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
          <button onClick={() => setActiveTool('move')} className={`p-3 rounded-xl transition-all ${activeTool === 'move' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`} title="Помести играч">
            <MousePointer2 size={24} />
          </button>
          <button onClick={() => setActiveTool('pen')} className={`p-3 rounded-xl transition-all ${activeTool === 'pen' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`} title="Молив (Слободно цртање)">
            <PenTool size={24} />
          </button>
          <button onClick={() => setActiveTool('eraser')} className={`p-3 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`} title="Гума (Бриши само линии)">
            <Eraser size={24} />
          </button>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-600 mx-1 self-center" />
          <button onClick={() => setActiveTool('blue-cap')} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${activeTool === 'blue-cap' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`}>
            <div className="w-6 h-6 rounded-full bg-blue-700 border-2 border-white"></div>
            <span className="text-xs font-bold hidden sm:inline">СИНИ</span>
          </button>
          <button onClick={() => setActiveTool('white-cap')} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${activeTool === 'white-cap' ? 'bg-white text-blue-700 border-blue-600 shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`}>
            <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-700"></div>
            <span className="text-xs font-bold hidden sm:inline">БЕЛИ</span>
          </button>
          <button onClick={() => setActiveTool('red-cap')} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${activeTool === 'red-cap' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`}>
            <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white"></div>
            <span className="text-xs font-bold hidden sm:inline">ГОЛМАН</span>
          </button>
          <button onClick={() => setActiveTool('ball')} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${activeTool === 'ball' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-600'}`}>
            <div className="w-6 h-6 rounded-full bg-yellow-400 border border-black"></div>
            <span className="text-xs font-bold hidden sm:inline">ТОПКА</span>
          </button>
        </div>

        <div ref={containerRef} className="w-full relative rounded-2xl overflow-hidden shadow-2xl border-8 border-cyan-800 bg-cyan-900 touch-none cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="block w-full h-full"
          />
        </div>
        
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-sm text-indigo-800 dark:text-indigo-300 flex items-start gap-3 border border-indigo-100 dark:border-indigo-900/30">
            <Info className="flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
                <p><strong>Важни правила и контроли:</strong></p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                    <li><strong>Една линија по играч:</strong> Повторно поместување на играч ја брише старата стрелка.</li>
                    <li><strong>Молив:</strong> Слободните линии сега се трајни и не исчезнуваат при поместување капи.</li>
                    <li><strong>Гума:</strong> Кликнете на линија или стрелка за да ја избришете поединечно.</li>
                    <li><strong>Лимит:</strong> Максимум 1 голман и 6 играчи по екипа (Броеви 1 до 7).</li>
                    <li><strong>Бришење капи:</strong> Двоен клик на играчот за отстранување од базен.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TacticsBoard;
