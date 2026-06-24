import React, { useState, useEffect } from "react";
import { Compass, BookOpen, Cpu, BarChart, PlusCircle, Layers, Clock, User as UserIcon, Home as HomeIcon, Download } from "lucide-react";
import { Observation, User, PdfDocument, NewsArticle } from "./types";
import { SEEDED_OBSERVATIONS } from "./data/plants";

import Home, { SEEDED_PDFS, SEEDED_NEWS } from "./components/Home";
import GisMap from "./components/GisMap";
import PlantDatabase from "./components/PlantDatabase";
import AiScanner from "./components/AiScanner";
import StatsDashboard from "./components/StatsDashboard";
import ResearcherPanel from "./components/ResearcherPanel";
import UserProfile from "./components/UserProfile";
import AdminPanel from "./components/AdminPanel";
import { deleteEntity, fetchTable, readLocal, upsertEntity, writeLocal } from "./lib/biomapRepository";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

const DEFAULT_ORGANIZATION = "O'zbekiston Fanlar akademiyasi Botanika instituti";
const DEFAULT_SPECIALTY = "Botanika va Taksonomiya";

function authUserToProfile(authUser: SupabaseAuthUser): User {
  const meta = authUser.user_metadata || {};
  const fullname = meta.fullname || meta.name || authUser.email?.split("@")[0] || "BIOMap tadqiqotchisi";
  return {
    id: authUser.id,
    fullname,
    email: authUser.email || "",
    organization: meta.organization || DEFAULT_ORGANIZATION,
    specialty: meta.specialty || DEFAULT_SPECIALTY,
    bio: meta.bio || undefined,
    avatarUrl: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullname)}&backgroundColor=f59e0b`,
    registeredAt: authUser.created_at || new Date().toISOString(),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "map" | "database" | "scanner" | "stats" | "researcher" | "profile" | "admin">(() => {
    // /admin URL ga kirsa admin panelni ko'rsat
    if (window.location.pathname === "/admin") return "admin";
    return "home";
  });

  // Previous tab - ResearcherPanel state-ni saqlash uchun
  const [prevTabBeforePick, setPrevTabBeforePick] = useState<string | null>(null);
  
  // Database search query — Home sahifasidan uzatiladi
  const [databaseSearchQuery, setDatabaseSearchQuery] = useState<string>("");
  
  const [observations, setObservations] = useState<Observation[]>(() => {
    return readLocal("observations", SEEDED_OBSERVATIONS);
  });

  const [users, setUsers] = useState<User[]>(() => {
    return readLocal("users", []);
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("biomap_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [documents, setDocuments] = useState<PdfDocument[]>(() => {
    return readLocal("documents", SEEDED_PDFS);
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    return readLocal("news", SEEDED_NEWS);
  });
  
  // GIS cross-component focused state
  const [focusedObsId, setFocusedObsId] = useState<string | null>(null);
  // Observation bo'lmagan plant koordinatasiga flyTo uchun
  const [mapFocusCoords, setMapFocusCoords] = useState<{ lat: number; lng: number } | null>(null);

  // GPS coordinate picking mode state
  const [isPickingCoords, setIsPickingCoords] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Live UTC/Local clock tick
  const [timeStr, setTimeStr] = useState("");

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const shownThisSession = sessionStorage.getItem("biomap_install_shown");
      if (!shownThisSession) {
        setShowInstallBanner(true);
        sessionStorage.setItem("biomap_install_shown", "true");
        
        // Auto-hide after 10 seconds so it doesn't bother the user
        setTimeout(() => {
          setShowInstallBanner(false);
        }, 10000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const hasAuthCallback =
      url.pathname === "/success" ||
      url.searchParams.has("code") ||
      url.searchParams.has("id_token") ||
      url.searchParams.has("access_token") ||
      hashParams.has("access_token") ||
      hashParams.has("id_token");

    if (!hasAuthCallback) return;

    setActiveTab("profile");

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          persistAuthenticatedUser(authUserToProfile(data.session.user));
        }
        window.history.replaceState({}, document.title, "/");
      }).catch(() => {
        window.history.replaceState({}, document.title, "/");
      });
    } else {
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const persistAuthenticatedUser = (user: User) => {
    setCurrentUser(user);
    setUsers(prev => {
      const exists = prev.some(item => item.id === user.id);
      return exists ? prev.map(item => item.id === user.id ? user : item) : [user, ...prev];
    });
    void upsertEntity("users", user);
  };

  const handleAddNews = (newArticle: NewsArticle) => {
    setNews(prev => {
      const next = [newArticle, ...prev];
      writeLocal("news", next);
      return next;
    });
    void upsertEntity("news", newArticle);
  };

  const handleDeleteNews = (articleId: string) => {
    setNews(prev => {
      const next = prev.filter(item => item.id !== articleId);
      writeLocal("news", next);
      return next;
    });
    void deleteEntity("news", articleId);
  };

  const handleApproveNews = (articleId: string) => {
    setNews(prev => {
      const next = prev.map(item => item.id === articleId ? { ...item, isApproved: true } : item);
      writeLocal("news", next);
      const approvedItem = next.find(item => item.id === articleId);
      if (approvedItem) {
        void upsertEntity("news", approvedItem);
      }
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function syncInitialData() {
      const [remoteObservations, remoteUsers, remoteDocuments, remoteNews] = await Promise.all([
        fetchTable<Observation>("observations", SEEDED_OBSERVATIONS),
        fetchTable<User>("users", []),
        fetchTable<PdfDocument>("documents", SEEDED_PDFS),
        fetchTable<NewsArticle>("news", SEEDED_NEWS),
      ]);

      if (cancelled) return;
      setObservations(remoteObservations);
      setUsers(remoteUsers);
      setDocuments(remoteDocuments);
      setNews(remoteNews);
    }

    if (isSupabaseConfigured) {
      void syncInitialData();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled || !data.session?.user) return;
      persistAuthenticatedUser(authUserToProfile(data.session.user));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        persistAuthenticatedUser(authUserToProfile(session.user));
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    writeLocal("observations", observations);
  }, [observations]);

  useEffect(() => {
    writeLocal("documents", documents);
  }, [documents]);

  const handleAddDocument = (newDoc: PdfDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    void upsertEntity("documents", newDoc);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    void deleteEntity("documents", docId);
  };

  const handleApproveDocument = (docId: string) => {
    setDocuments(prev => {
      const next = prev.map(item => item.id === docId ? { ...item, isApproved: true } : item);
      writeLocal("documents", next);
      const approvedItem = next.find(item => item.id === docId);
      if (approvedItem) {
        void upsertEntity("documents", approvedItem);
      }
      return next;
    });
  };

  useEffect(() => {
    writeLocal("users", users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("biomap_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("biomap_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("uz-UZ", { hour12: false }) + " (UZT)");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Callback to append AI discovered observation to central state
  const handleAddAiObservation = (newObs: Omit<Observation, "id" | "sana" | "isApproved">) => {
    const observationWithMeta: Observation = {
      ...newObs,
      id: `ai_obs_${Date.now()}`,
      sana: new Date().toISOString().split("T")[0],
      isApproved: false, // Admin tasdiqlashini kutadi
      userId: currentUser?.id,
      tadqiqotchi: currentUser ? currentUser.fullname : (newObs.tadqiqotchi || "Mehmon tadqiqotchi (AI Skaner)")
    };
    setObservations(prev => [observationWithMeta, ...prev]);
    void upsertEntity("observations", observationWithMeta);
  };

  // Callback to append manual field observation to central state
  const handleAddManualObservation = (newObs: Omit<Observation, "id" | "sana" | "isApproved" | "isAIIdentified">) => {
    const observationWithMeta: Observation = {
      ...newObs,
      id: `field_obs_${Date.now()}`,
      sana: new Date().toISOString().split("T")[0],
      isApproved: false, // Admin tasdiqlashini kutadi
      isAIIdentified: false,
      userId: currentUser?.id,
      tadqiqotchi: currentUser ? currentUser.fullname : "Mehmon Ekolog olim"
    };
    setObservations(prev => [observationWithMeta, ...prev]);
    void upsertEntity("observations", observationWithMeta);
    // Clear map coordinates picker state
    setPickedCoords(null);
  };

  // Admin: kuzatuvni tasdiqlash
  const handleApproveObservation = (obsId: string) => {
    setObservations(prev => prev.map(o => {
      if (o.id !== obsId) return o;
      const approved = { ...o, isApproved: true };
      void upsertEntity("observations", approved);
      return approved;
    }));
  };

  const handleDeleteObservation = (obsId: string) => {
    setObservations(prev => prev.filter(o => o.id !== obsId));
    void deleteEntity("observations", obsId);
  };

  const handleEditObservation = (obsId: string, updatedData: Partial<Observation>) => {
    setObservations(prev => prev.map(o => {
      if (o.id !== obsId) return o;
      const updated = { ...o, ...updatedData };
      void upsertEntity("observations", updated);
      return updated;
    }));
  };

  // Callback to focus a catalogue plant directly on GIS Map
  const handleShowPlantOnMap = (lat: number, lng: number, plantId?: string) => {
    // Agar shu o'simlik uchun tasdiqlangan kuzatuv mavjud bo'lsa, uni fokuslaymiz
    const matchedObs = observations.find(o =>
      o.isApproved && (o.plantId === plantId || o.nomi.toLowerCase().includes(plantId?.toLowerCase() || ""))
    );
    if (matchedObs) {
      setFocusedObsId(matchedObs.id);
      setMapFocusCoords(null);
    } else {
      // Kuzatuv yo'q — lekin plant koordinatasiga flyTo qilamiz
      setFocusedObsId(null);
      setMapFocusCoords({ lat, lng });
    }
    setActiveTab("map");
  };

  // Dynamic coord picking callback from GIS Map click
  const handleMapClickCoordinatePick = (lat: number, lng: number) => {
    setPickedCoords({ lat, lng });
    setIsPickingCoords(false);
    // Oldingi tabga qaytamiz (researcher yoki admin)
    setActiveTab((prevTabBeforePick as any) || "researcher");
    setPrevTabBeforePick(null);
  };

  // Landing page search trigger
  const handleHomeSearchNavigation = (query: string) => {
    setDatabaseSearchQuery(query);
    setActiveTab("database");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#212121] font-sans antialiased flex flex-col justify-between">
      
      {/* Premium Header Bar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo Identity */}
          <div onClick={() => setActiveTab("home")} className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#FFB300] flex items-center justify-center font-bold text-neutral-900 shadow-md">
              <Layers className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <span className="text-lg font-display font-black tracking-tight text-neutral-900 block leading-none">
                BIOMap
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-secondary block mt-0.5">
                O‘ZBEKISTON
              </span>
            </div>
          </div>

          {/* Nav Links for Desktop screens */}
          <nav className="hidden md:flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <button
              onClick={() => { setActiveTab("home"); setFocusedObsId(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "home" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <HomeIcon className="w-4 h-4 text-brand-secondary" />
              <span>Bosh sahifa</span>
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "map" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Compass className="w-4 h-4 text-brand-secondary" />
              <span>GIS Xarita</span>
            </button>
            <button
              onClick={() => { setActiveTab("database"); setFocusedObsId(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "database" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-brand-secondary" />
              <span>O‘simliklar</span>
            </button>
            <button
              onClick={() => { setActiveTab("scanner"); setFocusedObsId(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "scanner" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Cpu className="w-4 h-4 text-brand-secondary animate-pulse" />
              <span>AI Skaner</span>
            </button>
            <button
              onClick={() => { setActiveTab("stats"); setFocusedObsId(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "stats" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <BarChart className="w-4 h-4 text-brand-secondary" />
              <span>Statistika</span>
            </button>
            <button
              onClick={() => { setActiveTab("researcher"); setFocusedObsId(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "researcher" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-brand-secondary" />
              <span>Kuzatuv qo'shish</span>
            </button>
            <button
              onClick={() => { setActiveTab("profile"); setFocusedObsId(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
                activeTab === "profile" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <UserIcon className="w-4 h-4 text-brand-secondary" />
              <span>{currentUser ? `Profil (${currentUser.fullname.split(" ")[0]})` : "Kirish"}</span>
            </button>
            {deferredPrompt && (
              <button
                onClick={async () => {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  console.log(`User response to the install prompt: ${outcome}`);
                  setDeferredPrompt(null);
                  setShowInstallBanner(false);
                  localStorage.setItem("biomap_install_dismissed", "true");
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer animate-pulse"
              >
                <Download className="w-4 h-4" />
                <span>Ilovani yuklash</span>
              </button>
            )}
          </nav>

          {/* Time indicator (clocks) */}
          <div className="flex items-center gap-4 text-xs font-mono font-bold text-neutral-500 bg-neutral-50 px-3.5 py-1.5 rounded-full border border-neutral-100">
            <div className="flex items-center gap-1 text-emerald-600 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeStr}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
        {activeTab === "home" && (
          <Home
            onStartPlatform={() => setActiveTab("map")}
            onSearchNavigation={handleHomeSearchNavigation}
            currentUser={currentUser}
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            news={news}
            onAddNews={handleAddNews}
            onDeleteNews={handleDeleteNews}
            users={users}
            observations={observations}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === "map" && (
          <GisMap
            observations={observations}
            onSelectObservation={(obs) => setFocusedObsId(obs.id)}
            selectedObsId={focusedObsId}
            onAddObservationFromMap={handleMapClickCoordinatePick}
            isPickingCoords={isPickingCoords}
            mapFocusCoords={mapFocusCoords}
          />
        )}
        {activeTab === "database" && (
          <PlantDatabase
            onShowOnMap={handleShowPlantOnMap}
            observations={observations}
            initialSearchQuery={databaseSearchQuery}
            onSearchQueryChange={setDatabaseSearchQuery}
          />
        )}
        {activeTab === "scanner" && (
          <AiScanner
            onAddRecognizedObservation={handleAddAiObservation}
            onNavigateToMap={() => setActiveTab("map")}
            currentUser={currentUser}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === "stats" && (
          <StatsDashboard
            observations={observations}
            currentUser={currentUser}
          />
        )}
        {/* ResearcherPanel: Har doim mount holida, faqat CSS bilan yashiriladi
             Shu tufayli "Xaritadan Bosib Tanlash" bosganda forma state saqlanib qoladi */}
        <div style={{ display: activeTab === "researcher" ? "block" : "none" }}>
          <ResearcherPanel
            onAddNewObservation={handleAddManualObservation}
            onStartMapPick={() => {
              setPrevTabBeforePick(activeTab);
              setIsPickingCoords(true);
              setActiveTab("map");
            }}
            pickedCoords={pickedCoords}
            onNavigateToMap={() => setActiveTab("map")}
            currentUser={currentUser}
            onNavigateToTab={setActiveTab}
          />
        </div>
        {activeTab === "admin" && (
          <AdminPanel
            observations={observations}
            users={users}
            documents={documents}
            onApproveObservation={handleApproveObservation}
            onRejectObservation={handleDeleteObservation}
            onDeleteObservation={handleDeleteObservation}
            news={news}
            onApproveNews={handleApproveNews}
            onDeleteNews={handleDeleteNews}
            onApproveDocument={handleApproveDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
        {activeTab === "profile" && (
          <UserProfile
            currentUser={currentUser}
            allUsers={users}
            onRegister={(newUser) => {
              const u: User = {
                ...newUser,
                id: `user_${Date.now()}`,
                registeredAt: new Date().toISOString()
              };
              setUsers(prev => [u, ...prev]);
              setCurrentUser(u);
              void upsertEntity("users", u);
            }}
            onLogin={(userId) => {
              const u = users.find(x => x.id === userId);
              if (u) setCurrentUser(u);
            }}
            onAuthenticated={persistAuthenticatedUser}
            onLogout={() => {
              setCurrentUser(null);
              if (supabase) {
                void supabase.auth.signOut();
              }
            }}
            observations={observations}
            onDeleteObservation={handleDeleteObservation}
            onEditObservation={handleEditObservation}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
            }}
            documents={documents}
            onDeleteDocument={handleDeleteDocument}
            news={news}
            onDeleteNews={handleDeleteNews}
          />
        )}
      </main>

      {/* Floating mobile navigation bar (Mobile first styling) */}
      <footer className="md:hidden sticky bottom-0 bg-white/95 backdrop-blur-lg border-t border-neutral-200 z-50 py-3 px-4 shadow-xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "home" ? "text-brand-secondary scale-105" : "text-neutral-400"
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span>Bosh sahifa</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "map" ? "text-brand-secondary scale-105" : "text-neutral-400"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Xarita</span>
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "database" ? "text-brand-secondary scale-105" : "text-neutral-400"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Katalog</span>
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "scanner" ? "text-brand-secondary scale-105 animate-pulse" : "text-neutral-400"
            }`}
          >
            <Cpu className="w-5 h-5" />
            <span>AI Scan</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "stats" ? "text-brand-secondary scale-105" : "text-neutral-400"
            }`}
          >
            <BarChart className="w-5 h-5" />
            <span>Statistika</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "profile" ? "text-brand-secondary scale-105" : "text-neutral-400"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>{currentUser ? "Profil" : "Kirish"}</span>
          </button>
        </div>
      </footer>

      {/* Floating PWA Install Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 bg-neutral-900 text-white rounded-2xl p-4 shadow-2xl border border-neutral-800 z-50 animate-fade-in flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB300] flex items-center justify-center font-bold text-neutral-900 shadow-md shrink-0">
              <Layers className="w-5 h-5 text-neutral-950" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-50 tracking-tight leading-tight">
                BIOMap ilovasini o‘rnating!
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-normal">
                Smartfoningiz yoki kompyuteringizda tezroq va qulayroq ishlash uchun ilovani yuklab oling.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 text-xs font-bold pt-1">
            <button
              onClick={() => {
                setShowInstallBanner(false);
                localStorage.setItem("biomap_install_dismissed", "true");
              }}
              className="px-3 py-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Keyinroq
            </button>
            <button
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  console.log(`User response to the install prompt: ${outcome}`);
                  setDeferredPrompt(null);
                  setShowInstallBanner(false);
                  localStorage.setItem("biomap_install_dismissed", "true");
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
            >
              O‘rnatish (Yuklab olish)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
