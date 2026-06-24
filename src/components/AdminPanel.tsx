import React, { useState } from "react";
import {
  ShieldCheck,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Cpu,
  ClipboardList,
  AlertTriangle,
  Lock,
  Activity,
  FileText,
} from "lucide-react";
import { Observation, User, PdfDocument, NewsArticle } from "../types";

const ADMIN_PASSWORD = "BIOMAP_ADMIN_2025";
const ADMIN_AUTH_KEY = "biomap_admin_auth";

interface AdminPanelProps {
  observations: Observation[];
  users: User[];
  documents: PdfDocument[];
  onApproveObservation: (obsId: string) => void;
  onRejectObservation: (obsId: string) => void;
  onDeleteObservation: (obsId: string) => void;
  news: NewsArticle[];
  onApproveNews: (articleId: string) => void;
  onDeleteNews: (articleId: string) => void;
  onApproveDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
}

export default function AdminPanel({
  observations,
  users,
  documents,
  onApproveObservation,
  onRejectObservation,
  onDeleteObservation,
  news,
  onApproveNews,
  onDeleteNews,
  onApproveDocument,
  onDeleteDocument,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "users" | "news" | "documents">("pending");
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [confirmReject, setConfirmReject] = useState<Observation | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const pendingObs = observations.filter((o) => !o.isApproved);
  const approvedObs = observations.filter((o) => o.isApproved);
  const pendingDocs = documents.filter((d) => !d.isApproved);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Noto'g'ri parol. Qayta urinib ko'ring.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleApprove = (obs: Observation) => {
    onApproveObservation(obs.id);
    setSelectedObs(null);
    showToast(`✅ "${obs.nomi}" kuzatuvi tasdiqlandi va xaritada ko'rinadi!`, "success");
  };

  const handleReject = (obs: Observation) => {
    onRejectObservation(obs.id);
    setConfirmReject(null);
    setSelectedObs(null);
    showToast(`🗑️ "${obs.nomi}" kuzatuvi rad etildi va o'chirildi.`, "info");
  };

  // ─────────────────────────────────────────────
  // LOGIN PAGE
  // ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-2xl mb-4">
              <Lock className="w-8 h-8 text-neutral-950" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">BIOMap Admin</h1>
            <p className="text-neutral-400 text-xs mt-1 font-mono">Boshqaruv paneli — Maxfiy kirish</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl flex flex-col gap-4"
          >
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block mb-2">
                Admin Paroli
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                placeholder="••••••••••••••••"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition placeholder-neutral-600"
                autoFocus
              />
              {loginError && (
                <p className="text-red-400 text-xs mt-2 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              Kirish
            </button>
          </form>

          <p className="text-center text-neutral-600 text-[10px] font-mono mt-4">
            Faqat vakolatli moderatorlar uchun
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ADMIN DASHBOARD
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <span className="text-sm font-black text-white block leading-none">BIOMap Admin</span>
              <span className="text-[10px] text-neutral-400 font-mono">Boshqaruv paneli</span>
            </div>
          </div>

          {/* Stats badges */}
          <div className="hidden md:flex items-center gap-3">
            {pendingObs.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-bold text-xs font-mono">{pendingObs.length} ta kutmoqda</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-xs font-mono">{approvedObs.length} ta tasdiqlangan</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-red-400 transition text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">Kutayotgan</span>
              <span className="text-2xl font-black text-amber-400">{pendingObs.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">Tasdiqlangan</span>
              <span className="text-2xl font-black text-emerald-400">{approvedObs.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">Foydalanuvchilar</span>
              <span className="text-2xl font-black text-blue-400">{users.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">Jami kuzatuvlar</span>
              <span className="text-2xl font-black text-violet-400">{observations.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">Moderatsiya (Yangilik)</span>
              <span className="text-2xl font-black text-emerald-400">{news.filter(n => !n.isApproved).length}</span>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">Moderatsiya (PDF)</span>
              <span className="text-2xl font-black text-indigo-400">{pendingDocs.length}</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "pending"
                ? "bg-amber-500 text-neutral-950"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Kutayotganlar
            {pendingObs.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === "pending" ? "bg-neutral-950/20" : "bg-amber-500/20 text-amber-400"}`}>
                {pendingObs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Tasdiqlangan
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Foydalanuvchilar
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "news"
                ? "bg-emerald-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Yangiliklar Moderatsiyasi
            {news.filter(n => !n.isApproved).length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === "news" ? "bg-neutral-950/20" : "bg-emerald-500/20 text-emerald-400"}`}>
                {news.filter(n => !n.isApproved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "documents"
                ? "bg-indigo-600 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Hujjatlar Moderatsiyasi
            {pendingDocs.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === "documents" ? "bg-neutral-950/20" : "bg-indigo-500/20 text-indigo-400"}`}>
                {pendingDocs.length}
              </span>
            )}
          </button>
        </div>

        {/* ───── PENDING TAB ───── */}
        {activeTab === "pending" && (
          <div className="flex flex-col gap-4">
            {pendingObs.length === 0 ? (
              <div className="bg-neutral-900 rounded-3xl p-12 border border-neutral-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Hamma narsa ko'rib chiqilgan!</h3>
                <p className="text-sm text-neutral-400 mt-2">Hozircha tasdiqlanishi kerak bo'lgan kuzatuv yo'q.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-400 font-mono">
                  {pendingObs.length} ta kuzatuv tasdiqlashingizni kutmoqda
                </p>
                {pendingObs.map((obs) => (
                  <ObservationCard
                    key={obs.id}
                    obs={obs}
                    mode="pending"
                    onApprove={() => handleApprove(obs)}
                    onReject={() => setConfirmReject(obs)}
                    onView={() => setSelectedObs(obs)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ───── APPROVED TAB ───── */}
        {activeTab === "approved" && (
          <div className="flex flex-col gap-4">
            {approvedObs.length === 0 ? (
              <div className="bg-neutral-900 rounded-3xl p-12 border border-neutral-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Tasdiqlangan kuzatuvlar yo'q</h3>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-400 font-mono">{approvedObs.length} ta kuzatuv tasdiqlangan va xaritada ko'rinadi</p>
                {approvedObs.map((obs) => (
                  <ObservationCard
                    key={obs.id}
                    obs={obs}
                    mode="approved"
                    onDelete={() => onDeleteObservation(obs.id)}
                    onView={() => setSelectedObs(obs)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ───── USERS TAB ───── */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            {users.length === 0 ? (
              <div className="bg-neutral-900 rounded-3xl p-12 border border-neutral-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Hali foydalanuvchi yo'q</h3>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-400 font-mono">{users.length} ta ro'yxatdan o'tgan tadqiqotchi</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => {
                    const userObsCount = observations.filter(
                      (o) => o.userId === user.id || o.tadqiqotchi === user.fullname
                    ).length;
                    return (
                      <div
                        key={user.id}
                        className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center gap-4"
                      >
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullname)}`}
                          alt={user.fullname}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-neutral-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{user.fullname}</h4>
                          <p className="text-[10px] text-neutral-400 font-mono truncate">{user.email}</p>
                          <p className="text-[10px] text-neutral-500 truncate mt-0.5">{user.organization}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xl font-black text-amber-400 block">{userObsCount}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">kuzatuv</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ───── NEWS TAB ───── */}
        {activeTab === "news" && (
          <div className="flex flex-col gap-4">
            {news.filter(n => !n.isApproved).length === 0 ? (
              <div className="bg-neutral-900 rounded-3xl p-12 border border-neutral-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Yangiliklar moderatsiyadan o'tgan!</h3>
                <p className="text-sm text-neutral-400 mt-2">Tasdiqlash kutilayotgan hech qanday maqola yoki yangilik yo'q.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-400 font-mono">
                  {news.filter(n => !n.isApproved).length} ta yangilik tasdiqlashingizni kutmoqda
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {news.filter(n => !n.isApproved).map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-900 rounded-2xl border border-amber-500/30 p-5 transition hover:border-neutral-750 flex flex-col gap-3.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-neutral-800">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            item.category === "kashfiyot" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" :
                            item.category === "monitoring" ? "bg-blue-500/10 text-blue-450 border border-blue-500/20" :
                            item.category === "muhofaza" ? "bg-amber-500/10 text-amber-450 border border-amber-500/20" :
                            "bg-indigo-500/10 text-indigo-450 border border-indigo-500/20"
                          }`}>
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                        </div>
                        <span className="text-[10px] text-neutral-450 font-mono font-medium">{item.date}</span>
                      </div>

                      <div className="bg-neutral-950/80 border border-neutral-850/60 rounded-xl p-3.5 text-xs italic text-neutral-450 leading-relaxed">
                        "{item.summary}"
                      </div>

                      <div className="text-xs text-neutral-300 leading-relaxed max-h-48 overflow-y-auto bg-neutral-950 p-4 rounded-xl border border-neutral-850 font-normal">
                        {item.content.split('\n').map((para, idx) => (
                          <p key={idx} className={idx > 0 ? "mt-2.5" : ""}>{para}</p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-3.5 border-t border-neutral-800 text-[10px] text-neutral-400 font-mono">
                        <span>Muallif/Manba: <strong className="text-neutral-300">{item.source}</strong></span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onApproveNews(item.id);
                              showToast(`✅ "${item.title}" yangiligi tasdiqlandi va chop etildi!`, "success");
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => {
                              onDeleteNews(item.id);
                              showToast(`🗑️ "${item.title}" yangiligi rad etildi va o'chirildi.`, "info");
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/25 hover:bg-red-650/45 text-red-400 text-xs font-bold transition border border-red-600/30"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rad etish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ───── DOCUMENTS MODERATION TAB ───── */}
        {activeTab === "documents" && (
          <div className="flex flex-col gap-4">
            {pendingDocs.length === 0 ? (
              <div className="bg-neutral-900 rounded-3xl p-12 border border-neutral-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Hujjatlar moderatsiyadan o'tgan!</h3>
                <p className="text-sm text-neutral-400 mt-2">Tasdiqlash kutilayotgan hech qanday PDF hujjat yo'q.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-400 font-mono">
                  {pendingDocs.length} ta hujjat tasdiqlashingizni kutmoqda
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {pendingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-neutral-900 rounded-2xl border border-indigo-500/30 p-5 transition hover:border-indigo-500/50 flex flex-col gap-4"
                    >
                      {/* Doc Header */}
                      <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-neutral-800">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white leading-tight truncate max-w-sm">{doc.title}</h4>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                                doc.category === "Ilmiy maqola" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                doc.category === "Kitob" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                doc.category === "Qo'llanma" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                "bg-violet-500/10 text-violet-400 border-violet-500/20"
                              }`}>
                                {doc.category}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">{doc.size} • {doc.date}</span>
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                <Clock className="w-2.5 h-2.5" />
                                Kutilmoqda
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Muallif Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-2.5">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mb-0.5">Muallif</span>
                          <span className="text-xs text-white font-semibold">{doc.author}</span>
                        </div>
                        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-2.5">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mb-0.5">Muassasa</span>
                          <span className="text-xs text-neutral-300 font-medium truncate block" title={doc.authorInstitution}>
                            {doc.authorInstitution || "Ko'rsatilmagan"}
                          </span>
                        </div>
                        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-2.5">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mb-0.5">Lavozimi / Roli</span>
                          <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-lg inline-block ${
                            doc.authorRole === "tadqiqotchi" ? "bg-emerald-500/15 text-emerald-400" :
                            doc.authorRole === "o'qituvchi" ? "bg-blue-500/15 text-blue-400" :
                            doc.authorRole === "talaba" ? "bg-amber-500/15 text-amber-400" :
                            "bg-neutral-700 text-neutral-300"
                          }`}>
                            {doc.authorRole || "boshqa"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-neutral-950/60 border border-neutral-850/60 rounded-xl p-3.5 text-xs italic text-neutral-450 leading-relaxed">
                        "{doc.description}"
                      </div>

                      {/* PDF Preview link if available */}
                      {doc.downloadUrl && (
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-mono font-bold transition w-fit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          PDF faylini ko'rish (yangi tab)
                        </a>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-1 pt-3.5 border-t border-neutral-800">
                        <span className="text-[10px] text-neutral-500 font-mono">ID: {doc.id.slice(0, 16)}...</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onApproveDocument(doc.id);
                              showToast(`✅ "${doc.title}" hujjati tasdiqlandi va kutubxonada chop etildi!`, "success");
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => {
                              onDeleteDocument(doc.id);
                              showToast(`🗑️ "${doc.title}" hujjati rad etildi va o'chirildi.`, "info");
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/25 hover:bg-red-650/45 text-red-400 text-xs font-bold transition border border-red-600/30"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rad etish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ───── DETAIL MODAL ───── */}
      {selectedObs && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[7000] animate-fade-in">
          <div className="bg-neutral-900 rounded-3xl max-w-lg w-full border border-neutral-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="relative">
              <img
                src={selectedObs.image}
                alt={selectedObs.nomi}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setSelectedObs(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-950/70 text-white flex items-center justify-center hover:bg-neutral-950 transition text-xs font-bold"
              >
                ✕
              </button>
              {!selectedObs.isApproved && (
                <div className="absolute top-3 left-3 bg-amber-500 text-neutral-950 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Kutmoqda
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <h3 className="text-lg font-black text-white">{selectedObs.nomi}</h3>
                {selectedObs.lotincha_nomi && (
                  <p className="text-sm italic text-neutral-400">{selectedObs.lotincha_nomi}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-neutral-800 rounded-xl p-2.5">
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Oila</span>
                  <span className="text-white font-semibold">{selectedObs.oilasi || "—"}</span>
                </div>
                <div className="bg-neutral-800 rounded-xl p-2.5">
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Status</span>
                  <span className="text-amber-400 font-semibold">{selectedObs.status || "—"}</span>
                </div>
                <div className="bg-neutral-800 rounded-xl p-2.5">
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Koordinata</span>
                  <span className="text-white font-semibold font-mono">{selectedObs.kordinata.lat}°, {selectedObs.kordinata.lng}°</span>
                </div>
                <div className="bg-neutral-800 rounded-xl p-2.5">
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Sana</span>
                  <span className="text-white font-semibold">{selectedObs.sana}</span>
                </div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-3">
                <span className="text-neutral-500 font-mono uppercase text-[10px] block mb-1">Tadqiqotchi</span>
                <span className="text-white text-sm font-semibold">{selectedObs.tadqiqotchi}</span>
                <span className="text-[10px] text-neutral-500 ml-2">{selectedObs.isAIIdentified ? "• AI Skaner" : "• Dala hisoboti"}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{selectedObs.izoh}</p>

              {/* Multi-image thumbnails for Admin review */}
              {selectedObs.images && selectedObs.images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {selectedObs.images.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-800 shrink-0 hover:border-amber-500 transition shadow-sm"
                    >
                      <img src={src} className="w-full h-full object-cover" alt="Galeriyadan rasm" referrerPolicy="no-referrer" />
                    </a>
                  ))}
                </div>
              )}

              {/* Video player for Admin review */}
              {selectedObs.video && (
                <div className="max-w-sm">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold font-mono block mb-1">
                    Tasdiqlovchi video:
                  </span>
                  <div className="bg-neutral-950 rounded-xl p-1.5 border border-neutral-800">
                    <video
                      src={selectedObs.video}
                      controls
                      preload="metadata"
                      className="w-full max-h-32 rounded-lg object-contain bg-black"
                    />
                  </div>
                </div>
              )}
              {!selectedObs.isApproved && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { handleApprove(selectedObs); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => { setConfirmReject(selectedObs); setSelectedObs(null); }}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border border-red-600/30"
                  >
                    <XCircle className="w-4 h-4" />
                    Rad etish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───── CONFIRM REJECT MODAL ───── */}
      {confirmReject && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[8000] animate-fade-in">
          <div className="bg-neutral-900 rounded-3xl max-w-sm w-full border border-red-900/50 shadow-2xl p-6 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 border border-red-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Kuzatuvni rad etish</h3>
              <p className="text-xs text-neutral-400 mt-2">
                <strong className="text-white">"{confirmReject.nomi}"</strong> kuzatuvini rad etib, o'chirib tashlamoqchimisiz?
                Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setConfirmReject(null)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleReject(confirmReject)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold text-xs transition"
              >
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── TOAST ───── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9000] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-slide-up ${
          toast.type === "success" ? "bg-emerald-600 text-white" :
          toast.type === "error" ? "bg-red-600 text-white" :
          "bg-neutral-800 border border-neutral-700 text-white"
        }`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition ml-1">✕</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ObservationCard sub-component
// ─────────────────────────────────────────────
interface ObsCardProps {
  key?: React.Key;
  obs: Observation;
  mode: "pending" | "approved";
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onView: () => void;
}

function ObservationCard({ obs, mode, onApprove, onReject, onDelete, onView }: ObsCardProps) {
  return (
    <div className={`bg-neutral-900 rounded-2xl border flex flex-col md:flex-row gap-4 p-4 transition hover:border-neutral-700 ${
      mode === "pending" ? "border-amber-500/30" : "border-neutral-800"
    }`}>
      {/* Image */}
      <img
        src={obs.image}
        alt={obs.nomi}
        className="w-full md:w-24 h-24 rounded-xl object-cover border border-neutral-800 shrink-0"
        referrerPolicy="no-referrer"
      />

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{obs.nomi}</span>
            {obs.lotincha_nomi && (
              <span className="text-xs italic text-neutral-400">({obs.lotincha_nomi})</span>
            )}
            {obs.status && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                obs.status.includes("1")
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {obs.status.split(" ")[0]} toifa
              </span>
            )}
            {obs.isAIIdentified && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" />
                AI
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-neutral-500 font-mono flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {obs.kordinata.lat}°, {obs.kordinata.lng}°
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {obs.sana}
            </span>
            <span className="text-neutral-600">• {obs.tadqiqotchi}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{obs.izoh}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition"
          >
            <Eye className="w-3.5 h-3.5" />
            Ko'rish
          </button>
          {mode === "pending" && (
            <>
              <button
                onClick={onApprove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tasdiqlash
              </button>
              <button
                onClick={onReject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold transition border border-red-600/30"
              >
                <XCircle className="w-3.5 h-3.5" />
                Rad etish
              </button>
            </>
          )}
          {mode === "approved" && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-900/30 text-neutral-500 hover:text-red-400 text-xs font-bold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              O'chirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
