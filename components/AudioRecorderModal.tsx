import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, X, Save, AlertCircle, Upload } from 'lucide-react';
import { cn } from '../utils';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioUrl: string) => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({ isOpen, onClose, onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
        if (isRecording) stopRecording();
        setAudioBlob(null);
        setDuration(0);
        setError(null);
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         throw new Error("Microphone not supported.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Determine supported mime type
      const types = [
        "audio/webm", 
        "audio/mp4", 
        "audio/ogg", 
        "audio/wav",
        "audio/aac"
      ];
      const mimeType = types.find(type => MediaRecorder.isTypeSupported(type));
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        
        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording without timeslice for better compatibility (fires ondataavailable on stop)
      mediaRecorder.start();
      setIsRecording(true);
      
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Microphone access denied", err);
      setError("Microphone access blocked. Please enable it in browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
    }
  };

  const handleSave = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      onSave(url);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSave(url);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#4A4A4A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#E0DDD5] p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center border border-white"
      >
        <button onClick={onClose} className="self-end text-gray-500 hover:text-gray-700">
            <X size={20} />
        </button>
        
        <h3 className="text-3xl text-[#4A4A4A] mb-8 tracking-tight title-doto">Voice Recorder</h3>

        {/* Visualizer Circle / Error State */}
        <div className={cn(
            "w-32 h-32 rounded-full border-4 flex items-center justify-center mb-6 transition-all duration-300",
            error ? "border-red-300 bg-red-50" :
            isRecording ? "border-[#A4B494] bg-[#A4B494]/10 animate-pulse-record" : "border-[#B5C0D0] bg-gray-100"
        )}>
            {error ? (
                <AlertCircle size={48} className="text-red-300" />
            ) : isRecording ? (
                <Mic size={48} className="text-[#A4B494]" />
            ) : audioBlob ? (
                <Save size={48} className="text-[#B5C0D0]" />
            ) : (
                <Mic size={48} className="text-[#B5C0D0]" />
            )}
        </div>

        {/* Status Message */}
        {error ? (
            <div className="text-center mb-6">
                <p className="text-red-400 text-sm font-bold mb-2 text-body">{error}</p>
                <div className="flex flex-col items-center gap-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-[#A4B494] text-white rounded-full font-bold shadow-md hover:bg-[#8FA08F] flex items-center gap-2 ui-text text-lg"
                    >
                        <Upload size={16} /> Upload Audio File
                    </button>
                    <button 
                        onClick={startRecording}
                        className="text-xs text-gray-500 underline hover:text-gray-700 mt-2 text-body"
                    >
                        Retry Permission
                    </button>
                </div>
            </div>
        ) : (
            <div className="ui-text text-4xl text-[#6D6D6D] mb-8 font-bold">
                {formatTime(duration)}
            </div>
        )}

        {/* Actions - Only show recording controls if no error */}
        <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-center gap-4">
                {!error && !isRecording && !audioBlob && (
                    <button 
                        onClick={startRecording}
                        className={cn(
                           "px-8 py-3 bg-[#A4B494] text-white rounded-full font-bold shadow hover:bg-[#8FA08F] transition-all flex items-center gap-2 ui-text text-xl",
                        )}
                    >
                        <Mic size={20} /> Record
                    </button>
                )}

                {isRecording && (
                    <button 
                        onClick={stopRecording}
                        className="px-8 py-3 bg-[#E6C9C9] text-white rounded-full font-bold shadow hover:bg-[#D5B0B0] transition-all flex items-center gap-2 ui-text text-xl"
                    >
                        <Square size={20} fill="currentColor" /> Stop
                    </button>
                )}

                {!isRecording && audioBlob && (
                    <>
                        <button 
                            onClick={() => { setAudioBlob(null); setDuration(0); }}
                            className="px-6 py-3 bg-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-400 ui-text text-xl"
                        >
                            Retry
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-8 py-3 bg-[#B5C0D0] text-white rounded-full font-bold shadow hover:bg-[#9EA9B9] transition-all flex items-center gap-2 ui-text text-xl"
                        >
                            <Save size={20} /> Save
                        </button>
                    </>
                )}
            </div>

            {/* Fallback Upload (When no error, but user wants to upload) */}
            {!error && !isRecording && !audioBlob && (
                <div className="w-full pt-4 border-t border-gray-300 mt-2 text-center">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-[#8E806A] font-bold flex items-center justify-center gap-2 hover:text-[#6D6D6D] mx-auto text-body italic"
                    >
                        <Upload size={14} /> Upload Tape
                    </button>
                </div>
            )}
        </div>

      </motion.div>
    </div>
  );
};