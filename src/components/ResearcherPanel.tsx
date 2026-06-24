import React, { useState, useRef } from "react";
import { PlusCircle, MapPin, ClipboardList, PenTool, Image, CheckCircle, Navigation, Anchor, Video, Trash2, X, AlertTriangle } from "lucide-react";
import { Observation, User } from "../types";

interface ResearcherPanelProps {
  onAddNewObservation: (obs: Omit<Observation, "id" | "sana" | "isApproved" | "isAIIdentified">) => void;
  onStartMapPick: () => void;
  pickedCoords: { lat: number; lng: number } | null;
  onNavigateToMap: () => void;
  currentUser?: User | null;
  onNavigateToTab?: (tab: any) => void;
}

export default function ResearcherPanel({
  onAddNewObservation,
  onStartMapPick,
  pickedCoords,
  onNavigateToMap,
  currentUser,
  onNavigateToTab
}: ResearcherPanelProps) {
  const [nomi, setNomi] = useState("");
  const [lotincha, setLotincha] = useState("");
  const [oila, setOila] = useState("");
  const [status, setStatus] = useState("2 (Kamayib borayotgan tur)");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [izoh, setIzoh] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Synchronize coordinates picked on the map click
  React.useEffect(() => {
    if (pickedCoords) {
      setLat(pickedCoords.lat.toString());
      setLng(pickedCoords.lng.toString());
    }
  }, [pickedCoords]);

  // Handle local image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setErrorMsg("");
      Array.from(files).forEach((file: File) => {
        if (!file.type.startsWith("image/")) {
          setErrorMsg("Faqat rasm formatidagi fayllarni yuklash mumkin.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle video upload under 10MB
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg("");
      if (!file.type.startsWith("video/")) {
        setErrorMsg("Faqat video formatidagi fayllarni yuklash mumkin.");
        return;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrorMsg("Faqat 10 MB dan kichik videolarni yuklash mumkin. Tanlangan fayl o'lchami juda katta.");
        return;
      }
      setVideoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoName(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nomi || !lat || !lng || !izoh) {
      setErrorMsg("Iltimos, nomi, GPS koordinatalari va kuzatuv izohini majburiy kiriting.");
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setErrorMsg("GPS koordinatalari son formatida bo'lishi shart.");
      return;
    }

    if (latitude < 37.0 || latitude > 45.6 || longitude < 56.0 || longitude > 73.0) {
      setErrorMsg("Kiritilgan GPS koordinatalari O'zbekiston chegarasida bo'lishi lozim (Lat: 37-45.6, Lng: 56-73).");
      return;
    }

    // Call state saver callback
    onAddNewObservation({
      nomi,
      lotincha_nomi: lotincha || undefined,
      oilasi: oila || "Lolasimonlar (Liliaceae)",
      status,
      image: images[0] || "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
      images: images.length > 0 ? images : undefined,
      video: video || undefined,
      kordinata: { lat: latitude, lng: longitude },
      izoh,
      tadqiqotchi: currentUser ? currentUser.fullname : "Mehmon Ekolog olim",
      userId: currentUser?.id
    });

    setSubmitted(true);
    // Reset Form
    setNomi("");
    setLotincha("");
    setOila("");
    setLat("");
    setLng("");
    setIzoh("");
    setImages([]);
    setVideo(null);
    setVideoName(null);

    // Redirect to show their newly added node on the map after some time
    setTimeout(() => {
      setSubmitted(false);
      onNavigateToMap();
    }, 2500);
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 flex flex-col items-center justify-center gap-6 text-center animate-fade-in bg-white border border-neutral-200 rounded-3xl p-8 my-8 shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center text-brand-primary shadow-xl border border-neutral-800 shrink-0">
          <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black text-neutral-900 tracking-tight leading-tight">
            Tizimga kirish talab etiladi
          </h2>
          <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto leading-relaxed font-semibold">
            Dala kuzatuvlarini qo'shish va monitoring ro'yxatiga kiritish uchun tizimda ro'yxatdan o'tishingiz yoki profilingizga kirishingiz lozim.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab && onNavigateToTab("profile")}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all scale-100 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>Ro‘yxatdan o‘tish / Kirish</span>
        </button>
      </div>
    );
  }

  return (
    <div id="researcher_report_form" className="w-full max-w-3xl mx-auto py-4">
      
      {submitted ? (
        <div className="bg-white rounded-3xl p-10 border border-neutral-200 text-center shadow-xl animate-fade-in flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-2">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-display text-neutral-900">Yangi topilma ro‘yxatga olindi!</h2>
          <p className="text-sm text-neutral-500 max-w-sm">
            Siz taqdim etgan o'simlik nuqtasi va rasm tahlili geofizik teleradarda ro'yxatdan o'tdi. Oynangiz hozir monitoring xaritasiga qaytmoqda...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-brand-primary shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">Tadqiqotchi monitoring paneli</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Dala sharoitida topilgan noyob yoki Qizil kitob o'simlik turlarini markaziy GIS teleradar tizimiga qayd etish shakli.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs mb-4 font-semibold border border-red-150">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Split layout: taxonomy and details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* O'zbekcha nomi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono">
                  O‘simlik nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Shrenk lolasi"
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-sm text-neutral-800 focus:outline-none focus:border-brand-primary"
                  value={nomi}
                  onChange={(e) => setNomi(e.target.value)}
                />
              </div>

              {/* Lotincha nomi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono">
                  Lotincha ilmiy nomi
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Tulipa schrenkii"
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-sm text-neutral-800 focus:outline-none focus:border-brand-primary"
                  value={lotincha}
                  onChange={(e) => setLotincha(e.target.value)}
                />
              </div>

              {/* Oila */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono">
                  Oila mansubligi
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Lolasimonlar (Liliaceae)"
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-sm text-neutral-800 focus:outline-none focus:border-brand-primary"
                  value={oila}
                  onChange={(e) => setOila(e.target.value)}
                />
              </div>

              {/* Qizil kitob statusi select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono">
                  Qizil kitob statusi
                </label>
                <select
                  className="bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-sm text-neutral-700 focus:outline-none focus:border-brand-primary"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="1 (Yo‘qolib borayotgan tur)">1 (Yo‘qolib borayotgan tur)</option>
                  <option value="2 (Kamayib borayotgan tur)">2 (Kamayib borayotgan tur)</option>
                  <option value="3 (Kamyob tur)">3 (Kamyob tur)</option>
                  <option value="Qizil kitobga kiritilmagan">Qizil kitobga kiritilmagan</option>
                </select>
              </div>

              {/* GPS Coordinates Pickers */}
              <div className="col-span-full border-t border-neutral-100 pt-5 mt-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
                    <MapPin className="w-4.5 h-4.5 text-amber-500" />
                    <span>GIS Koordinatalar (O‘zbekiston hududi) *</span>
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // onStartMapPick ichida setActiveTab("map") allaqachon chaqiriladi (App.tsx)
                      onStartMapPick();
                    }}
                    className="bg-amber-550/10 text-brand-secondary border border-amber-550/20 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 animate-pulse" />
                    <span>Xaritadan Bosib Tanlash</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      required
                      placeholder="Kenglik (Latitude) - masalan: 41.542"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-sm text-neutral-800 focus:outline-none focus:border-brand-primary"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      required
                      placeholder="Uzunlik (Longitude) - masalan: 69.914"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 text-sm text-neutral-800 focus:outline-none focus:border-brand-primary"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Comment / Observation note */}
              <div className="col-span-full flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono flex items-center gap-1">
                  <ClipboardList className="w-4 h-4 text-neutral-400" />
                  <span>Kuzatuv/Monitoring izohi *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Dala kuzatuvlari tafsiloti, atrofdagi ekologik muhit, o'simlik turg'unligi va muhofaza ko'rsatmalari..."
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl py-3 px-4 text-sm text-neutral-800 focus:outline-none focus:border-brand-primary resize-none"
                  value={izoh}
                  onChange={(e) => setIzoh(e.target.value)}
                />
              </div>

              {/* Multiple Images and Video uploads row */}
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-100 pt-5">
                
                {/* 1. Multiple Images Upload */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4 text-neutral-400" />
                      <span>Dala rasmlarini yuklash (Bir nechta, ixtiyoriy)</span>
                    </span>
                    {images.length > 0 && (
                      <span className="text-[10px] text-amber-500 font-bold">{images.length} rasm yuklandi</span>
                    )}
                  </span>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-200 hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer hover:bg-neutral-50/50 transition flex flex-col items-center justify-center gap-2 h-36"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <PlusCircle className="w-7 h-7 text-neutral-400" />
                      <p className="text-xs text-neutral-500 font-semibold">Rasmlarni tanlash uchun bosing</p>
                      <p className="text-[10px] text-neutral-400 font-mono">Bir yoki bir nechta JPG / PNG qo'shing</p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* Previews of uploaded images */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {images.map((imgSrc, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-50">
                          <img
                            src={imgSrc}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-1.5 right-1.5 bg-neutral-900/80 hover:bg-red-600 text-white p-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition duration-150"
                            title="Rasm o'chirish"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Video Upload (Less than 10MB) */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4 text-neutral-400" />
                      <span>Dala videosini yuklash (ixtiyoriy, &lt; 10MB)</span>
                    </span>
                    {video && (
                      <span className="text-[10px] text-emerald-500 font-bold">100% Tayyor</span>
                    )}
                  </span>

                  {video ? (
                    <div className="bg-neutral-900 rounded-2xl p-3 border border-neutral-800 flex flex-col gap-2 h-36 justify-between relative group overflow-hidden">
                      <video
                        src={video}
                        controls
                        className="w-full h-24 rounded-lg object-contain bg-neutral-950"
                      />
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1">
                        <span className="truncate max-w-[180px] font-mono">{videoName}</span>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="text-red-400 hover:text-red-300 font-extrabold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>O'chirish</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-200 hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer hover:bg-neutral-50/50 transition flex flex-col items-center justify-center gap-2 h-36"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <Video className="w-7 h-7 text-neutral-400" />
                        <p className="text-xs text-neutral-500 font-semibold">Videoni tanlash uchun bosing</p>
                        <p className="text-[10px] text-red-500 font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                          <span>Maksimum 10 MB gacha video</span>
                        </p>
                      </div>

                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Submit report button */}
            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-secondary text-neutral-900 py-4 rounded-2xl font-bold shadow-md hover:shadow-xl transition text-sm flex items-center justify-center gap-2 mt-2"
            >
              <PenTool className="w-5 h-5" />
              <span>Dala hisoboti nuqtasini tasdiqlash</span>
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
