import React, { useState } from "react";
import AuthPage from "./AuthPage";
import { 
  User as UserIcon, 
  UserPlus, 
  LogOut, 
  Trash2, 
  Edit, 
  Award, 
  MapPin, 
  Calendar, 
  Heart, 
  FileText, 
  Briefcase, 
  Mail, 
  Sparkles, 
  CheckCircle,
  Eye,
  Plus,
  Compass,
  BookOpen,
  Cpu,
  BarChart,
  Settings,
  Bell,
  Lock,
  Unlock,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Download,
  UploadCloud
} from "lucide-react";
import { User, Observation, PdfDocument, NewsArticle } from "../types";

interface UserProfileProps {
  currentUser: User | null;
  allUsers: User[];
  onRegister: (newUser: Omit<User, "id" | "registeredAt">) => void;
  onLogin: (userId: string) => void;
  onAuthenticated: (user: User) => void;
  onLogout: () => void;
  observations: Observation[];
  onDeleteObservation: (obsId: string) => void;
  onEditObservation: (obsId: string, updatedData: Partial<Observation>) => void;
  onNavigateToTab: (tab: "home" | "map" | "database" | "scanner" | "stats" | "researcher") => void;
  documents: PdfDocument[];
  onDeleteDocument: (docId: string) => void;
  news: NewsArticle[];
  onDeleteNews: (articleId: string) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
];

const SPECIALTY_OPTIONS = [
  "Botanika va Taksonomiya",
  "Ekologiya va Geografik Axborot Tizimlari (GIS)",
  "Dorivor O'simliklar Biokimyosi",
  "Tabiatni Muhofaza qilish va Ekolog",
  "Tabiat havaskori va Ekologik Volontyor"
];

const ORGANIZATION_OPTIONS = [
  "O'zbekiston Fanlar akademiyasi Botanika instituti",
  "Toshkent Davlat Agrar Universiteti",
  "Ekologiya va atrof-muhitni muhofaza qilish davlat qo'mitasi",
  "O'zbekiston Milliy Universiteti, Biologiya fakulteti",
  "Mustaqil tadqiqotlar va yosh botaniklar ittifoqi"
];

export default function UserProfile({
  currentUser,
  allUsers,
  onRegister,
  onLogin,
  onAuthenticated,
  onLogout,
  observations,
  onDeleteObservation,
  onEditObservation,
  onNavigateToTab,
  documents,
  onDeleteDocument,
  news,
  onDeleteNews
}: UserProfileProps) {
  const [subTab, setSubTab] = useState<"finding" | "pdf" | "news" | "settings" | "achievements" | "notifications">("finding");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [registerStep, setRegisterStep] = useState(1);
  
  // Registration Form State
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState(ORGANIZATION_OPTIONS[0]);
  const [specialty, setSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Profile Settings Form State
  const [settingsFullname, setSettingsFullname] = useState(currentUser?.fullname || "");
  const [settingsEmail, setSettingsEmail] = useState(currentUser?.email || "");
  const [settingsOrganization, setSettingsOrganization] = useState(currentUser?.organization || "");
  const [settingsSpecialty, setSettingsSpecialty] = useState(currentUser?.specialty || "");
  const [settingsBio, setSettingsBio] = useState(currentUser?.bio || "");
  const [settingsAvatarUrl, setSettingsAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0]);
  const [settingsCustomAvatar, setSettingsCustomAvatar] = useState("");

  React.useEffect(() => {
    if (currentUser) {
      setSettingsFullname(currentUser.fullname);
      setSettingsEmail(currentUser.email);
      setSettingsOrganization(currentUser.organization);
      setSettingsSpecialty(currentUser.specialty);
      setSettingsBio(currentUser.bio || "");
      setSettingsAvatarUrl(currentUser.avatarUrl || PRESET_AVATARS[0]);
    }
  }, [currentUser]);


  // Edit Observation Form State
  const [editingObsId, setEditingObsId] = useState<string | null>(null);
  const [editNomi, setEditNomi] = useState("");
  const [editLotincha, setEditLotincha] = useState("");
  const [editOilasi, setEditOilasi] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editIzoh, setEditIzoh] = useState("");
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");

  const [profileToast, setProfileToast] = useState<string | null>(null);
  const [profileToastType, setProfileToastType] = useState<"info" | "error" | "success">("info");
  const [pendingDeleteObs, setPendingDeleteObs] = useState<Observation | null>(null);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<PdfDocument | null>(null);
  const [pendingDeleteNews, setPendingDeleteNews] = useState<NewsArticle | null>(null);

  const userObservations = currentUser 
    ? observations.filter(o => o.userId === currentUser.id || o.tadqiqotchi === currentUser.fullname)
    : [];

  const userDocuments = currentUser
    ? documents.filter(d => d.userId === currentUser.id || d.author.toLowerCase().includes(currentUser.fullname.toLowerCase()))
    : [];

  const userNews = currentUser
    ? news.filter(n => n.userId === currentUser.id)
    : [];

  // Dynamic Achievements List
  const achievementsList = [
    {
      id: "field_explorer",
      name: "Dala kashfiyotchisi",
      desc: "Tabiat qo'ynida ilk dala monitoring kuzatuvini muvaffaqiyatli ro'yxatga olgan tadqiqotchi.",
      req: "Kamida 1 ta dala kuzatuvi yuborilganda ochiladi",
      unlocked: userObservations.length >= 1,
      progressText: `${Math.min(userObservations.length, 1)} / 1 topilma`,
      icon: Compass,
      colorClass: "from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600",
      badgeBg: "bg-amber-500/20 text-amber-700"
    },
    {
      id: "expert_botanist",
      name: "Tajribali botanik",
      desc: "Ekologik bioxilma-xillikni o'rganishda faol ishtirok etib, ko'plab o'simliklarni hisobot qilgan ekspert.",
      req: "Kamida 5 ta dala kuzatuvi yuborilganda ochiladi",
      unlocked: userObservations.length >= 5,
      progressText: `${Math.min(userObservations.length, 5)} / 5 topilma`,
      icon: Award,
      colorClass: "from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-600",
      badgeBg: "bg-blue-500/20 text-blue-700"
    },
    {
      id: "digital_ecologist",
      name: "Raqamli ekolog",
      desc: "Zamonaviy sun'iy intellekt (AI) texnologiyalaridan foydalanib o'simlik turlarini skanerdan o'tkazgan yangilikchi.",
      req: "AI Skaner laboratoriyasi yordamida o'simlikni aniqlang",
      unlocked: userObservations.some(o => o.isAIIdentified),
      progressText: userObservations.some(o => o.isAIIdentified) ? "Muvaffaqiyatli aniqlangan" : "Hali ishlatilmagan",
      icon: Cpu,
      colorClass: "from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-600",
      badgeBg: "bg-purple-500/20 text-purple-700"
    },
    {
      id: "scientific_contributor",
      name: "Ilmiy hamkor",
      desc: "BIOMap ochiq kutubxonasiga ilmiy maqola yoki dala qo'llanmalarini yuklab, ilm-fan rivojiga hissa qo'shgan olim.",
      req: "Kutubxonaga kamida 1 ta ilmiy PDF hujjat yuklaganda ochiladi",
      unlocked: userDocuments.length >= 1,
      progressText: `${Math.min(userDocuments.length, 1)} / 1 hujjat`,
      icon: BookOpen,
      colorClass: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600",
      badgeBg: "bg-emerald-500/20 text-emerald-700"
    },
    {
      id: "red_book_guardian",
      name: "Qizil kitob qo'riqchisi",
      desc: "O'zbekiston Qizil kitobiga kiritilgan o'ta noyob va yo'qolib borayotgan o'simlik turini hududda aniqlab, xaritaga kiritgan himoyachi.",
      req: "Yo'qolib borayotgan (1-toifali) o'simlikni ro'yxatga oling",
      unlocked: userObservations.some(o => o.status?.includes("1") || o.status?.toLowerCase().includes("yo‘qol") || o.status?.toLowerCase().includes("yo'qol")),
      progressText: userObservations.some(o => o.status?.includes("1") || o.status?.toLowerCase().includes("yo‘qol") || o.status?.toLowerCase().includes("yo'qol")) ? "Topildi va xaritaga kiritildi" : "Hali topilmadi",
      icon: ShieldCheck,
      colorClass: "from-rose-500/10 to-red-500/10 border-rose-500/30 text-rose-650",
      badgeBg: "bg-rose-500/20 text-rose-700"
    }
  ];

  // Dynamic Notifications List
  const notificationsList = (() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      date: string;
      type: "info" | "success" | "warning";
    }> = [];

    // 1. Welcome Message
    list.push({
      id: "welcome",
      title: "BIOMap tizimiga xush kelibsiz!",
      message: "BIOMap ekologik monitoring va o'simliklarni xaritalash platformasiga muvaffaqiyatli ulandingiz! O'simliklar hisobotlarini kiriting va ilmiy kutubxonaga materiallar qo'shing.",
      date: currentUser?.registeredAt || "Tizimga ulanilgan vaqt",
      type: "info"
    });

    // 2. Observation based notifications
    userObservations.forEach(obs => {
      if (obs.isApproved) {
        list.push({
          id: `approved-${obs.id}`,
          title: "Topilma tasdiqlandi va GIS xaritaga joylandi",
          message: `Siz yuborgan "${obs.nomi}" (${obs.lotincha_nomi || "Lotincha nomi yozilmagan"}) topilmasi adminlar tomonidan tekshirildi hamda muvaffaqiyatli tasdiqlandi.`,
          date: obs.sana,
          type: "success"
        });
      } else {
        list.push({
          id: `pending-${obs.id}`,
          title: "Topilma tekshirilmoqda (Kutish jarayonida)",
          message: `Siz yuborgan "${obs.nomi}" hisoboti tizimga qabul qilindi va hozirda tekshirish jarayonida. Tasdiqlangach, GIS xaritasida barcha foydalanuvchilarga ko'rinadi.`,
          date: obs.sana,
          type: "warning"
        });
      }
    });

    return list.reverse();
  })();

  const validateRegisterStep = (step: number) => {
    setRegError("");

    if (step === 1) {
      if (!fullname.trim() || !email.trim()) {
        setRegError("Ism-sharif va elektron pochta manzilini kiriting.");
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        setRegError("Elektron pochta manzili to'g'ri formatda bo'lishi kerak.");
        return false;
      }

      if (allUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setRegError("Ushbu elektron pochta manzili allaqachon ro'yxatdan o'tgan.");
        return false;
      }
    }

    return true;
  };

  const handleRegisterNext = () => {
    if (!validateRegisterStep(registerStep)) return;
    setRegisterStep(prev => Math.min(prev + 1, 3));
  };

  const handleRegisterBack = () => {
    setRegError("");
    setRegisterStep(prev => Math.max(prev - 1, 1));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!validateRegisterStep(1)) {
      return;
    }

    onRegister({
      fullname: fullname.trim(),
      email: email.trim(),
      organization,
      specialty,
      bio: bio.trim() || undefined,
      avatarUrl: customAvatarInput.trim() || avatarUrl
    });

    setRegSuccess(true);
    // Reset Form
    setFullname("");
    setEmail("");
    setBio("");
    setCustomAvatarInput("");
    setRegisterStep(1);

    setTimeout(() => {
      setRegSuccess(false);
    }, 3000);
  };

  const handleStartEdit = (obs: Observation) => {
    setEditingObsId(obs.id);
    setEditNomi(obs.nomi);
    setEditLotincha(obs.lotincha_nomi || "");
    setEditOilasi(obs.oilasi || "");
    setEditStatus(obs.status || "2 (Kamayib borayotgan tur)");
    setEditIzoh(obs.izoh);
    setEditLat(obs.kordinata?.lat?.toString() || "");
    setEditLng(obs.kordinata?.lng?.toString() || "");
  };

  const handleSaveEdit = (obsId: string) => {
    if (!editNomi.trim() || !editIzoh.trim()) {
      setProfileToast("Nomi va izoh maydonlari bo'sh bo'lishi mumkin emas.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 4000);
      return;
    }

    const latitude = parseFloat(editLat);
    const longitude = parseFloat(editLng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setProfileToast("GPS koordinatalari son formatida bo'lishi shart.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 4000);
      return;
    }

    if (latitude < 37.0 || latitude > 45.6 || longitude < 56.0 || longitude > 73.0) {
      setProfileToast("GPS koordinatalari O'zbekiston chegarasida bo'lishi lozim (Lat: 37-45.6, Lng: 56-73).");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 4000);
      return;
    }

    onEditObservation(obsId, {
      nomi: editNomi.trim(),
      lotincha_nomi: editLotincha.trim() || undefined,
      oilasi: editOilasi.trim() || undefined,
      status: editStatus,
      izoh: editIzoh.trim(),
      kordinata: { lat: latitude, lng: longitude }
    });
    setEditingObsId(null);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileToast("Rasm hajmi 2MB dan oshmasligi kerak.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSettingsCustomAvatar(base64Data);
      setSettingsAvatarUrl(base64Data);
      setProfileToast("Rasm muvaffaqiyatli yuklandi!");
      setProfileToastType("success");
      setTimeout(() => setProfileToast(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsFullname.trim()) {
      setProfileToast("Ism-sharif maydoni bo'sh bo'lishi mumkin emas.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 3000);
      return;
    }

    if (!settingsEmail.trim() || !/^\S+@\S+\.\S+$/.test(settingsEmail.trim())) {
      setProfileToast("Elektron pochta manzili noto'g'ri formatda.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 3000);
      return;
    }

    if (!currentUser) return;

    if (allUsers.some(u => u.email.toLowerCase() === settingsEmail.trim().toLowerCase() && u.id !== currentUser.id)) {
      setProfileToast("Ushbu elektron pochta manzili boshqa foydalanuvchi tomonidan ishlatilmoqda.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 3000);
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      fullname: settingsFullname.trim(),
      email: settingsEmail.trim(),
      organization: settingsOrganization,
      specialty: settingsSpecialty,
      bio: settingsBio.trim() || undefined,
      avatarUrl: settingsCustomAvatar.trim() || settingsAvatarUrl
    };

    onAuthenticated(updatedUser);
    setProfileToast("Profil sozlamalari muvaffaqiyatli saqlandi!");
    setProfileToastType("success");
    setTimeout(() => setProfileToast(null), 3000);
    
    // Set subTab back to finding after save
    setSubTab("finding");
  };

  const handleExportCSV = () => {
    if (userObservations.length === 0) {
      setProfileToast("Eksport qilish uchun hech qanday kuzatuv topilmadi.");
      setProfileToastType("error");
      setTimeout(() => setProfileToast(null), 3000);
      return;
    }

    // Define CSV headers
    const headers = ["ID", "O'simlik nomi", "Lotincha nomi", "Oilasi", "Status", "Kenglik (Lat)", "Uzunlik (Lng)", "Sana", "Izoh", "Tadqiqotchi", "AI aniqlagan", "Tasdiqlangan"];
    
    // Convert observations to CSV rows
    const csvRows = [
      headers.join(","), // header row
      ...userObservations.map(obs => {
        const row = [
          obs.id,
          `"${obs.nomi.replace(/"/g, '""')}"`,
          `"${(obs.lotincha_nomi || "").replace(/"/g, '""')}"`,
          `"${(obs.oilasi || "").replace(/"/g, '""')}"`,
          `"${(obs.status || "").replace(/"/g, '""')}"`,
          obs.kordinata.lat,
          obs.kordinata.lng,
          obs.sana,
          `"${obs.izoh.replace(/"/g, '""')}"`,
          `"${obs.tadqiqotchi.replace(/"/g, '""')}"`,
          obs.isAIIdentified ? "Ha" : "Yo'q",
          obs.isApproved ? "Ha" : "Yo'q"
        ];
        return row.join(",");
      })
    ];

    // Create CSV string with UTF-8 BOM
    const csvString = "\ufeff" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `biomap_observations_${currentUser?.fullname.replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setProfileToast("CSV fayli yuklab olindi.");
    setProfileToastType("success");
    setTimeout(() => setProfileToast(null), 3000);
  };


  return (
    <div id="user_profile_container" className="w-full max-w-7xl mx-auto py-4 flex flex-col gap-8 animate-fade-in">
      
      {/* Title block */}
      <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 flex items-center gap-2">
              <span>Tadqiqotchi Akkauntlari va Profili</span>
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              O'simliklar hisobotlarini shaxsiy akkauntingiz ostida monitoring qiling.
            </p>
          </div>
        </div>
      </div>

      {currentUser ? (
        /* ==================== ACTIVE USER DASHBOARD ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-stretch">
          
          {/* Left panel: Bio information & quick actions */}
          <div className="lg:col-span-4 bg-white rounded-[20px] p-4 sm:p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-6">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 pb-5 border-b border-neutral-100">
                <div className="relative group shrink-0">
                  <img
                    src={currentUser.avatarUrl || PRESET_AVATARS[0]}
                    alt={currentUser.fullname}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/20 shadow-md group-hover:scale-105 transition duration-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 p-1 rounded-lg border border-white shadow">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-display font-extrabold text-neutral-900 truncate leading-tight">
                    {currentUser.fullname}
                  </h3>
                  <span className="text-[10px] font-bold text-neutral-450 block truncate mt-0.5 uppercase tracking-wide">
                    {currentUser.specialty}
                  </span>
                  <span className="text-[9.5px] text-neutral-400 block truncate mt-0.5 font-mono">
                    {currentUser.organization.split(",")[0]}
                  </span>
                </div>
              </div>

              {/* Interactive Dashboard Menu */}
              <div>
                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest font-mono block mb-2">
                  Shaxsiy kabinet bo‘limlari
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSubTab("finding")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      subTab === "finding"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-800 font-extrabold"
                        : "bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className={`w-4 h-4 ${subTab === "finding" ? "text-amber-500 animate-pulse" : "text-neutral-400"}`} />
                      <span>Dala topilmalaringiz</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      subTab === "finding" ? "bg-amber-500/20 text-amber-700" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {userObservations.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubTab("pdf")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      subTab === "pdf"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 font-extrabold"
                        : "bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${subTab === "pdf" ? "text-emerald-500" : "text-neutral-400"}`} />
                      <span>Kutubxona hujjatlaringiz</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      subTab === "pdf" ? "bg-emerald-500/20 text-emerald-700" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {userDocuments.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubTab("news")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      subTab === "news"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-800 font-extrabold"
                        : "bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className={`w-4 h-4 ${subTab === "news" ? "text-amber-500" : "text-neutral-400"}`} />
                      <span>Maqolalaringiz (Yangilik)</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      subTab === "news" ? "bg-amber-500/20 text-amber-700" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {userNews.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubTab("achievements")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      subTab === "achievements"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-800 font-extrabold"
                        : "bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Award className={`w-4 h-4 ${subTab === "achievements" ? "text-blue-500" : "text-neutral-400"}`} />
                      <span>Erishilgan yutuqlar</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      Badge
                    </span>
                  </button>

                  <button
                    onClick={() => setSubTab("notifications")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      subTab === "notifications"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-800 font-extrabold"
                        : "bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell className={`w-4 h-4 ${subTab === "notifications" ? "text-rose-500 animate-bounce" : "text-neutral-400"}`} />
                      <span>Bildirishnomalar</span>
                    </div>
                    {userObservations.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-505" />
                    )}
                  </button>

                  <button
                    onClick={() => setSubTab("settings")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      subTab === "settings"
                        ? "bg-neutral-200/50 border-neutral-400/50 text-neutral-900 font-extrabold"
                        : "bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className={`w-4 h-4 ${subTab === "settings" ? "text-neutral-700 animate-spin" : "text-neutral-400"}`} style={{ animationDuration: subTab === "settings" ? "10s" : "0s" }} />
                      <span>Profil sozlamalari</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/50 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 text-xs font-semibold transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Topilmalarni CSV eksport</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Navigation Menu */}
              <div>
                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest font-mono block mb-2">
                  Tizim bo‘limlari navigatsiyasi
                </span>
                <div className="flex flex-col gap-1 border border-neutral-150 rounded-2xl p-1.5 bg-neutral-50/50">
                  <button
                    onClick={() => onNavigateToTab("map")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm border-l-4 border-transparent hover:border-amber-500 pl-3 hover:pl-3.5 transition-all duration-200 text-left"
                  >
                    <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>GIS Xarita monitoringi</span>
                  </button>

                  <button
                    onClick={() => onNavigateToTab("database")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm border-l-4 border-transparent hover:border-amber-500 pl-3 hover:pl-3.5 transition-all duration-200 text-left"
                  >
                    <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>O‘simliklar katalogi</span>
                  </button>

                  <button
                    onClick={() => onNavigateToTab("scanner")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm border-l-4 border-transparent hover:border-amber-500 pl-3 hover:pl-3.5 transition-all duration-200 text-left"
                  >
                    <Cpu className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                    <span>AI Skaner laboratoriyasi</span>
                  </button>

                  <button
                    onClick={() => onNavigateToTab("researcher")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm border-l-4 border-transparent hover:border-amber-500 pl-3 hover:pl-3.5 transition-all duration-200 text-left"
                  >
                    <Plus className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Yangi kuzatuv joylash</span>
                  </button>

                  <button
                    onClick={() => onNavigateToTab("stats")}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm border-l-4 border-transparent hover:border-amber-500 pl-3 hover:pl-3.5 transition-all duration-200 text-left"
                  >
                    <BarChart className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Statistika & Tahlil paneli</span>
                  </button>
                </div>
              </div>

              {/* Bio & Details Section */}
              {currentUser.bio && (
                <div className="border-t border-neutral-100 pt-4">
                  <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest font-mono block mb-1">
                    Ilmiy biografiya
                  </span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed italic bg-neutral-50 p-3 rounded-xl border border-neutral-100/50">
                    "{currentUser.bio}"
                  </p>
                </div>
              )}

            </div>

            {/* Logout button */}
            <div className="pt-4 border-t border-neutral-100">
              <button
                onClick={onLogout}
                className="w-full bg-neutral-100 hover:bg-red-50 hover:text-red-650 hover:border-red-200/50 text-neutral-600 font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 border border-neutral-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Tizimdan chiqish</span>
              </button>
            </div>
          </div>          {/* Right panel: Registered plants list & interactive management */}
          <div className="lg:col-span-8 bg-white rounded-[20px] p-4 sm:p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between min-h-[400px] sm:min-h-[500px]">
            <div>
              {/* Section Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-100">
                <h3 className="text-lg font-display font-extrabold text-neutral-900 flex items-center gap-2">
                  {subTab === "finding" && (
                    <>
                      <Heart className="w-5 h-5 text-amber-500 animate-pulse" />
                      <span>Dala Topilmalari ({userObservations.length})</span>
                    </>
                  )}
                  {subTab === "pdf" && (
                    <>
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <span>Ilmiy Hujjatlaringiz ({userDocuments.length})</span>
                    </>
                  )}
                  {subTab === "news" && (
                    <>
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <span>Maqolalaringiz ({userNews.length})</span>
                    </>
                  )}
                  {subTab === "settings" && (
                    <>
                      <Settings className="w-5 h-5 text-neutral-700 animate-spin" style={{ animationDuration: "10s" }} />
                      <span>Profil Sozlamalari</span>
                    </>
                  )}
                  {subTab === "achievements" && (
                    <>
                      <Award className="w-5 h-5 text-blue-500" />
                      <span>Erishilgan Yutuqlar va Nishonlar</span>
                    </>
                  )}
                  {subTab === "notifications" && (
                    <>
                      <Bell className="w-5 h-5 text-rose-500 animate-bounce" />
                      <span>Bildirishnomalar logi</span>
                    </>
                  )}
                </h3>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-lg">
                  Profil Ma'lumotlari
                </span>
              </div>

              {subTab === "finding" && (
                /* ==================== SUBTAB: FIELD OBSERVATIONS ==================== */
                userObservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-750">Sizda hali qo'shilgan topilmalar yo'q</h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                      "AI Skaner" orqali o'simlikni aniqlab yoxud "Kuzatuv qo'shish" formasini to'ldirib, o'z monitoring ro'yxatlarini boshlang.
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => onNavigateToTab("scanner")}
                        className="bg-neutral-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition"
                      >
                        AI Skaner
                      </button>
                      <button
                        onClick={() => onNavigateToTab("researcher")}
                        className="bg-amber-500 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-600 transition"
                      >
                        Dala hisoboti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {userObservations.map((obs) => {
                      const isEditing = editingObsId === obs.id;

                      return (
                        <div
                          key={obs.id}
                          className="p-4 rounded-2.5xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/5 transition flex flex-col md:flex-row gap-4 items-start"
                        >
                          {/* Plant Picture Preview */}
                          <img
                            src={obs.image}
                            alt={obs.nomi}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-neutral-200 shadow-sm"
                            referrerPolicy="no-referrer"
                          />

                          {/* Plant Core Metadata and Form Edit state toggler */}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex flex-col gap-3 py-1">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Bosh Nomi</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5 font-bold"
                                      value={editNomi}
                                      onChange={(e) => setEditNomi(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Lotincha nomi</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5 italic"
                                      value={editLotincha}
                                      onChange={(e) => setEditLotincha(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Oila toifasi</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5"
                                      value={editOilasi}
                                      onChange={(e) => setEditOilasi(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Qizil kitob statusi</label>
                                    <select
                                      className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5"
                                      value={editStatus}
                                      onChange={(e) => setEditStatus(e.target.value)}
                                    >
                                      <option value="1 (Yo‘qolib borayotgan tur)">1 (Yo‘qolib borayotgan tur)</option>
                                      <option value="2 (Kamayib borayotgan tur)">2 (Kamayib borayotgan tur)</option>
                                      <option value="3 (Kamyob tur)">3 (Kamyob tur)</option>
                                      <option value="Qizil kitobga kiritilmagan">Qizil kitobga kiritilmagan</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Kenglik (Latitude)</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5 font-mono"
                                      value={editLat}
                                      onChange={(e) => setEditLat(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Uzunlik (Longitude)</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5 font-mono"
                                      value={editLng}
                                      onChange={(e) => setEditLng(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Izoh / Tahlil matni</label>
                                  <textarea
                                    rows={2}
                                    className="w-full bg-white border border-neutral-250 rounded-lg text-xs p-1.5 resize-none"
                                    value={editIzoh}
                                    onChange={(e) => setEditIzoh(e.target.value)}
                                  />
                                </div>

                                <div className="flex gap-2.5 mt-1 justify-end">
                                  <button
                                    onClick={() => setEditingObsId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold font-mono"
                                  >
                                    Bekor qilish
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(obs.id)}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold font-mono"
                                  >
                                    Saqlash
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col h-full justify-between">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-neutral-900">{obs.nomi}</span>
                                    {obs.lotincha_nomi && (
                                      <span className="text-xs italic text-neutral-400 font-medium">({obs.lotincha_nomi})</span>
                                    )}
                                    {obs.status && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        obs.status.includes("1") || obs.status.includes("Yo‘qo")
                                          ? "bg-red-50 text-red-500 border border-red-100"
                                          : "bg-amber-50 text-amber-600 border border-amber-100"
                                      }`}>
                                        {obs.status}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-neutral-400 font-mono uppercase block mt-1">
                                    Oila: {obs.oilasi || "Aniqlanmagan"} • Joylashuvi: {obs.kordinata.lat}° N, {obs.kordinata.lng}° E
                                  </span>
                                  <p className="text-xs text-neutral-600 leading-relaxed mt-2 line-clamp-3">
                                    {obs.izoh}
                                  </p>

                                  {/* Multi image thumbnails */}
                                  {obs.images && obs.images.length > 1 && (
                                    <div className="flex gap-1.5 mt-2 overflow-x-auto py-1">
                                      {obs.images.map((src, i) => (
                                        <a
                                          key={i}
                                          href={src}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 shrink-0 hover:border-amber-500 transition shadow-sm"
                                        >
                                          <img src={src} className="w-full h-full object-cover" alt="Galeriyadan rasm" referrerPolicy="no-referrer" />
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  {/* Video Player */}
                                  {obs.video && (
                                    <div className="mt-2.5 max-w-sm">
                                      <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold font-mono block mb-1">
                                        Tasdiqlovchi video havola:
                                      </span>
                                      <div className="bg-neutral-900 rounded-xl p-1.5 border border-neutral-800">
                                        <video
                                          src={obs.video}
                                          controls
                                          preload="metadata"
                                          className="w-full max-h-36 rounded-lg object-contain bg-black"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Control Buttons for the researcher observation */}
                                <div className="flex gap-3 items-center justify-between mt-3 pt-3 border-t border-neutral-100/50">
                                  <div className="flex gap-2 items-center text-[10px] text-neutral-450 font-mono">
                                    <span>{obs.sana}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-neutral-500 uppercase">
                                      {obs.isAIIdentified ? "AI Aniqlagan" : "Dala jurnali"}
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleStartEdit(obs)}
                                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition"
                                      title="Tahrirlash"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setPendingDeleteObs(obs)}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition"
                                      title="O'chirish"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {subTab === "pdf" && (
                /* ==================== SUBTAB: SCIENTIFIC DOCUMENTS ==================== */
                userDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-750">Siz yuklagan ilmiy hujjatlar yo'q</h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                      Kutubxona bo'limiga o'tib, PDF formatidagi qo'llanma, kitob yoki dala tadqiqot hisobotini yuklang. Ular profilingizda shu yerda guruhlanadi.
                    </p>
                    <button
                      onClick={() => onNavigateToTab("home")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition mt-4"
                    >
                      Kutubxonani ochish
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {userDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2.5xl border border-neutral-200 hover:border-emerald-350 hover:bg-emerald-50/5 transition flex flex-col md:flex-row gap-4 items-start shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap justify-between">
                            <span className="text-sm font-bold text-neutral-900 truncate max-w-[220px] md:max-w-sm">{doc.title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded font-bold">
                                {doc.category}
                              </span>
                              {doc.isApproved ? (
                                <span className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 uppercase tracking-wide">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  Tasdiqlangan
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-200 uppercase tracking-wide animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                  Kutilmoqda
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-neutral-450 font-semibold block mt-1">
                            Sana: {doc.date} • Hajmi: {doc.size}
                          </span>

                          <p className="text-xs text-neutral-555 leading-relaxed mt-2 italic">
                            "{doc.description}"
                          </p>

                          <div className="flex gap-3 items-center justify-between mt-3 pt-3 border-t border-neutral-100/50">
                            <span className="text-[10px] font-mono font-semibold text-emerald-600">
                              Yuklovchi: {doc.author.split(" (")[0]}
                            </span>

                            <div className="flex gap-2">
                              {doc.downloadUrl && (
                                <a
                                  href={doc.downloadUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
                                  title="Ochish / Yuklab olish"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => setPendingDeleteDoc(doc)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition"
                                  title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {subTab === "news" && (
                /* ==================== SUBTAB: NEWS ARTICLES ==================== */
                userNews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-750">Siz yuklagan yangiliklar yo'q</h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                      "Flora Yangiliklari" tabiga o'tib, o'z tadqiqot kashfiyotlaringiz haqida yangilik yozib yuboring. Ular admin tomonidan tasdiqlangach ommaga ko'rsatiladi.
                    </p>
                    <button
                      onClick={() => onNavigateToTab("home")}
                      className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl transition mt-4"
                    >
                      Bosh sahifani ochish
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {userNews.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2.5xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/5 transition flex flex-col md:flex-row gap-4 items-start shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap justify-between">
                            <span className="text-sm font-bold text-neutral-900 truncate max-w-[280px] md:max-w-md">{item.title}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-bold uppercase">
                                {item.category}
                              </span>
                              {item.isApproved ? (
                                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                                  Tasdiqlangan
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-bold animate-pulse">
                                  Kutilmoqda
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-neutral-450 font-semibold block mt-1">
                            Sana: {item.date} • Manba: {item.source}
                          </span>

                          <p className="text-xs text-neutral-555 leading-relaxed mt-2 italic">
                            "{item.summary}"
                          </p>

                          <div className="flex gap-3 items-center justify-between mt-3 pt-3 border-t border-neutral-100/50">
                            <span className="text-[10px] font-mono font-semibold text-neutral-400">
                              Maqola ID: #{item.id}
                            </span>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setPendingDeleteNews(item)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {subTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-mono">
                        Ism-sharifingiz
                      </label>
                      <input
                        type="text"
                        value={settingsFullname}
                        onChange={(e) => setSettingsFullname(e.target.value)}
                        className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-semibold text-neutral-850"
                        placeholder="Ism-sharifingizni kiriting"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-mono">
                        Mutaxassislik
                      </label>
                      <select
                        value={settingsSpecialty}
                        onChange={(e) => setSettingsSpecialty(e.target.value)}
                        className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-semibold text-neutral-855"
                      >
                        {SPECIALTY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-mono">
                        Tashkilot yoki Institut
                      </label>
                      <select
                        value={ORGANIZATION_OPTIONS.includes(settingsOrganization) ? settingsOrganization : "other"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "other") {
                            setSettingsOrganization("");
                          } else {
                            setSettingsOrganization(val);
                          }
                        }}
                        className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-semibold text-neutral-855"
                      >
                        {ORGANIZATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        <option value="other">Boshqa (Qo'lda kiritish)...</option>
                      </select>
                      
                      {(!ORGANIZATION_OPTIONS.includes(settingsOrganization) || settingsOrganization === "") && (
                        <input
                          type="text"
                          value={settingsOrganization}
                          onChange={(e) => setSettingsOrganization(e.target.value)}
                          className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 mt-2 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-semibold text-neutral-850"
                          placeholder="Tashkilot nomini yozing..."
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-mono">
                        Elektron pochta
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={settingsEmail}
                          onChange={(e) => setSettingsEmail(e.target.value)}
                          className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 pl-9 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-semibold text-neutral-850"
                          placeholder="pochta@example.com"
                          required
                        />
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-mono">
                      Ilmiy biografiya / Qo'shimcha ma'lumotlar
                    </label>
                    <textarea
                      rows={3}
                      value={settingsBio}
                      onChange={(e) => setSettingsBio(e.target.value)}
                      className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-medium text-neutral-800 resize-none"
                      placeholder="O'zingiz haqingizda ma'lumotlar, ilmiy yo'nalishingiz va tadqiqot qiziqishlaringiz..."
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div className="border-t border-neutral-100 pt-4">
                    <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider font-mono">
                      Profil rasmini tanlang
                    </label>
                    
                    <div className="flex flex-wrap gap-3 items-center mb-3">
                      {PRESET_AVATARS.map((url, i) => {
                        const isSelected = settingsAvatarUrl === url && !settingsCustomAvatar;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSettingsAvatarUrl(url);
                              setSettingsCustomAvatar("");
                            }}
                            className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition duration-200 hover:scale-105 shrink-0 ${
                              isSelected ? "border-amber-500 shadow-md ring-2 ring-amber-500/20" : "border-neutral-200 hover:border-amber-400"
                            }`}
                          >
                            <img src={url} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        );
                      })}
                      
                      {/* Local File Upload Button */}
                      <label className="w-12 h-12 rounded-xl border-2 border-dashed border-neutral-300 hover:border-amber-500 hover:bg-amber-50/20 flex flex-col items-center justify-center cursor-pointer transition duration-200 group shrink-0 select-none" title="Kompyuter yoki galereyadan rasm yuklash">
                        <UploadCloud className="w-5 h-5 text-neutral-400 group-hover:text-amber-500 transition duration-200" />
                        <span className="text-[8px] font-bold text-neutral-400 group-hover:text-amber-500 transition duration-200 uppercase tracking-tighter mt-0.5">Yuklash</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLocalFileChange}
                        />
                      </label>
                      
                      {/* Preview of custom avatar if active */}
                      {settingsCustomAvatar && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md ring-2 ring-amber-500/20 shrink-0">
                          <img src={settingsCustomAvatar} alt="Custom avatar preview" className="w-full h-full object-cover" onError={(e) => {
                            (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                          }} referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-neutral-450 font-semibold">Yoki o'zingizning rasm havolangizni (URL) kiriting:</label>
                      <input
                        type="url"
                        value={settingsCustomAvatar}
                        onChange={(e) => {
                          setSettingsCustomAvatar(e.target.value);
                          if (e.target.value.trim() !== "") {
                            setSettingsAvatarUrl(e.target.value.trim());
                          } else {
                            setSettingsAvatarUrl(PRESET_AVATARS[0]);
                          }
                        }}
                        className="w-full bg-neutral-50/50 border border-neutral-250 rounded-2xl text-xs p-3 focus:bg-white focus:border-amber-500 transition duration-200 outline-none font-mono text-neutral-750"
                        placeholder="https://example.com/rasm.jpg"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setSubTab("finding")}
                      className="px-4 py-2.5 rounded-xl border border-neutral-250 text-neutral-750 hover:bg-neutral-50 text-xs font-bold transition duration-200"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition duration-200 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Sozlamalarni saqlash</span>
                    </button>
                  </div>
                </form>
              )}

              {subTab === "achievements" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-200/50 p-4 rounded-2.5xl flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider font-mono">Tadqiqotchi yutuqlari nishonlari</h4>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        BIOMap tizimidagi faolligingiz evaziga maxsus nishonlar va darajalarga ega bo'ling. Har bir nishon sizning ekologik monitoringdagi hissangizni aks ettiradi.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievementsList.map((ach) => {
                      const IconComponent = ach.icon;
                      return (
                        <div
                          key={ach.id}
                          className={`p-5 rounded-2.5xl border flex gap-4 transition-all duration-300 relative group overflow-hidden ${
                            ach.unlocked
                              ? `bg-gradient-to-br ${ach.colorClass} shadow-sm hover:shadow-md hover:-translate-y-0.5`
                              : "bg-neutral-50/50 border-neutral-200/60 opacity-70"
                          }`}
                        >
                          {/* Corner status icon */}
                          <div className="absolute top-3 right-3">
                            {ach.unlocked ? (
                              <div className="bg-emerald-500 text-white p-1 rounded-full shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>
                                <Unlock className="w-3 h-3" />
                              </div>
                            ) : (
                              <div className="bg-neutral-250 text-neutral-450 p-1 rounded-full">
                                <Lock className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          {/* Badge Icon container */}
                          <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                            ach.unlocked
                              ? `${ach.badgeBg} border-current/10`
                              : "bg-neutral-200/70 border-neutral-300 text-neutral-400"
                          }`}>
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className={`text-sm font-display font-black leading-tight ${
                              ach.unlocked ? "text-neutral-900" : "text-neutral-500"
                            }`}>
                              {ach.name}
                            </h4>
                            
                            <p className={`text-[11px] leading-relaxed mt-1 line-clamp-2 ${
                              ach.unlocked ? "text-neutral-600" : "text-neutral-450"
                            }`}>
                              {ach.unlocked ? ach.desc : ach.req}
                            </p>

                            {/* Progress Tracker */}
                            <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                              <span className={ach.unlocked ? "text-neutral-550 font-bold" : "text-neutral-400"}>
                                Holat:
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                ach.unlocked ? "bg-emerald-500/10 text-emerald-700" : "bg-neutral-200/60 text-neutral-500"
                              }`}>
                                {ach.progressText}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {subTab === "notifications" && (
                <div className="space-y-4 animate-fade-in">
                  {notificationsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200">
                        <Bell className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-750">Bildirishnomalar mavjud emas</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                        Siz kiritgan yangi topilmalar holati va ma'muriyat xabarlari shu yerda ko'rinadi.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                      {notificationsList.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4.5 rounded-2.5xl border flex gap-4 items-start shadow-sm transition duration-200 hover:-translate-y-0.5 ${
                            notif.type === "success"
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : notif.type === "warning"
                              ? "bg-amber-500/5 border-amber-500/20"
                              : "bg-blue-500/5 border-blue-500/20"
                          }`}
                        >
                          {/* Notification Icon */}
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                            notif.type === "success"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                              : notif.type === "warning"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-700"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                          }`}>
                            {notif.type === "success" && <CheckCircle className="w-5 h-5" />}
                            {notif.type === "warning" && <Compass className="w-5 h-5 animate-pulse" />}
                            {notif.type === "info" && <Sparkles className="w-5 h-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-mono">
                                {notif.title}
                              </h4>
                              <span className="text-[9px] font-semibold text-neutral-450 font-mono">
                                {notif.date}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-150 pt-4 mt-6 text-[11px] text-neutral-400 italic">
              * Yuqoridagi ma'lumotlar faqat sizning akkauntingizga bog'langan holda sayt xotirasi (Local Storage) da mustahkam saqlanadi.
            </div>
          </div>
        </div>
      ) : (
        <AuthPage
          onAuthenticated={onAuthenticated}
          observations={observations}
          documents={documents}
        />
      )}
      {/* Beautiful Profile Toast Notification System */}
      {profileToast && (
        <div className="fixed bottom-6 right-6 z-[6000] bg-neutral-900 border border-neutral-750 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up text-xs font-semibold">
          <div className={`w-2.5 h-2.5 rounded-full ${
            profileToastType === "success" ? "bg-emerald-500" : profileToastType === "error" ? "bg-rose-500" : "bg-amber-500"
          }`} />
          <span>{profileToast}</span>
          <button
            onClick={() => setProfileToast(null)}
            className="text-neutral-400 hover:text-white ml-2 transition text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Observation */}
      {pendingDeleteObs && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[6000] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 border border-red-200">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <div>
              <h3 className="text-base font-display font-black text-neutral-900">Hisobotni o'chirish</h3>
              <p className="text-xs text-neutral-500 mt-2">
                <strong>"{pendingDeleteObs.nomi}"</strong> hisobotini butunlay o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setPendingDeleteObs(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  onDeleteObservation(pendingDeleteObs.id);
                  setPendingDeleteObs(null);
                  setProfileToast("Kuzatuv hisoboti muvaffaqiyatli o'chirildi.");
                  setProfileToastType("success");
                  setTimeout(() => setProfileToast(null), 3000);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-bold text-xs transition shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Document */}
      {pendingDeleteDoc && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[6000] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 border border-red-200">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <div>
              <h3 className="text-base font-display font-black text-neutral-900">Ilmiy hujjatni o'chirish</h3>
              <p className="text-xs text-neutral-500 mt-2">
                <strong>"{pendingDeleteDoc.title}"</strong> ilmiy hujjatini profilingiz va kutubxonadan butunlay o'chirishni xohlaysizmi?
              </p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setPendingDeleteDoc(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  onDeleteDocument(pendingDeleteDoc.id);
                  setPendingDeleteDoc(null);
                  setProfileToast("Ilmiy hujjat kutubxonadan muvaffaqiyatli o'chirildi.");
                  setProfileToastType("success");
                  setTimeout(() => setProfileToast(null), 3000);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-bold text-xs transition shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting News Article */}
      {pendingDeleteNews && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[6000] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 border border-red-200">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <div>
              <h3 className="text-base font-display font-black text-neutral-900">Yangilik / Maqolani o'chirish</h3>
              <p className="text-xs text-neutral-500 mt-2">
                <strong>"{pendingDeleteNews.title}"</strong> yangiligini butunlay o'chirishni xohlaysizmi?
              </p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setPendingDeleteNews(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  onDeleteNews(pendingDeleteNews.id);
                  setPendingDeleteNews(null);
                  setProfileToast("Yangilik muvaffaqiyatli o'chirildi.");
                  setProfileToastType("success");
                  setTimeout(() => setProfileToast(null), 3000);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-bold text-xs transition shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
