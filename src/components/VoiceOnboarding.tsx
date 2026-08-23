"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage, Language } from "@/lib/translations";
import { Loader2, Mic, MicOff, Volume2, Square } from "lucide-react";

export function VoiceOnboarding({ artisanName, currentRoute }: { artisanName?: string, currentRoute?: string }) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [transcript, setTranscript] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Open automatically only if artisan profile exists but needs info (mocked logic for onboarding)
  // For demo, we leave it closed until clicked.

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioSubmission(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setIsOpen(true);
      setResponseMsg("");
      setTranscript("Listening...");
      stopPlaying();
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied or not available. Please allow mic permissions.");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setTranscript("Processing audio via Whisper...");
    }
  };

  const handleAudioSubmission = async (blob: Blob) => {
    setIsProcessing(true);
    
    // Convert blob to base64 so we can easily pass it to our API
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      
      try {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audio: base64Audio, 
            language, 
            artisanName, 
            currentRoute 
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          setTranscript(data.transcript);
          setResponseMsg(data.response);
          speakText(data.response);
        } else {
          setTranscript("Transcription failed.");
          setResponseMsg("Sorry, I could not understand the audio.");
        }
      } catch (e) {
        console.error(e);
        setTranscript("Network error.");
        setResponseMsg("Could not connect to the server.");
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    stopPlaying();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // We MUST use en-IN because Windows Desktop often lacks native Odia/Telugu voices.
    // By using en-IN, the Indian English voice can perfectly pronounce Romanized/Transliterated Odia or Hindi.
    utterance.lang = 'en-IN';
    
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN');
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopPlaying = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const getTipText = () => {
    if (language === 'hi') return 'यहां टैप करें और बोलें...';
    if (language === 'te') return 'ఇక్కడ నొక్కండి మరియు మాట్లాడండి...';
    if (language === 'or') return 'ଏଠାରେ ଟ୍ୟାପ୍ କରନ୍ତୁ ଏବଂ କୁହନ୍ତୁ...';
    return 'Tap here and speak...';
  };

  return (
    <>
      <button 
        onClick={() => isOpen ? setIsOpen(false) : setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-gradient-to-r from-primary to-green-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform animate-bounce"
      >
        <Mic size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden flex flex-col animate-fade-in-up">
          <div className="bg-[#0F2D20] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Mic size={16} className="text-green-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Karigari Assistant</h3>
                <p className="text-xs text-white/70">{language === 'or' ? 'ଓଡ଼ିଆ' : language === 'hi' ? 'हिंदी' : 'English'} Mode</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white"><Square size={16}/></button>
          </div>
          
          <div className="p-5 h-48 bg-gray-50 flex flex-col justify-end relative">
            <div className="space-y-4 max-h-full overflow-y-auto">
               {transcript && (
                 <div className="bg-white p-3 rounded-2xl rounded-tr-none text-sm text-gray-800 self-end shadow-sm border border-gray-100 w-11/12 ml-auto">
                   {transcript}
                 </div>
               )}
               
               {isProcessing && (
                 <div className="flex items-center gap-2 text-xs text-gray-400">
                   <Loader2 size={12} className="animate-spin" /> Processing via Whisper...
                 </div>
               )}

               {responseMsg && (
                 <div className="bg-[#E6F4EA] p-3 rounded-2xl rounded-tl-none text-sm text-[#0F2D20] self-start shadow-sm w-11/12">
                   {responseMsg}
                 </div>
               )}
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-center gap-4">
            {isListening ? (
              <button 
                onClick={stopListening}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md animate-pulse"
              >
                <Square size={20} fill="currentColor" />
              </button>
            ) : (
              <button 
                onClick={startListening}
                className="w-14 h-14 bg-[#1A4731] hover:bg-[#0F2D20] rounded-full flex items-center justify-center text-white shadow-md transition-colors"
              >
                <Mic size={24} />
              </button>
            )}

            {isPlaying && (
              <button 
                onClick={stopPlaying}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <Volume2 size={16} />
              </button>
            )}
          </div>
          
          {!isListening && !transcript && (
             <p className="text-center text-xs text-gray-400 pb-3 -mt-2">
               {getTipText()}
             </p>
          )}
        </div>
      )}
    </>
  );
}
