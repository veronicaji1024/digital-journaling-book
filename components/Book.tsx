import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrapPage, ScrapItem, ItemType } from '../types';
import { cn } from '../utils';
import { DraggableItem } from './DraggableItem';
import { generateId, getRandomColor, getRandomFont, getRandomRotation } from '../constants';
import { Pencil } from 'lucide-react';

interface BookProps {
  pages: ScrapPage[];
  setPages: React.Dispatch<React.SetStateAction<ScrapPage[]>>;
  currentPageIndex: number;
  activeSide: 0 | 1;
  setActiveSide: (side: 0 | 1) => void;
  volume: number;
  selectedItemId: string | null;
  onSelect: (id: string | null) => void;
}

export const Book: React.FC<BookProps> = ({ 
    pages, 
    setPages, 
    currentPageIndex, 
    activeSide, 
    setActiveSide,
    volume,
    selectedItemId,
    onSelect
}) => {
  const currentPage = pages[currentPageIndex];
  const nextPage = pages[currentPageIndex + 1];

  const handleUpdateItem = (pageId: string, itemId: string, changes: Partial<ScrapItem>) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        items: p.items.map(i => i.id === itemId ? { ...i, ...changes } : i)
      };
    }));
  };

  const handleDeleteItem = (pageId: string, itemId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        items: p.items.filter(i => i.id !== itemId)
      };
    }));
    onSelect(null);
  };

  const renderPage = (page: ScrapPage | undefined, isRight: boolean) => {
    if (!page) return <div className="flex-1 bg-gray-200/50 h-full"></div>;

    const isActive = (isRight ? 1 : 0) === activeSide;

    return (
      <div 
        id={isRight ? 'book-page-right' : 'book-page-left'}
        className={cn(
          "relative flex-1 h-full shadow-inner overflow-hidden transition-colors duration-300",
          page.paperType === 'grid' ? 'pattern-grid' : 'pattern-dot',
          "bg-[#fcfbf9]", // Off-white paper color
          isRight ? "rounded-r-lg border-l border-gray-300" : "rounded-l-lg border-r border-gray-300",
          isActive ? "ring-4 ring-inset ring-[#A4B494]/30" : "" // Visual indicator of active page
        )}
        onClick={(e) => {
            e.stopPropagation();
            onSelect(null);
            setActiveSide(isRight ? 1 : 0);
        }}
      >
        {/* Active Page Indicator */}
        {isActive && (
            <div className={cn(
                "absolute top-4 text-[#A4B494] flex items-center gap-1 text-sm font-bold ui-text opacity-50",
                isRight ? "right-12" : "left-4"
            )}>
                <Pencil size={14} /> Editing
            </div>
        )}

        {/* Page Number */}
        <div className={cn(
            "absolute bottom-4 text-gray-400 ui-text text-lg select-none pointer-events-none",
            isRight ? "right-4" : "left-4"
        )}>
            Page {parseInt(page.id) + 1}
        </div>

        {/* Drop Zone Indicators (Visual only) */}
        {page.items.length === 0 && (
            <div className="absolute inset-10 border-4 border-dashed border-gray-200 rounded-xl flex items-center justify-center pointer-events-none">
                <span className="text-gray-300 text-body text-2xl italic rotate-[-5deg] opacity-60">
                    {isActive ? "Place items here..." : "Click to edit"}
                </span>
            </div>
        )}

        {/* Items */}
        {page.items.map(item => (
          <DraggableItem
            key={item.id}
            item={item}
            onUpdate={(id, changes) => handleUpdateItem(page.id, id, changes)}
            onDelete={(id) => handleDeleteItem(page.id, id)}
            onSelect={onSelect}
            isSelected={selectedItemId === item.id}
            volume={volume}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-6xl aspect-[3/2] mx-auto perspective-1000">
      {/* Book Cover / Spread Background */}
      <div className="absolute inset-0 bg-[#5d4037] rounded-xl shadow-2xl transform translate-y-2 scale-[1.02]"></div>
      
      {/* The Spread */}
      <div className="relative w-full h-full flex bg-white rounded-lg shadow-xl overflow-hidden">
        {renderPage(currentPage, false)}
        
        {/* Spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0 z-20 pointer-events-none">
             {/* Spiral rings generated programmatically for visual density */}
            {Array.from({ length: 20 }).map((_, i) => (
                <div 
                    key={i} 
                    className="spiral-ring" 
                    style={{ top: `${(i * 5) + 2}%` }}
                ></div>
            ))}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent z-10 pointer-events-none"></div>

        {renderPage(nextPage, true)}
      </div>
    </div>
  );
};