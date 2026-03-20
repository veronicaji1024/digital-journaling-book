import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ItemType, ScrapItem } from '../types';
import { cn } from '../utils';
import { Trash2, RotateCw, RotateCcw, Play, Pause, Maximize2 } from 'lucide-react';

interface DraggableItemProps {
  item: ScrapItem;
  onUpdate: (id: string, changes: Partial<ScrapItem>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  volume: number;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  volume
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Resize Refs
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const initialScaleRef = useRef(1);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleDragEnd = (_: any, info: any) => {
    if (isResizing) return;
    // CRITICAL FIX: Update the actual x/y state based on the drag offset
    // This ensures position is persisted when component unmounts (page flip)
    const newX = item.x + info.offset.x;
    const newY = item.y + info.offset.y;

    onUpdate(item.id, { 
        x: newX,
        y: newY,
        zIndex: Date.now() 
    }); 
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the item when clicking play
    if (!item.meta?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(item.meta.audioUrl);
      audioRef.current.volume = volume;
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Resize Logic
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      // Sensitivity: 150px drag = +1.0 scale
      const sensitivity = 150; 
      const newScale = Math.max(0.5, Math.min(3, initialScaleRef.current + (deltaX / sensitivity)));
      
      onUpdate(item.id, { scale: newScale });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, item.id, onUpdate]);

  const handleResizeStart = (e: React.PointerEvent) => {
      e.stopPropagation(); // Critical to prevent dragging the item itself
      setIsResizing(true);
      resizeStartPos.current = { x: e.clientX, y: e.clientY };
      initialScaleRef.current = item.scale;
  };

  const renderContent = () => {
    switch (item.type) {
      case ItemType.PHOTO:
        return (
          <div className="relative group p-3 bg-white shadow-lg rotate-1 transition-transform">
             {/* Polaroid Style */}
             {/* Use div with background-image to fix html2canvas object-fit export issues */}
            <div 
                className="aspect-square w-40 overflow-hidden bg-[#F0F0F0] mb-4 border border-gray-100 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.content})` }}
                role="img"
                aria-label={item.meta?.caption || "memory"}
            />
            <div className="text-body italic text-center text-[#4A4A4A] text-lg">
              {item.meta?.caption || ''}
            </div>
            {/* Faux Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#DDBEA9]/60 rotate-2 backdrop-blur-sm border-l border-r border-white/40 shadow-sm" style={{clipPath: 'polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%)'}}></div>
          </div>
        );
      
      case ItemType.STICKER:
        // Handle Tapes
        if (item.content.startsWith('tape-')) {
           const colors: Record<string, string> = {
             'tape-yellow': '#E3D5A5', // Masking tape yellow
             'tape-pink': '#E6C9C9',   // Rose
             'tape-blue': '#B5C0D0',   // Dusty Blue
           };
           const bg = colors[item.content] || '#E3D5A5';
           
           // Rice paper texture data URI to avoid 404 errors
           const texture = `data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E`;

           return (
             <div 
               className="w-32 h-8 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-90"
               style={{ 
                 backgroundColor: bg,
                 clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 0% 100%)', // Rough jagged edges
                 maskImage: 'linear-gradient(90deg, transparent 0%, black 2%, black 98%, transparent 100%)' // Fade edges slightly
               }}
             >
                <div 
                  className="w-full h-full"
                  style={{ backgroundImage: `url("${texture}")` }}
                ></div>
             </div>
           );
        }
        
        // Handle Washi
        if (item.content === 'washi') {
           return <div className="w-32 h-6 bg-[#A4B494]/60 -rotate-2 border-dashed border-white border-2"></div>;
        }

        // Handle Clips (Vector Style)
        if (item.content.startsWith('clip-')) {
            const clipColors: Record<string, string> = {
                'clip-silver': '#C0C0C0',
                'clip-gold': '#D4AF37',
                'clip-rose': '#E6C2C2',
                'clip-black': '#333333'
            };
            const c = clipColors[item.content] || '#C0C0C0';
            return (
                <div>
                    <svg width="40" height="60" viewBox="0 0 50 100" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" className="drop-shadow-md">
                        <path d="M15 20 V 80 A 15 15 0 0 0 45 80 V 10" />
                        <path d="M45 10 A 10 10 0 0 0 25 10 V 70" />
                        <path d="M25 70 A 5 5 0 0 0 15 70 V 20" />
                    </svg>
                </div>
            );
        }

        // Handle Pins
        if (item.content.startsWith('pin-')) {
            const pinColor = item.content === 'pin-red' ? '#E57373' : '#64B5F6';
            return (
                <div className="drop-shadow-md">
                    <svg width="30" height="30" viewBox="0 0 40 40">
                         {/* Shadow */}
                         <circle cx="22" cy="22" r="14" fill="black" fillOpacity="0.2" />
                         {/* Head */}
                         <circle cx="20" cy="20" r="14" fill={pinColor} />
                         {/* Shine */}
                         <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.6" />
                         {/* Metal point center */}
                         <circle cx="20" cy="20" r="2" fill="#888" />
                    </svg>
                </div>
            );
        }

        // Default Emoji/Text Stickers
        return (
          <div className="text-6xl drop-shadow-sm select-none grayscale-[0.3]">
            {item.content === 'stamp' ? '📮' : item.content}
          </div>
        );

      case ItemType.RANSOM:
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px] justify-center pointer-events-none">
            {item.content.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block px-1.5 py-0.5 shadow-sm text-2xl font-bold uppercase"
                style={{
                  backgroundColor: item.meta?.colors?.[i] || '#F4F4F2',
                  fontFamily: item.meta?.fonts?.[i] || 'Andada Pro, serif',
                  transform: `rotate(${item.meta?.rotations?.[i] || 0}deg)`,
                  color: item.meta?.textColors?.[i] || '#4A4A4A',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        );

      case ItemType.TEXT:
        return (
          <div 
            className="text-body text-2xl text-[#4A4A4A] p-2 border-dashed border-transparent hover:border-gray-300 leading-relaxed"
            style={{ 
              color: item.meta?.color || '#4A4A4A'
            }}
          >
            {item.content}
          </div>
        );

      case ItemType.TAPE:
        return (
          <div className="relative w-48 h-32 bg-[#4A4A4A] rounded-lg shadow-xl flex items-center justify-center overflow-hidden border-2 border-[#6D6D6D]">
             {/* Cassette Tape Visuals */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#333] to-[#1a1a1a]"></div>
            
            {/* Cassette Label Area */}
            <div className="relative z-10 w-40 h-20 bg-[#E0DDD5] rounded px-2 py-1 flex flex-col items-center justify-center shadow-inner">
              <div className="w-full h-8 bg-white border border-gray-300 mb-1 flex items-center justify-center">
                 <span className="text-body italic text-xs text-gray-800 truncate w-full px-2 font-bold">{item.meta?.label || 'Audio Memory'}</span>
              </div>
              
              {/* Spools */}
              <div className="flex gap-4">
                 <div className={cn("w-8 h-8 rounded-full bg-[#333] border-4 border-white flex items-center justify-center", isPlaying ? "animate-spin" : "")}>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                 </div>
                 <div className={cn("w-8 h-8 rounded-full bg-[#333] border-4 border-white flex items-center justify-center", isPlaying ? "animate-spin" : "")}>
                     <div className="w-1 h-1 bg-white rounded-full"></div>
                 </div>
              </div>
            </div>

            {/* Play Button Overlay */}
            <button 
                onClick={handleTogglePlay}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#A4B494] flex items-center justify-center shadow-lg hover:bg-[#8FA08F] transition-colors z-20"
            >
                {isPlaying ? <Pause size={10} className="text-white" /> : <Play size={10} className="text-white ml-0.5" />}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false} 
      initial={{ x: item.x, y: item.y, rotate: item.rotation, scale: 0.8, opacity: 0 }}
      animate={{ x: item.x, y: item.y, rotate: item.rotation, scale: item.scale, opacity: 1 }}
      whileHover={{ scale: item.scale * 1.05 }}
      whileTap={{ scale: item.scale * 1.05, cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
      onTap={() => onSelect(item.id)}
      style={{ zIndex: item.zIndex, position: 'absolute', top: 0, left: 0 }}
      className={cn(
        "cursor-grab touch-none",
        // Only apply selection visual if selected. 
        // NOTE: The 'no-export' class on children will prevent UI capture, but this ring also needs to be removed by deselecting in App.tsx
        isSelected && "ring-2 ring-[#B5C0D0] ring-offset-2 ring-offset-transparent rounded-lg"
      )}
    >
      {renderContent()}
      
      {isSelected && (
        <>
            {/* Toolbar - Added no-export class */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-lg px-2 py-1 z-50 no-export">
                {/* Rotate Left */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { rotation: item.rotation - 15 }); }}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                >
                    <RotateCcw size={14} />
                </button>

                {/* Rotate Right */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { rotation: item.rotation + 15 }); }}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                >
                    <RotateCw size={14} />
                </button>

                <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>

                {/* Delete */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-1 hover:bg-red-50 text-[#DDBEA9] hover:text-red-400 rounded-full"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Resize Handle - Added no-export class */}
            <div 
                className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full shadow border border-gray-300 flex items-center justify-center cursor-nwse-resize z-50 hover:bg-gray-50 transition-colors no-export"
                onPointerDown={handleResizeStart}
            >
                <Maximize2 size={12} className="text-gray-500 transform rotate-90" />
            </div>
        </>
      )}
    </motion.div>
  );
};