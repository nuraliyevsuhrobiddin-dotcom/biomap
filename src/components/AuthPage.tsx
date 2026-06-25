import React, { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, Mail, Lock, User as UserIcon, UserPlus,
  Leaf, MapPin, Cpu, BarChart2, CheckCircle, AlertCircle,
  Loader2, ArrowRight, Layers, Shield, Globe, BookOpen
} from "lucide-react";
import { User, Observation, PdfDocument } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
// Local offline authentication database helpers
const getLocalUsers = (): User[] => {
  try {
    const saved = localStorage.getItem("biomap_users");
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      const seeded = [
        {
          id: "user_3",
          fullname: "Suhrobiddin Nuraliyev",
          email: "nuraliyevsuhrobiddin@gmail.com",
          organization: "O'zbekiston Fanlar akademiyasi Botanika instituti",
          specialty: "Mustaqil Tadqiqotchi & Botanik olim",
          bio: "O'zbekiston noyob o'simliklarini saqlash qonun-qoidalari, xaritalash metodlari va rasmiy darslik hisobotlari muharriri.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
          registeredAt: "2025-05-24"
        },
        {
          id: "user_1",
          fullname: "Dilshod Shokirov",
          email: "shokirov.d@botany.uz",
          organization: "O'zbekiston Fanlar akademiyasi Botanika instituti",
          specialty: "Botanika va Taksonomiya",
          bio: "Yo'qolib borayotgan lolasimonlar turkumi va tog'li klasterlar bo'yicha 15 yillik tajribali ilmiy xodim.",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          registeredAt: "2024-05-10"
        },
        {
          id: "user_2",
          fullname: "Barno To'rayeva",
          email: "barno.t@gis.uz",
          organization: "Mustaqil tadqiqotlar va yosh botaniklar ittifoqi",
          specialty: "Ekologiya va Geografik Axborot Tizimlari (GIS)",
          bio: "Hisor va Boysuntog' tog' tizmalaridagi noyob flora areallarini teleradar orqali tahlil qilish koordinatori.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          registeredAt: "2025-01-15"
        }
      ];
      localStorage.setItem("biomap_users", JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    return [];
  }
};

const getLocalPasswords = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem("biomap_user_passwords");
    const parsed = saved ? JSON.parse(saved) : {};
    const defaultPass = "12345678";
    let updated = false;
    const emails = ["nuraliyevsuhrobiddin@gmail.com", "shokirov.d@botany.uz", "barno.t@gis.uz"];
    
    emails.forEach(email => {
      const eKey = email.toLowerCase();
      if (!parsed[eKey]) {
        parsed[eKey] = defaultPass;
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem("biomap_user_passwords", JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {};
  }
};

/* ─────────────────────────── Types ─────────────────────────── */
interface AuthPageProps {
  onAuthenticated: (user: User) => void;
  observations: Observation[];
  documents: PdfDocument[];
}

type AuthMode = "login" | "register";
type FeedbackType = "idle" | "loading" | "success" | "error" | "info";

/* ─────────────────────────── Static data ─────────────────────────── */
const SPECIALTY_OPTIONS = [
  "Botanika va Taksonomiya",
  "Ekologiya va Geografik Axborot Tizimlari (GIS)",
  "Dorivor O'simliklar Biokimyosi",
  "Tabiatni Muhofaza qilish va Ekolog",
  "Tabiat havaskori va Ekologik Volontyor",
];

const ORGANIZATION_OPTIONS = [
  "O'zbekiston Fanlar akademiyasi Botanika instituti",
  "Toshkent Davlat Agrar Universiteti",
  "Ekologiya va atrof-muhitni muhofaza qilish davlat qo'mitasi",
  "O'zbekiston Milliy Universiteti, Biologiya fakulteti",
  "Mustaqil tadqiqotlar va yosh botaniklar ittifoqi",
];

const STATS = [
  { icon: Leaf, label: "Himoyalangan tur", value: "285+", color: "text-emerald-600" },
  { icon: MapPin, label: "Kuzatuv nuqtasi", value: "1,240+", color: "text-amber-600" },
  { icon: Globe, label: "Viloyat", value: "14", color: "text-sky-600" },
  { icon: BookOpen, label: "Ilmiy hujjat", value: "340+", color: "text-indigo-600" },
];

/* ─────────────────────────── Botanical SVG decoration ─────────────────────────── */
function BotanicalDecoration() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Large leaf */}
      <ellipse cx="200" cy="180" rx="90" ry="130" fill="none" stroke="#F59E0B" strokeWidth="1.5"
        transform="rotate(-20 200 180)" />
      <line x1="200" y1="50" x2="200" y2="310" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
      {/* Veins */}
      {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((y, i) => (
        <line key={i} x1="200" y1={50 + y} x2={i % 2 === 0 ? 270 : 130} y2={70 + y}
          stroke="#F59E0B" strokeWidth="0.6" opacity="0.5" />
      ))}
      {/* Small leaves */}
      <ellipse cx="320" cy="80" rx="40" ry="60" fill="none" stroke="#10B981" strokeWidth="1"
        transform="rotate(30 320 80)" />
      <line x1="320" y1="20" x2="320" y2="140" stroke="#10B981" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="80" cy="320" rx="35" ry="55" fill="none" stroke="#10B981" strokeWidth="1"
        transform="rotate(-40 80 320)" />
      <line x1="80" y1="265" x2="80" y2="375" stroke="#10B981" strokeWidth="0.8" opacity="0.5" />
      {/* Circles / berries */}
      {[
        [330, 320, 6], [350, 340, 4], [315, 345, 5],
        [60, 60, 5], [80, 45, 4], [45, 50, 3],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth="0.8" opacity="0.7" />
      ))}
    </svg>
  );
}

/* ─────────────────────────── Input field ─────────────────────────── */
interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  rightEl?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
  darkMode: boolean;
}
function InputField({
  id, type, label, placeholder, value, onChange, icon: Icon,
  rightEl, autoComplete, required, darkMode
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`text-[11px] font-bold uppercase tracking-widest font-mono transition-colors ${focused
          ? "text-amber-500"
          : darkMode ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 ${focused
        ? "border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]"
        : darkMode
          ? "border-slate-700 hover:border-slate-600"
          : "border-slate-200 hover:border-slate-300"
        } ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}
      >
        <Icon className={`absolute left-3.5 w-4 h-4 pointer-events-none transition-colors ${focused ? "text-amber-500" : darkMode ? "text-slate-500" : "text-slate-400"}`} />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          aria-label={label}
          className={`w-full pl-10 pr-${rightEl ? "12" : "4"} py-3 bg-transparent text-sm outline-none rounded-xl ${darkMode ? "text-white placeholder-slate-600" : "text-slate-900 placeholder-slate-400"}`}
        />
        {rightEl && <div className="absolute right-3">{rightEl}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────── Main component ─────────────────────────── */
export default function AuthPage({
  onAuthenticated, observations, documents
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const darkMode = false;

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register fields
  const [regFullname, setRegFullname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [regOrg, setRegOrg] = useState(ORGANIZATION_OPTIONS[0]);
  const [regSpec, setRegSpec] = useState(SPECIALTY_OPTIONS[0]);
  const [regBio, setRegBio] = useState("");

  // Feedback
  const [feedback, setFeedback] = useState<{ type: FeedbackType; msg: string }>({ type: "idle", msg: "" });

  // Animated stat counter
  const [statVisible, setStatVisible] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);

  // Forgot password fields
  const [showForgotPwModal, setShowForgotPwModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  // Compliance states for registration
  const [readTerms, setReadTerms] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const dynamicStats = [
    { icon: Leaf, label: "Himoyalangan tur", value: `${new Set(observations.map(o => o.nomi)).size} ta`, color: "text-emerald-600" },
    { icon: MapPin, label: "Kuzatuv nuqtasi", value: `${observations.length} ta`, color: "text-amber-600" },
    { icon: Globe, label: "Viloyat", value: "14 ta", color: "text-sky-600" },
    { icon: BookOpen, label: "Ilmiy hujjat", value: `${documents.length} ta`, color: "text-indigo-600" },
  ];

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatVisible(true); },
      { threshold: 0.3 }
    );
    if (statRef.current) obs.observe(statRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── helpers ── */
  function setMsg(type: FeedbackType, msg: string, durationMs = 4000) {
    setFeedback({ type, msg });
    if (type !== "loading") setTimeout(() => setFeedback({ type: "idle", msg: "" }), durationMs);
  }

  async function handleGoogleLogin() {
    if (!isSupabaseConfigured || !supabase) {
      setMsg("error", "Supabase konfiguratsiya qilinmagan. .env faylini tekshiring.");
      return;
    }
    setMsg("loading", "Google orqali kirilmoqda...");

    // Dynamic redirect URL based on current origin
    const redirectUrl = window.location.origin.includes("localhost")
      ? (import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/success`)
      : `${window.location.origin}/success`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) setMsg("error", error.message);
  }

  function authUserToProfile(authUser: any): User {
    const meta = authUser.user_metadata || {};
    const fullname = meta.fullname || meta.name || authUser.email?.split("@")[0] || "BIOMap tadqiqotchisi";
    return {
      id: authUser.id,
      fullname,
      email: authUser.email || "",
      organization: meta.organization || ORGANIZATION_OPTIONS[0],
      specialty: meta.specialty || SPECIALTY_OPTIONS[0],
      bio: meta.bio || undefined,
      avatarUrl: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullname)}&backgroundColor=f59e0b`,
      registeredAt: authUser.created_at || new Date().toISOString(),
    };
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setMsg("error", "Email va parol maydonlarini to'ldiring.");
      return;
    }

    setMsg("loading", "Akkaunt tekshirilmoqda...");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });

        if (error) {
          // Check if this email exists in localStorage mock database before throwing error
          // (allows local seeded users to log in even if they are not in Supabase Auth yet)
          const users = getLocalUsers();
          const passwords = getLocalPasswords();
          const emailKey = loginEmail.trim().toLowerCase();
          const user = users.find(u => u.email.toLowerCase() === emailKey);
          const correctPassword = passwords[emailKey];

          if (user && correctPassword === loginPassword) {
            onAuthenticated(user);
            setMsg("success", "Tizimga muvaffaqiyatli kirdingiz!");
            return;
          }

          throw error;
        }

        if (data.user) {
          const userProfile = authUserToProfile(data.user);
          onAuthenticated(userProfile);
          setMsg("success", "Tizimga muvaffaqiyatli kirdingiz!");
          return;
        }
      } catch (err: any) {
        console.error("Supabase sign in error:", err);
        setMsg("error", err.message || "Kirishda xatolik yuz berdi. Parol yoki email noto'g'ri.");
        return;
      }
    }

    // Local fallback if Supabase is offline or not configured
    const users = getLocalUsers();
    const passwords = getLocalPasswords();
    
    const emailKey = loginEmail.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === emailKey);

    if (!user) {
      setMsg("error", "Ushbu email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi.");
      return;
    }

    const correctPassword = passwords[emailKey];
    if (correctPassword !== loginPassword) {
      setMsg("error", "Noto'g'ri parol. Qayta urinib ko'ring.");
      return;
    }

    onAuthenticated(user);
    setMsg("success", "Tizimga muvaffaqiyatli kirdingiz!");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regFullname.trim() || !regEmail.trim()) {
      setMsg("error", "Ism va email majburiy.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(regEmail.trim())) {
      setMsg("error", "Email formati noto'g'ri.");
      return;
    }
    if (regPassword.length < 8) {
      setMsg("error", "Parol kamida 8 belgidan iborat bo'lishi kerak.");
      return;
    }

    setMsg("loading", "Akkaunt yaratilmoqda...");

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: regEmail.trim(),
          password: regPassword,
          options: {
            data: {
              fullname: regFullname.trim(),
              organization: regOrg,
              specialty: regSpec,
              bio: regBio.trim() || undefined,
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // If session is returned immediately (confirm email is disabled)
          if (data.session) {
            const newUser = authUserToProfile(data.user);
            onAuthenticated(newUser);
            setMsg("success", "Profil muvaffaqiyatli yaratildi va tizimga kirildi! 🌿");
          } else {
            // If email verification is required by Supabase configuration
            setMsg("success", "Ro'yxatdan o'tish muvaffaqiyatli! Elektron pochtangizni tasdiqlash uchun xat yuborildi. Iltimos, pochtangizni tekshiring.", 8000);
          }
          return;
        }
      } catch (err: any) {
        console.error("Supabase sign up error, falling back to local registration:", err);
        // If email is already registered, report it immediately to user
        if (err.message?.includes("already registered") || err.status === 400) {
          setMsg("error", "Ushbu email manzili allaqachon ro'yxatdan o'tgan.");
          return;
        }
        // General network / server not working error
        setMsg("error", `Tizimga ulanishda xatolik yuz berdi: ${err.message || "noma'lum xato"}`);
        return;
      }
    }

    // Local fallback if Supabase is offline or not configured
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getLocalUsers();
    const emailKey = regEmail.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === emailKey)) {
      setMsg("error", "Ushbu email manzili allaqachon ro'yxatdan o'tgan.");
      return;
    }

    const newUser: User = {
      id: `user_local_${Date.now()}`,
      fullname: regFullname.trim(),
      email: regEmail.trim(),
      organization: regOrg,
      specialty: regSpec,
      bio: regBio.trim() || undefined,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(regFullname.trim())}&backgroundColor=f59e0b`,
      registeredAt: new Date().toISOString()
    };

    // Update users in localStorage
    const updatedUsers = [newUser, ...users];
    localStorage.setItem("biomap_users", JSON.stringify(updatedUsers));

    // Save password
    const passwords = getLocalPasswords();
    passwords[emailKey] = regPassword;
    localStorage.setItem("biomap_user_passwords", JSON.stringify(passwords));

    onAuthenticated(newUser);
    setMsg("success", "Profil muvaffaqiyatli yaratildi va tizimga kirildi! 🌿");
  }

  /* ── styles ── */
  const bg = "bg-[#F5F5F5]";
  const cardBg = "bg-white border-neutral-200";
  const textPrimary = "text-neutral-900";
  const textSecondary = "text-neutral-500";
  const selectStyle = `w-full pl-4 pr-4 py-3 rounded-xl text-sm outline-none border-2 transition-all ${
    darkMode
      ? "bg-slate-800/50 border-slate-700 text-white focus:border-amber-500"
      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
  }`;

  return (
    <div className={`min-h-screen w-full ${bg} transition-colors duration-300 flex items-center justify-center p-4 md:p-6`}
      style={{ animation: "fadeInPage 0.5s ease forwards" }}>

      <style>{`
        @keyframes fadeInPage { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideTab { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes counterUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceSubtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .slide-tab { animation: slideTab 0.25s ease forwards; }
        .stat-item { animation: counterUp 0.5s ease forwards; }
        .animate-bounce-subtle { animation: bounceSubtle 1.5s infinite ease-in-out; }
      `}</style>

      <div className="w-full max-w-6xl mx-auto">
        {/* ──────── 2-column layout ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl"
          style={{ minHeight: 640 }}>

          {/* ═══════════════ LEFT PANEL (hero) ═══════════════ */}
          <div
            className="lg:col-span-2 relative flex flex-col justify-between p-8 md:p-10 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-r border-neutral-200"
            style={{ animation: "slideInLeft 0.5s ease 0.1s both" }}
          >
            {/* Botanical SVG bg */}
            <BotanicalDecoration />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Layers className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-neutral-950 block leading-none">BIOMap</span>
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-brand-secondary block mt-0.5">O'ZBEKISTON</span>
                </div>

              </div>

              {/* Headline */}
              <h1 className="text-3xl md:text-4xl font-black text-neutral-950 leading-tight">
                O'zbekiston<br />
                <span className="text-amber-600">Qizil kitob</span><br />
                monitoring tizimi
              </h1>
              <p className="text-neutral-600 text-sm leading-relaxed mt-4 max-w-xs">
                Noyob o'simliklarni real vaqtda kuzatib boring, GIS xaritada
                belgilang va AI yordamida aniqlang.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  { icon: Cpu, text: "AI Skaner" },
                  { icon: MapPin, text: "GIS Xarita" },
                  { icon: Shield, text: "Qizil kitob" },
                ].map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => setMsg("info", `Ushbu bo'limdan foydalanish uchun tizimga kiring yoki yangi profil yarating 🌿`)}
                    className="flex items-center gap-1.5 bg-white hover:bg-amber-50 border border-neutral-200 text-neutral-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm cursor-pointer transition active:scale-95"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-600" />
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div ref={statRef} className="relative z-10 grid grid-cols-2 gap-3 mt-8">
              {dynamicStats.map(({ icon: Icon, label, value, color }, i) => (
                <div
                  key={label}
                  className={`bg-white/85 border border-neutral-200 rounded-2xl p-4 backdrop-blur-sm shadow-sm ${statVisible ? "stat-item" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <span className="text-2xl font-black text-neutral-950 block leading-none">{value}</span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1 block font-mono">{label}</span>
                </div>
              ))}
            </div>

            {/* Left panel real info card removed */}
          </div>

          {/* ═══════════════ RIGHT PANEL (form) ═══════════════ */}
          <div className={`lg:col-span-3 ${cardBg} border-l flex flex-col justify-center p-8 md:p-10`}
            style={{ animation: "slideInRight 0.5s ease 0.15s both" }}>

            {/* Mobile logo (only shown < lg) */}
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                <Layers className="w-4.5 h-4.5 text-slate-900" />
              </div>
              <span className="text-lg font-black text-neutral-950">BIOMap</span>
            </div>

            {/* Tab switcher */}
            <div className={`flex p-1 rounded-2xl mb-8 border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
              {(["login", "register"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setFeedback({ type: "idle", msg: "" }); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-200 ${mode === m
                    ? `${darkMode ? "bg-slate-700 text-white shadow-lg" : "bg-white text-slate-900 shadow-md"}`
                    : `${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`
                  }`}
                  aria-selected={mode === m}
                  role="tab"
                >
                  {m === "login"
                    ? <><UserIcon className="w-3.5 h-3.5 text-amber-500" />Kirish</>
                    : <><UserPlus className="w-3.5 h-3.5 text-emerald-500" />Ro'yxatdan o'tish</>
                  }
                </button>
              ))}
            </div>

            {/* Feedback banner */}
            {feedback.type !== "idle" && (
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm font-semibold border ${
                feedback.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
                  : feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                  : darkMode
                  ? "bg-slate-800 border-slate-700 text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                {feedback.type === "loading" && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                {feedback.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
                {feedback.type === "success" && <CheckCircle className="w-4 h-4 shrink-0" />}
                {feedback.msg || (feedback.type === "loading" ? "Yuklanmoqda..." : "")}
              </div>
            )}

            {/* ──── LOGIN form ──── */}
            {mode === "login" && (
              <div className="slide-tab flex flex-col gap-5">
                <div>
                  <h2 className={`text-2xl font-black ${textPrimary}`}>Xush kelibsiz 👋</h2>
                  <p className={`text-sm mt-1 ${textSecondary}`}>Akkauntingizga kiring va monitoring boshlang.</p>
                </div>

                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-white hover:border-amber-500/50 hover:bg-slate-750"
                      : "bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:shadow-md"
                  }`}
                  aria-label="Google bilan kirish"
                >
                  {/* Google icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google bilan kirish
                  {!isSupabaseConfigured && (
                    <span className="text-[10px] font-mono text-amber-500 ml-1">(sozlanmagan)</span>
                  )}
                </button>

                {/* Divider */}
                <div className={`flex items-center gap-3 text-xs font-semibold ${textSecondary}`}>
                  <div className={`flex-1 h-px ${darkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                  yoki email bilan
                  <div className={`flex-1 h-px ${darkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
                  <InputField
                    id="login-email"
                    type="email"
                    label="Email manzil"
                    placeholder="botanik@example.uz"
                    value={loginEmail}
                    onChange={setLoginEmail}
                    icon={Mail}
                    autoComplete="email"
                    required
                    darkMode={darkMode}
                  />
                  <InputField
                    id="login-password"
                    type={showLoginPw ? "text" : "password"}
                    label="Parol"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    icon={Lock}
                    autoComplete="current-password"
                    required
                    darkMode={darkMode}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(s => !s)}
                        aria-label={showLoginPw ? "Parolni yashirish" : "Parolni ko'rsatish"}
                        className={`p-1 rounded-lg transition ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                      >
                        {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPwModal(true)}
                      className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition"
                    >
                      Parolni unutdingizmi?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={feedback.type === "loading"}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3.5 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
                    aria-label="Tizimga kirish"
                  >
                    {feedback.type === "loading"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>Kirish <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </form>

                <p className={`text-center text-xs ${textSecondary}`}>
                  Akkauntingiz yo'qmi?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-amber-500 font-bold hover:underline"
                  >
                    Ro'yxatdan o'ting
                  </button>
                </p>

                {/* Terms note */}
                <p className={`text-center text-[10px] leading-relaxed ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                  Davom etish orqali siz{" "}
                  <a
                    href="/terms.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline cursor-pointer hover:text-amber-500 transition font-bold"
                  >
                    Foydalanish shartlari
                  </a>
                  {" "}va{" "}
                  <a
                    href="/privacy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline cursor-pointer hover:text-amber-500 transition font-bold"
                  >
                    Maxfiylik siyosati
                  </a>
                  ga rozilik bildirasiz.
                </p>
              </div>
            )}

            {/* ──── REGISTER form ──── */}
            {mode === "register" && (
              <div className="slide-tab flex flex-col gap-5">
                <div>
                  <h2 className={`text-2xl font-black ${textPrimary}`}>Profil yarating 🌿</h2>
                  <p className={`text-sm mt-1 ${textSecondary}`}>Ilmiy ma'lumotlaringizni kiriting.</p>
                </div>

                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-white hover:border-amber-500/50"
                      : "bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:shadow-md"
                  }`}
                  aria-label="Google bilan ro'yxatdan o'tish"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google bilan ro'yxatdan o'tish
                </button>

                {/* Divider */}
                <div className={`flex items-center gap-3 text-xs font-semibold ${textSecondary}`}>
                  <div className={`flex-1 h-px ${darkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                  yoki email yordamida
                  <div className={`flex-1 h-px ${darkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      id="reg-fullname"
                      type="text"
                      label="To'liq ism-sharif"
                      placeholder="Sardor Salimov"
                      value={regFullname}
                      onChange={setRegFullname}
                      icon={UserIcon}
                      autoComplete="name"
                      required
                      darkMode={darkMode}
                    />
                    <InputField
                      id="reg-email"
                      type="email"
                      label="Email manzil"
                      placeholder="sardor@botany.uz"
                      value={regEmail}
                      onChange={setRegEmail}
                      icon={Mail}
                      autoComplete="email"
                      required
                      darkMode={darkMode}
                    />
                  </div>

                  <InputField
                    id="reg-password"
                    type={showRegPw ? "text" : "password"}
                    label="Parol"
                    placeholder="Kamida 8 belgi"
                    value={regPassword}
                    onChange={setRegPassword}
                    icon={Lock}
                    autoComplete="new-password"
                    darkMode={darkMode}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowRegPw(s => !s)}
                        aria-label={showRegPw ? "Parolni yashirish" : "Parolni ko'rsatish"}
                        className={`p-1 rounded-lg transition ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                      >
                        {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  {/* Org & Specialty */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-org" className={`text-[11px] font-bold uppercase tracking-widest font-mono ${textSecondary}`}>
                      Tashkilot / Universitet
                    </label>
                    <select
                      id="reg-org"
                      value={regOrg}
                      onChange={e => setRegOrg(e.target.value)}
                      className={selectStyle}
                      aria-label="Tashkilot tanlang"
                    >
                      {ORGANIZATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-spec" className={`text-[11px] font-bold uppercase tracking-widest font-mono ${textSecondary}`}>
                      Mutaxassislik
                    </label>
                    <select
                      id="reg-spec"
                      value={regSpec}
                      onChange={e => setRegSpec(e.target.value)}
                      className={selectStyle}
                      aria-label="Mutaxassislik tanlang"
                    >
                      {SPECIALTY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-bio" className={`text-[11px] font-bold uppercase tracking-widest font-mono ${textSecondary}`}>
                      Qisqacha bio <span className={`${darkMode ? "text-slate-600" : "text-slate-400"} normal-case`}>(ixtiyoriy)</span>
                    </label>
                    <textarea
                      id="reg-bio"
                      rows={2}
                      placeholder="Tog' florasi va Qizil kitob turlarini dala sharoitida xaritalash bilan shug'ullanaman."
                      value={regBio}
                      onChange={e => setRegBio(e.target.value)}
                      aria-label="Qisqacha bio"
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none border-2 resize-none transition-all focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] ${
                        darkMode
                          ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-600"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  {/* Compliance Box */}
                  <div className="flex flex-col gap-3 mt-2 bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Foydalanish shartlari va xavfsizlik
                    </span>
                    
                    <div className="flex flex-col gap-2">
                      {/* Terms link & status */}
                      <div className="flex items-center justify-between bg-white border border-slate-200/80 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-500" />
                          <a
                            href="/terms.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setReadTerms(true)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-500 underline transition decoration-amber-500/30 hover:decoration-amber-500"
                          >
                            Foydalanish shartlari
                          </a>
                        </div>
                        {readTerms ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            O'qildi ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-250 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                            O'qish shart
                          </span>
                        )}
                      </div>

                      {/* Privacy link & status */}
                      <div className="flex items-center justify-between bg-white border border-slate-200/80 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-500" />
                          <a
                            href="/privacy.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setReadPrivacy(true)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-500 underline transition decoration-amber-500/30 hover:decoration-amber-500"
                          >
                            Maxfiylik siyosati
                          </a>
                        </div>
                        {readPrivacy ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            O'qildi ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-250 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                            O'qish shart
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkbox input */}
                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60 mt-1">
                      <input
                        type="checkbox"
                        id="accept-terms-checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        disabled={!(readTerms && readPrivacy)}
                        className={`mt-0.5 w-4.5 h-4.5 rounded border-slate-350 text-amber-500 focus:ring-amber-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          readTerms && readPrivacy ? "animate-bounce-subtle ring-2 ring-amber-500/20" : ""
                        }`}
                      />
                      <label
                        htmlFor="accept-terms-checkbox"
                        className={`text-xs select-none leading-relaxed font-semibold transition-colors duration-200 ${
                          !(readTerms && readPrivacy) 
                            ? "text-slate-400 cursor-not-allowed" 
                            : "text-slate-700 cursor-pointer hover:text-slate-900"
                        }`}
                      >
                        Men yuqoridagi Foydalanish shartlari va Maxfiylik siyosati bilan tanishib chiqdim hamda ro'yxatdan o'tish qoidalarini to'liq qabul qilaman.
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={feedback.type === "loading" || !acceptedTerms}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3.5 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
                    aria-label="Profil yaratish"
                  >
                    {feedback.type === "loading"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><UserPlus className="w-4 h-4" />Profil yaratish</>
                    }
                  </button>
                </form>

                <p className={`text-center text-xs ${textSecondary}`}>
                  Allaqachon akkauntingiz bormi?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-amber-500 font-bold hover:underline"
                  >
                    Kiring
                  </button>
                </p>

                {/* Terms note */}
                <p className={`text-center text-[10px] leading-relaxed ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                  Davom etish orqali siz{" "}
                  <a
                    href="/terms.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline cursor-pointer hover:text-amber-500 transition font-bold"
                  >
                    Foydalanish shartlari
                  </a>
                  {" "}va{" "}
                  <a
                    href="/privacy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline cursor-pointer hover:text-amber-500 transition font-bold"
                  >
                    Maxfiylik siyosati
                  </a>
                  ga rozilik bildirasiz.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom credits */}
        <p className={`text-center text-[10px] mt-4 ${darkMode ? "text-slate-700" : "text-slate-400"} font-mono`}>
          © 2026 BIOMap · O'zbekiston Qizil Kitob Monitoringi · v1.0
        </p>

        {/* Local Password Reset Modal */}
        {showForgotPwModal && (
          <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full border border-neutral-200 shadow-2xl p-6 flex flex-col gap-4 animate-scale-up text-neutral-800">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-base font-black text-neutral-900">Parolni tiklash (Lokal)</h3>
                <button 
                  onClick={() => {
                    setShowForgotPwModal(false);
                    setForgotStep(1);
                    setForgotEmail("");
                    setForgotNewPassword("");
                    setForgotError("");
                    setForgotSuccess("");
                  }} 
                  className="text-neutral-400 hover:text-neutral-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {forgotStep === 1 ? (
                <div className="flex flex-col gap-3.5">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Tizimda ro'yxatdan o'tgan email manzilingizni kiriting. Lokal bazadan hisobingiz tekshiriladi.
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block mb-1.5">
                      Email Manzil
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                      placeholder="botanik@example.uz"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  {forgotError && (
                    <p className="text-red-500 text-xs font-semibold">{forgotError}</p>
                  )}
                  <button
                    onClick={() => {
                      const users = getLocalUsers();
                      const user = users.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
                      if (!user) {
                        setForgotError("Ushbu email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi.");
                      } else {
                        setForgotStep(2);
                        setForgotError("");
                      }
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black py-3 rounded-xl transition text-sm shadow-sm"
                  >
                    Hisobni tekshirish
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {forgotSuccess ? (
                    <div className="flex flex-col items-center text-center gap-3 py-4">
                      <span className="text-3xl">✅</span>
                      <p className="text-sm font-bold text-emerald-600">{forgotSuccess}</p>
                      <p className="text-xs text-neutral-550">Endi yangi parolingiz bilan tizimga kirishingiz mumkin.</p>
                      <button
                        onClick={() => {
                          setShowForgotPwModal(false);
                          setForgotStep(1);
                          setForgotEmail("");
                          setForgotNewPassword("");
                          setForgotError("");
                          setForgotSuccess("");
                        }}
                        className="mt-2 px-6 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition"
                      >
                        Tizimga kirish
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-neutral-500">
                        Hisobingiz topildi! Yangi parolingizni kiriting (kamida 8 belgi):
                      </p>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block mb-1.5">
                          Yangi Parol
                        </label>
                        <input
                          type="password"
                          value={forgotNewPassword}
                          onChange={(e) => { setForgotNewPassword(e.target.value); setForgotError(""); }}
                          placeholder="••••••••"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                      {forgotError && (
                        <p className="text-red-500 text-xs font-semibold">{forgotError}</p>
                      )}
                      <button
                        onClick={() => {
                          if (forgotNewPassword.length < 8) {
                            setForgotError("Parol kamida 8 belgidan iborat bo'lishi kerak.");
                            return;
                          }
                          const passwords = getLocalPasswords();
                          passwords[forgotEmail.trim().toLowerCase()] = forgotNewPassword;
                          localStorage.setItem("biomap_user_passwords", JSON.stringify(passwords));
                          setForgotSuccess("Parol muvaffaqiyatli yangilandi!");
                          setForgotError("");
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition text-sm shadow-sm"
                      >
                        Parolni o'zgartirish
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
