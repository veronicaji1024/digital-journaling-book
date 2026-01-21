import React, { useState } from 'react';
import { ItemType } from '../types';
import { STICKERS } from '../constants';
import { Sticker, Type, Image as ImageIcon, Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

interface ToolbarProps {
  onAddItem: (type: ItemType, content: string, meta?: any) => void;
  onCameraOpen: () => void;
  onAudioOpen: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddItem, onCameraOpen, onAudioOpen }) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'text' | null>(null);
  const [ransomInput, setRansomInput] = useState('');

  const handleRansomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ransomInput.trim()) {
      onAddItem(ItemType.RANSOM, ransomInput);
      setRansomInput('');
      setActiveTab(null);
    }
  };

  // Helper to render preview icon in drawer
  const renderStickerPreview = (s: any) => {
    if (s.src.startsWith('tape-')) {
       const colors: Record<string, string> = {
         'tape-yellow': '#E3D5A5',
         'tape-pink': '#E6C9C9',
         'tape-blue': '#B5C0D0',
       };
       return <div className="w-8 h-4 rounded-sm shadow-sm" style={{ backgroundColor: colors[s.src] }}></div>
    }
    if (s.src.startsWith('clip-')) {
       return <span className="text-2xl">📎</span>
    }
    if (s.src.startsWith('pin-')) {
       return <span className="text-2xl" style={{color: s.src.includes('red') ? 'red' : 'blue'}}>📍</span>
    }
    if (s.src === 'washi') {
        return <span className="text-2xl">🍬</span>
    }
    if (s.src === 'stamp') {
        return <span className="text-2xl">📮</span>
    }
    return <span className="text-3xl group-hover:scale-110 transition-transform grayscale-[0.2]">{s.src}</span>
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      
      {/* Drawer Content */}
      <AnimatePresence>
        {activeTab && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            className="mb-4 bg-[#F4F4F2] border border-[#B5C0D0] rounded-xl p-4 shadow-xl w-[90vw] max-w-md relative"
          >
             <button 
                onClick={() => setActiveTab(null)}
                className="absolute -top-3 -right-3 bg-[#E6C9C9] text-white rounded-full p-1 shadow-md hover:bg-[#D5B0B0]"
             >
               <X size={16} />
             </button>

             {activeTab === 'stickers' && (
               <div className="grid grid-cols-4 gap-4 max-h-48 overflow-y-auto p-2">
                  {STICKERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onAddItem(ItemType.STICKER, s.src)}
                      className="flex flex-col items-center justify-center p-2 hover:bg-[#E0DDD5] rounded-lg transition-colors group"
                    >
                      {renderStickerPreview(s)}
                      <span className="text-[10px] uppercase font-bold text-[#8E806A] mt-1 text-body text-center leading-tight">{s.label}</span>
                    </button>
                  ))}
               </div>
             )}

             {activeTab === 'text' && (
               <div className="space-y-4">
                  <div className="border-b border-[#D1D1D1] pb-4">
                    <h3 className="text-sm font-bold uppercase text-[#8E806A] mb-2 ui-text text-lg">Ransom Cutouts</h3>
                    <form onSubmit={handleRansomSubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        value={ransomInput}
                        onChange={(e) => setRansomInput(e.target.value)}
                        placeholder="Type message..."
                        className="flex-1 border border-[#B5C0D0] bg-white p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A4B494] text-body"
                        maxLength={20}
                      />
                      <button type="submit" className="bg-[#6D6D6D] text-white px-4 font-bold uppercase text-lg hover:bg-[#4A4A4A] ui-text">
                        Cut
                      </button>
                    </form>
                  </div>
                  <button 
                    onClick={() => { onAddItem(ItemType.TEXT, 'Click to edit'); setActiveTab(null); }}
                    className="w-full py-2 bg-[#E0DDD5] hover:bg-[#D0CDC5] border border-[#B5C0D0] text-[#4A4A4A] text-body italic"
                  >
                    Add Handwritten Note
                  </button>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toolbar Buttons (Clean Morandi Style) */}
      <div className="bg-[#F4F4F2]/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/60 flex gap-4 items-center">
        <ToolButton 
          icon={<Sticker size={20} />} 
          label="Stickers" 
          onClick={() => setActiveTab(activeTab === 'stickers' ? null : 'stickers')} 
          active={activeTab === 'stickers'}
        />
        <ToolButton 
          icon={<Type size={20} />} 
          label="Text" 
          onClick={() => setActiveTab(activeTab === 'text' ? null : 'text')} 
          active={activeTab === 'text'}
        />
        <div className="w-px h-8 bg-[#D1D1D1] mx-1"></div>
        <ToolButton 
          icon={<ImageIcon size={20} />} 
          label="Photo" 
          onClick={onCameraOpen}
          special
        />
        <ToolButton 
          icon={<Mic size={20} />} 
          label="Voice" 
          onClick={onAudioOpen} 
        />
      </div>
    </div>
  );
};

const ToolButton = ({ icon, label, onClick, active, special }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all",
      active ? "bg-[#B5C0D0] text-white shadow-inner" : "hover:bg-[#E0DDD5] text-[#6D6D6D]",
      special ? "bg-[#DDBEA9] text-white shadow-md hover:bg-[#CBA58C] hover:scale-105" : ""
    )}
  >
    {icon}
    <span className="text-[12px] font-bold mt-0.5 opacity-80 ui-text">{label}</span>
  </button>
);