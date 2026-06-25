import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Cpu, CheckCircle2, ShieldAlert, Sparkles, MapPin, Eye, History, Trash2, X, Lock } from "lucide-react";
import { Observation, User } from "../types";

export interface ScanHistoryItem {
  id: string;
  nomi: string;
  lotincha_nomi: string;
  oilasi: string;
  status: string;
  hududi: string;
  tavsifi: string;
  o_xshashlik: number;
  kordinata: { lat: number; lng: number };
  image: string;
  sana: string;
}

interface AiScannerProps {
  onAddRecognizedObservation: (obs: Omit<Observation, "id" | "sana" | "isApproved">) => void;
  onNavigateToMap: () => void;
  currentUser: User | null;
  onNavigateToTab: (tab: any) => void;
}

const PREPARATION_FACTS = [
  "O‘zbekiston florasida o‘simliklarning 4500 dan ortiq turlari mavjud.",
  "Tizim hozirda Botanika instituti Qizil Kitobining so'nggi nashrini tahlil qilmoqda...",
  "O‘simliklar dori-darmon tarkibiga, populyatsiya areali teleradarga solishtirilmoqda.",
  "Ekologik xavfsiz monitoring uchun rasm sifati, yorug'lik g'oyat yuqori omil.",
  "Noyob turlarni skanerlashda GPS tahriri koordinatalarini avtomatik shakllantiramiz..."
];

export default function AiScanner({ 
  onAddRecognizedObservation, 
  onNavigateToMap,
  currentUser,
  onNavigateToTab
}: AiScannerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<{ nomi: string; lat: number; lng: number } | null>(null);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("ai_scan_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading scan history:", e);
      return [];
    }
  });

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setImagePreview(item.image);
    setResult({
      nomi: item.nomi,
      lotincha_nomi: item.lotincha_nomi,
      oilasi: item.oilasi,
      status: item.status,
      hududi: item.hududi,
      tavsifi: item.tavsifi,
      o_xshashlik: item.o_xshashlik,
      kordinata: item.kordinata
    });
    setErrorMsg(null);
    stopCamera();

    // Scroll to results or top of scanner
    setTimeout(() => {
      const element = document.getElementById("ai_scanner_results") || document.getElementById("ai_scanner_root");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem("ai_scan_history", JSON.stringify(updated));
      } catch (err) {
        console.error("Error saving scan history:", err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    setIsClearHistoryModalOpen(false);
    try {
      localStorage.removeItem("ai_scan_history");
    } catch (err) {
      console.error("Error clearing scan history:", err);
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Rotate interesting facts during loader
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % PREPARATION_FACTS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Clean stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // WebRTC Camera Management
  const startCamera = async () => {
    setErrorMsg(null);
    setResult(null);
    setImagePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      // Give details about manual fallback
      setErrorMsg("Kameraga ulanishning iloji bo'lmadi. Kamera ruxsatini yoqing yoki mahalliy fayl yuklash uslubidan foydalaning.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg");
        setImagePreview(base64Data);
        stopCamera();
      }
    }
  };

  // Drag and Drop File Upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readAndPreviewFile(file);
    }
  };

  const readAndPreviewFile = (file: File) => {
    setErrorMsg(null);
    setResult(null);
    stopCamera();
    
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Faqat rasm formatidagi fayllarni yuklash mumkin.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg("Faylni o'qishda xatolik yuz berdi.");
    };
    reader.readAsDataURL(file);
  };

  // Submit base64 to server API endpoint for Gemini analysis
  const analyzePlantImage = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: imagePreview
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Tahlil qilishda xatolik yuz berdi.");
      }

      const responseData = await response.json();
      setResult(responseData);

      // Save scanning success to history state & localStorage
      const newHistoryItem: ScanHistoryItem = {
        id: `scan-${Date.now()}`,
        nomi: responseData.nomi,
        lotincha_nomi: responseData.lotincha_nomi,
        oilasi: responseData.oilasi,
        status: responseData.status,
        hududi: responseData.hududi,
        tavsifi: responseData.tavsifi,
        o_xshashlik: responseData.o_xshashlik,
        kordinata: responseData.kordinata,
        image: imagePreview,
        sana: new Date().toLocaleDateString("uz-UZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setHistory(prev => {
        const updated = [newHistoryItem, ...prev];
        try {
          localStorage.setItem("ai_scan_history", JSON.stringify(updated));
        } catch (err) {
          console.error("Error setting scan history:", err);
        }
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ulanishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding identified discovery to map
  const handleAddToMap = () => {
    if (!result || !imagePreview) return;
    
    // Call props to append this observation
    onAddRecognizedObservation({
      nomi: result.nomi,
      lotincha_nomi: result.lotincha_nomi,
      oilasi: result.oilasi,
      status: result.status,
      image: imagePreview,
      kordinata: result.kordinata,
      izoh: `${result.tavsifi}\n\n[Sun'iy Intellekt va GIS Skaner tahlili. O'xshashlik: ${result.o_xshashlik}%]`,
      tadqiqotchi: "Mehmon tadqiqotchi (AI Skaner)",
      isAIIdentified: true
    });

    // Set custom success notification instead of alert
    setSuccessNotification({
      nomi: result.nomi,
      lat: result.kordinata.lat,
      lng: result.kordinata.lng
    });
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto py-10 sm:py-16 flex flex-col items-center justify-center gap-6 text-center animate-fade-in bg-white border border-neutral-200 rounded-[20px] p-6 sm:p-8 my-8 shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center text-brand-primary shadow-xl border border-neutral-800 shrink-0">
          <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-neutral-900 tracking-tight leading-tight">
            Tizimga kirish talab etiladi
          </h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto leading-relaxed font-semibold">
            Botanika AI skaneri va GIS tahlillaridan foydalanish uchun ro'yxatdan o'tishingiz lozim.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab("profile")}
          className="px-8 py-4 min-h-[56px] w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all scale-100 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Ro'yxatdan o'tish / Kirish</span>
        </button>
      </div>
    );
  }

  return (
    <div id="ai_scanner_root" className="w-full max-w-4xl mx-auto py-4 flex flex-col gap-4 sm:gap-6">
      
      {/* Introduction banner */}
      <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-brand-primary shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 flex items-center gap-2">
              <span>Botanika va GIS Sun'iy Intellekti</span>
              <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              O'simlik rasmini yuklang yoki kameradan oling. Sun'iy intellekt uning oilasi, Qizil kitob maqomi va yashash hududini aniqlab beradi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Scanner Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        
        {/* Left Side: Input Frame (Camera or Upload) */}
        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-neutral-200 shadow-sm flex flex-col justify-between min-h-[380px] sm:min-h-[460px]">
          <div>
            <h3 className="text-base font-bold text-neutral-800 mb-3 font-display">Tahlil Manbasini Tanlang</h3>
            
            {/* Error messaging */}
            {errorMsg && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-xs mb-4 flex items-start gap-2 border border-red-100">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Media Screen Area */}
            <div className="relative w-full h-[220px] sm:h-[280px] rounded-2xl bg-neutral-900 overflow-hidden flex items-center justify-center border border-neutral-800 mb-4">
              
              {/* Image Preview */}
              {imagePreview && !isCameraActive && (
                <img
                  src={imagePreview}
                  alt="Skaner kadr"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* WebRTC Video stream */}
              {isCameraActive && (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Placeholder text (Initial state) */}
              {!imagePreview && !isCameraActive && (
                <div className="text-center p-6 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-700">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-neutral-400 font-medium">Kameradan foydalaning yoki rasm faylini sudrab keling</p>
                  <p className="text-[10px] text-neutral-500 font-mono text-zinc-500">FORMATS: JPG, PNG, WEBP</p>
                </div>
              )}

              {/* Camera Active overlay capture button */}
              {isCameraActive && (
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-brand-primary hover:bg-brand-secondary text-neutral-900 border-4 border-white/30 rounded-full h-14 w-14 flex items-center justify-center shadow-2xl transition active:scale-90"
                >
                  <Eye className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Action controller buttons */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="w-full flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3.5 min-h-[48px] rounded-2xl font-semibold text-sm transition"
              >
                Kamerani o'chirish
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="w-full flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3.5 min-h-[48px] rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 border border-neutral-300"
              >
                <Camera className="w-4.5 h-4.5" />
                <span>Kamera</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 min-h-[48px] rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload className="w-4.5 h-4.5 text-brand-primary" />
              <span>Rasm yuklash</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Trigger analysis button when preview is active */}
          {imagePreview && !isCameraActive && (
            <button
              onClick={analyzePlantImage}
              disabled={isLoading}
              className="mt-4 w-full bg-brand-primary hover:bg-brand-secondary text-neutral-900 py-4 min-h-[52px] rounded-2xl font-bold transition shadow-md hover:shadow-xl text-sm flex items-center justify-center gap-2"
            >
              <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: isLoading ? '3s' : '0s' }} />
              <span>{isLoading ? "Qizil Kitob Tahlili Bormoqda..." : "Sun'iy Intellekt Bilan Aniqlash"}</span>
            </button>
          )}
        </div>

        {/* Right Side: Analysis Output / Informational Loader */}
        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-neutral-200 shadow-sm flex flex-col justify-center relative overflow-hidden min-h-[300px] sm:min-h-[460px]">

          
          {/* State 1: Loading view */}
          {isLoading && (
            <div className="flex flex-col items-center text-center p-6 gap-5 animate-fade-in">
              <div className="relative">
                {/* Double spin ring loader */}
                <div className="w-20 h-20 rounded-full border-4 border-yellow-100 border-t-amber-500 animate-spin" />
                <Sparkles className="w-7 h-7 text-brand-primary absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-neutral-800 font-display">Botanika AI Tizimi ishlamoqda</h4>
                <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-mono">Ma’lumotlar bazasi va koordinatalar qiyoslanmoqda...</p>
              </div>

              {/* Dynamic fun facts wrapper */}
              <div className="bg-neutral-50 px-5 py-4 rounded-2xl border border-neutral-100 max-w-sm mt-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-mono block mb-1">Botanika Instituti Tavsiyasi</span>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium transition duration-500">
                  "{PREPARATION_FACTS[factIndex]}"
                </p>
              </div>
            </div>
          )}

          {/* State 2: Result details display */}
          {result && !isLoading && (
            <div id="ai_scanner_results" className="flex flex-col gap-5 justify-between h-full w-full animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-secondary font-mono">
                    AI tahlil hisoboti
                  </span>
                  
                  {/* Gauge indicator matching percentage */}
                  <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-1 border border-amber-100 text-xs font-bold text-amber-600 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Ishonch: {result.o_xshashlik}%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-2xl font-display font-bold text-neutral-900 leading-tight">
                    {result.nomi}
                  </h3>
                  <p className="text-sm italic text-neutral-500 font-medium">{result.lotincha_nomi}</p>
                </div>

                {/* Sub taxonomy cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 block font-mono uppercase">Oila mansubligi</span>
                    <span className="text-xs font-bold text-neutral-700 block truncate">{result.oilasi}</span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 block font-mono uppercase">Qizil kitob statusi</span>
                    <span className={`text-xs font-bold block truncate ${
                      result.status.includes("Yo‘qo") || result.status.includes("1") ? "text-red-500" : "text-amber-600"
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 col-span-2">
                    <span className="text-[10px] text-neutral-400 block font-mono uppercase">O‘zbekistondagi tabiati (Areal)</span>
                    <span className="text-xs font-bold text-neutral-700 block">{result.hududi}</span>
                  </div>
                </div>

                {/* Brief analysis text */}
                <div className="mt-4">
                  <span className="text-[10px] text-neutral-400 block font-mono uppercase mb-1">Morfologik tavsif va nazorat</span>
                  <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                    {result.tavsifi}
                  </p>
                </div>
              </div>

              {/* Geo location recommendation overlay */}
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/50 flex gap-2.5 items-center mt-3 text-xs text-amber-800">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="font-mono">
                  <span className="font-bold">Tavsiya etilgan GIS nuqtasi: </span>
                  <span>{result.kordinata.lat}° N, {result.kordinata.lng}° E</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row">
                <button
                  onClick={handleAddToMap}
                  className="w-full flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-2xl font-semibold text-xs tracking-wide transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                  <span>Xaritaga joylash</span>
                </button>
              </div>
            </div>
          )}

          {/* State 3: Empty layout */}
          {!result && !isLoading && (
            <div className="text-center p-6 flex flex-col items-center gap-3">
              <Cpu className="w-12 h-12 text-neutral-300 mb-2" />
              <h4 className="text-base font-bold text-neutral-800 font-display">Tahlil hisoboti tayyor emas</h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Tizim AI tahlili qila olishi uchun chap tomondagi oynalar orqali o'simlik rasmini belgilang, so'ngra aniqlash tugmasini bosing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scan History Section */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-600 shrink-0" />
            <h3 className="text-base font-bold text-neutral-805 font-display">Skanerlash va AI Tahlillar Tarixi</h3>
            <span className="bg-neutral-100 text-neutral-600 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setIsClearHistoryModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition bg-red-50 hover:bg-red-100/70 px-3 py-1.5 rounded-xl border border-red-200/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tarixni tozalash</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 px-4 flex flex-col items-center gap-2 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-2xl">
            <History className="w-8 h-8 text-neutral-300 animate-pulse" />
            <p className="text-xs font-semibold text-neutral-700">Tahlillar tarixi bo'sh</p>
            <p className="text-[11px] text-neutral-400 max-w-xs leading-relaxed">
              Rasmlar muvaffaqiyatli tahlil qilinganda tahlillar tarixidan avtomatik joy oladi va bu yerda saqlanadi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistoryItem(item)}
                className="group flex gap-3.5 p-3.5 rounded-2xl border border-neutral-200/80 hover:bg-amber-50/10 hover:border-amber-400/40 transition cursor-pointer text-left bg-white items-start relative select-none"
              >
                {/* Image element */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200/60 shadow-inner">
                  <img
                    src={item.image}
                    alt={item.nomi}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-bold text-neutral-800 text-xs truncate group-hover:text-amber-600 transition-colors duration-200">
                      {item.nomi}
                    </h4>
                    {item.lotincha_nomi && (
                      <p className="text-[10px] italic text-neutral-400 font-medium truncate mt-0.5">
                        {item.lotincha_nomi}
                      </p>
                    )}
                    <p className="text-[9.5px] text-neutral-500 font-semibold truncate mt-0.5 font-mono uppercase">
                      {item.oilasi || "Oila toifasiz"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      <span>{item.o_xshashlik}%</span>
                    </span>

                    {item.status && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        item.status.includes("Yo‘qo") || item.status.includes("1")
                          ? "bg-red-50 text-red-600 border border-red-150"
                          : "bg-amber-50 text-amber-600 border border-amber-150"
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side controls & date stamp */}
                <div className="flex flex-col justify-between h-full items-end shrink-0 gap-4">
                  <span className="text-[9px] text-neutral-400 font-mono font-semibold block">
                    {item.sana}
                  </span>

                  <button
                    onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                    className="p-1 px-1.5 rounded-lg bg-neutral-50 hover:bg-red-50 hover:text-red-600 border border-neutral-200/60 hover:border-red-200 text-neutral-400 transition duration-150"
                    title="Tarixdan o'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beautiful Custom Success Notification Modal */}
      {successNotification && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[3000] animate-fade-in animate-duration-100">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-neutral-900">Muvaffaqiyatli Qo'shildi!</h3>
              <p className="text-xs text-neutral-500 mt-2">
                <strong>"{successNotification.nomi}"</strong> o'simligi o'z koordinatalari (lat: {successNotification.lat}, lng: {successNotification.lng}) bilan GIS monitoring tizimiga muvaffaqiyatli kiritildi.
              </p>
            </div>
            <button
              onClick={() => {
                setSuccessNotification(null);
                onNavigateToMap();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition duration-200"
            >
              Ok, Xarita Bo'limiga Yo'nalish
            </button>
          </div>
        </div>
      )}

      {isClearHistoryModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[3000] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-display font-black text-neutral-900">Tahlil tarixini tozalash</h3>
                <p className="text-xs text-neutral-500 mt-2">
                  Barcha AI skaner natijalari tarixdan o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
                </p>
              </div>
              <button
                onClick={() => setIsClearHistoryModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition"
                title="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsClearHistoryModalOpen(false)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-bold text-xs transition shadow-sm"
              >
                Tozalash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
