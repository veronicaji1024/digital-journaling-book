import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, RefreshCw, Upload, AlertTriangle, Power, Image as ImageIcon } from 'lucide-react';
import { cn } from '../utils';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsStarting(true);
    setError(null);

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API not available");
        }

        const newStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, // Simple constraint to maximize compatibility
            audio: false 
        });
        
        setStream(newStream);
        
        if (videoRef.current) {
            videoRef.current.srcObject = newStream;
            await videoRef.current.play();
        }
    } catch (err: any) {
        console.error("Camera Error:", err);
        setError("Could not start camera. Please check permissions.");
    } finally {
        setIsStarting(false);
    }
  };

  const takePhoto = () => {
    if (!stream) return;
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        triggerShutter();
      }
    }, 1000);
  };

  const triggerShutter = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Mirror the image to match the video preview
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0);
            onCapture(canvas.toDataURL('image/jpeg'));
            onClose();
        }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#4A4A4A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#E0DDD5] p-3 rounded-2xl shadow-xl max-w-lg w-full relative border border-white"
      >
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
        />

        {/* Camera UI */}
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden relative aspect-[4/3] shadow-inner flex flex-col items-center justify-center">
           {!stream && !error ? (
              <div className="text-center p-6 flex flex-col items-center">
                 <p className="text-[#E0DDD5] mb-4 ui-text text-lg">Camera Permission Required</p>
                 <div className="flex flex-col gap-3 w-full">
                    <button 
                        onClick={startCamera}
                        disabled={isStarting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A4B494] text-white rounded-xl hover:bg-[#8FA08F] transition-colors font-bold shadow-lg ui-text text-xl w-full"
                    >
                        {isStarting ? <RefreshCw className="animate-spin" /> : <Power size={20} />}
                        {isStarting ? "Starting..." : "Start Camera"}
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#B5C0D0] text-white rounded-xl hover:bg-[#9EA9B9] transition-colors font-bold shadow-lg ui-text text-xl w-full"
                    >
                        <ImageIcon size={20} />
                        Upload Photo
                    </button>
                 </div>
              </div>
           ) : error ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-[#2a2a2a] text-[#8C8C8C] gap-4 p-4 text-center">
                <AlertTriangle size={32} className="text-[#E6C9C9]" />
                <div className="flex flex-col gap-1">
                    <span className="ui-text text-xl text-[#E0DDD5]">{error}</span>
                    <span className="text-xs opacity-70 text-body">Please upload a photo instead.</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 mt-4 w-full px-8">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#A4B494] text-white rounded-xl hover:bg-[#8FA08F] transition-colors font-bold shadow-lg text-lg ui-text"
                    >
                        <Upload size={20} /> Choose Photo
                    </button>
                </div>
             </div>
           ) : (
             <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]" 
             />
           )}

           {/* Overlays (Only if stream is active) */}
           {stream && (
             <>
               <div className="absolute top-4 left-4 text-[#A4B494] ui-text text-lg z-10">
                  REC ● 00:00:00
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#E0DDD5]/30 pointer-events-none z-10">
                 <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#E0DDD5]"></div>
                 <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#E0DDD5]"></div>
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#E0DDD5]"></div>
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#E0DDD5]"></div>
               </div>
             </>
           )}

           {/* Countdown */}
           {countdown !== null && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
                <span className="text-9xl font-black text-white drop-shadow-lg animate-pulse title-doto">
                  {countdown === 0 ? 'SNAP!' : countdown}
                </span>
             </div>
           )}

           {/* Flash Effect */}
           {flash && <div className="absolute inset-0 bg-white z-50"></div>}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-4 px-4 pb-2">
            <button onClick={onClose} className="p-3 bg-[#B5C0D0] rounded-full text-white hover:bg-[#A3B0C2] shadow-sm" title="Close">
                <X size={20} />
            </button>
            
            {/* Center Shutter Button */}
            <div className="flex gap-4 items-center pl-10">
                 {stream ? (
                    <button 
                        onClick={takePhoto}
                        className="w-14 h-14 rounded-full bg-[#E6C9C9] border-4 border-[#F4F4F2] shadow-md active:scale-95 flex items-center justify-center"
                    >
                        <Camera size={24} className="text-white drop-shadow-sm" />
                    </button>
                 ) : (
                    <div className="w-14 h-14"></div>
                 )}
            </div>

            {/* Right Action: Refresh & Upload */}
            <div className="flex gap-2">
                 {stream && (
                    <button 
                        onClick={startCamera}
                        className="p-3 bg-[#B5C0D0] rounded-full text-white hover:bg-[#A3B0C2] shadow-sm"
                        title="Restart Camera"
                    >
                         <RefreshCw size={20} />
                    </button>
                 )}
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-[#B5C0D0] rounded-full text-white hover:bg-[#A3B0C2] shadow-sm"
                    title="Upload Photo"
                >
                     <Upload size={20} />
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};