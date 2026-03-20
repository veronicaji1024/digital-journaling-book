import React, { useState, useEffect } from 'react';
import { Book } from './components/Book';
import { Toolbar } from './components/Toolbar';
import { CameraModal } from './components/CameraModal';
import { AudioRecorderModal } from './components/AudioRecorderModal';
import { ScrapPage, ItemType, ScrapItem } from './types';
import { generateId, getRandomColor, getRandomFont, getRandomRotation } from './constants';
import { ArrowLeft, ArrowRight, Save, Volume2, VolumeX, Download, CheckCircle } from 'lucide-react';
// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import html2canvas from 'html2canvas';

const INITIAL_PAGES: ScrapPage[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i.toString(),
  items: [],
  paperType: i % 2 === 0 ? 'grid' : 'dot'
}));

const STORAGE_KEY = 'gestumemo_data_v1';

const App: React.FC = () => {
  const [pages, setPages] = useState<ScrapPage[]>(INITIAL_PAGES);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activeSide, setActiveSide] = useState<0 | 1>(0); // 0 = Left Page, 1 = Right Page
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                setPages(parsed);
            }
        } catch (e) {
            console.error("Failed to load saved data", e);
        }
    }
  }, []);

  const handleSaveProject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  // Sound effects
  const playFlipSound = () => {
    // Simulated audio
    // const audio = new Audio('/page-flip.mp3');
    // audio.volume = volume;
    // audio.play().catch(e => {}); 
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 2) {
      setCurrentPageIndex(prev => prev + 2);
      setActiveSide(0); // Reset to left page on flip
      playFlipSound();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 2);
      setActiveSide(1); // Set to right page on flip back? Or just left. Let's default left.
      setActiveSide(0);
      playFlipSound();
    }
  };

  const handleAddItem = (type: ItemType, content: string, meta?: any) => {
    const newItem: ScrapItem = {
      id: generateId(),
      type,
      content,
      x: 100 + Math.random() * 50, // Slight random offset
      y: 100 + Math.random() * 50,
      rotation: type === ItemType.RANSOM ? 0 : getRandomRotation(),
      scale: 1,
      zIndex: Date.now(),
      meta: meta || {}
    };

    if (type === ItemType.RANSOM) {
      newItem.meta = {
        fonts: content.split('').map(() => getRandomFont()),
        colors: content.split('').map(() => getRandomColor()),
        rotations: content.split('').map(() => getRandomRotation()),
        textColors: content.split('').map(() => '#4A4A4A'),
      };
    }
    
    if (type === ItemType.TEXT) {
      newItem.content = prompt("What do you want to write?", "Dear Diary...") || "New Note";
      newItem.meta = { color: '#6D6D6D' };
    }

    setPages(prev => {
      const newPages = [...prev];
      // Determine target page based on activeSide state
      // Ensure we don't overflow if activeSide is 1 but that page doesn't exist (unlikely with even pages)
      const targetPageIndex = currentPageIndex + activeSide;
      
      if (newPages[targetPageIndex]) {
        newPages[targetPageIndex] = {
            ...newPages[targetPageIndex],
            items: [...newPages[targetPageIndex].items, newItem]
        };
      }
      return newPages;
    });
  };

  const handleAudioSave = (url: string) => {
      handleAddItem(ItemType.TAPE, 'audio-tape', { 
          audioUrl: url, 
          label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      });
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    // 1. Deselect any active item to remove borders/handles
    setSelectedItemId(null);
    
    // 2. Small delay to let React re-render the "clean" state
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            hotfixes: ['px_scaling']
        });
        
        // Remove default page to add pages with specific dimensions
        doc.deletePage(1);

        const leftPage = document.getElementById('book-page-left');
        const rightPage = document.getElementById('book-page-right');

        // Helper to capture and add page
        const addPageToPdf = async (element: HTMLElement) => {
            if (!element) return;
            
            // Capture with html2canvas
            // Use 3x scale for high resolution
            const canvas = await html2canvas(element, {
                scale: 3, 
                useCORS: true,
                backgroundColor: null, // Transparent/Computed background
                logging: false,
                ignoreElements: (el) => el.classList.contains('no-export')
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Add page matching the captured canvas dimensions exactly
            // This preserves 100% visual fidelity
            doc.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'landscape' : 'portrait');
            doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        };

        if (leftPage) await addPageToPdf(leftPage);
        if (rightPage) await addPageToPdf(rightPage);

        doc.save(`GestuMemo_Vol_II_${new Date().toISOString().slice(0,10)}.pdf`);

    } catch (error) {
        console.error("Export failed:", error);
        alert("Could not generate PDF. Please try again.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center overflow-hidden bg-[#E0DDD5] relative text-body">
      
      {/* Background Decor (Morandi Blobs) */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#A4B494] rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#DDBEA9] rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      {/* Header */}
      <div className="absolute top-4 w-full px-8 flex justify-between items-center z-10">
        <h1 className="text-[#4A4A4A] text-4xl tracking-tight title-doto">
          GestuMemo <span className="text-sm opacity-80 bg-[#6D6D6D] text-white px-2 py-0.5 rounded-full ml-2 align-middle ui-text">Vol. II</span>
        </h1>
        
        <div className="flex gap-2">
            <button 
                className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg text-[#4A4A4A] hover:bg-white/60 transition-colors border border-white ui-text text-lg"
                onClick={handleSaveProject}
            >
                {showSaveNotification ? <CheckCircle size={18} className="text-[#A4B494]" /> : <Save size={18} />}
                {showSaveNotification ? "Saved!" : "Save"}
            </button>
            <button 
                className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg text-[#4A4A4A] hover:bg-white/60 transition-colors border border-white ui-text text-lg disabled:opacity-50"
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? <span className="animate-pulse">Generating...</span> : <><Download size={18} /> Export</>}
            </button>
        </div>
      </div>

      {/* Main Book Area */}
      <div className="w-full px-4 md:px-12 flex items-center justify-center h-[75vh]">
         
         {/* Navigation Left */}
         <button 
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="mr-4 p-4 rounded-full bg-white/60 hover:bg-white text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all z-20 text-[#6D6D6D] no-export"
         >
            <ArrowLeft size={32} />
         </button>

         <Book 
           pages={pages} 
           setPages={setPages} 
           currentPageIndex={currentPageIndex}
           activeSide={activeSide}
           setActiveSide={setActiveSide}
           volume={volume}
           selectedItemId={selectedItemId}
           onSelect={setSelectedItemId}
         />

         {/* Navigation Right */}
         <button 
            onClick={handleNextPage}
            disabled={currentPageIndex >= pages.length - 2}
            className="ml-4 p-4 rounded-full bg-white/60 hover:bg-white text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all z-20 text-[#6D6D6D] no-export"
         >
            <ArrowRight size={32} />
         </button>
      </div>

      <Toolbar 
        onAddItem={handleAddItem} 
        onCameraOpen={() => setIsCameraOpen(true)} 
        onAudioOpen={() => setIsAudioOpen(true)}
      />

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onCapture={(url) => handleAddItem(ItemType.PHOTO, url)}
      />

      <AudioRecorderModal 
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        onSave={handleAudioSave}
      />

      {/* Footer Info & Volume Control */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4 z-50">
        
        {/* Volume Control */}
        <div 
          className="relative flex items-center bg-white/50 backdrop-blur-sm rounded-full p-2 border border-white/60 shadow-sm"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button 
             onClick={() => setVolume(v => v === 0 ? 1 : 0)}
             className="text-[#6D6D6D] hover:text-[#4A4A4A]"
          >
             {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${showVolumeSlider ? 'w-24 ml-2 opacity-100' : 'w-0 opacity-0'}`}>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#B5C0D0] rounded-lg appearance-none cursor-pointer accent-[#A4B494]"
            />
          </div>
        </div>

        <div className="text-[#8E806A] text-xs ui-text pointer-events-none border-l border-[#8E806A]/30 pl-4">
          De Vinne Collection • Est. 2024
        </div>
      </div>
    </div>
  );
};

export default App;