import React, { useState } from "react";
import { 
  Search, 
  Compass, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  Layers, 
  CheckCircle2,
  FileText,
  UploadCloud,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  File,
  Plus,
  Maximize2,
  Award
} from "lucide-react";
import { SEEDED_PLANTS } from "../data/plants";
import { User, PdfDocument, NewsArticle, Observation } from "../types";
import map3dBackground from "../../assets/uzbekistan_3d_map.png";

interface HomeProps {
  onStartPlatform: () => void;
  onSearchNavigation: (query: string) => void;
  currentUser: User | null;
  documents: PdfDocument[];
  onAddDocument: (newDoc: PdfDocument) => void;
  onDeleteDocument: (docId: string) => void;
  news: NewsArticle[];
  onAddNews: (newArticle: NewsArticle) => void;
  onDeleteNews: (articleId: string) => void;
  users: User[];
  observations: Observation[];
  onNavigateToTab: (tab: any) => void;
}

export const SEEDED_PDFS: PdfDocument[] = [
  {
    id: "pdf-1",
    title: "O'zbekiston tog' lolalarining bioekologiyasi va introduksiyasi",
    author: "Prof. S. Tojibayev, Dr. S. Nuraliyev",
    date: "2025-09",
    size: "3.2 MB",
    category: "Kitob",
    pagesCount: 4,
    description: "Hisor tog' tizmasi va Pomir-Oloy tog' tizimining endemik lola (Tulipa) turlarini monitoring qilish, areallarni muhofaza etish chora-tadbirlariga doir darslik qo'llanma.",
    authorInstitution: "O'zbekiston Fanlar akademiyasi Botanika instituti",
    authorRole: "tadqiqotchi",
    isApproved: true,
    pages: [
      "MUNDARIJA & ANNOTATSIYA\n\nUshbu kitobda O'zbekiston Respublikasi Qizil kitobiga kiritilgan lola (Tulipa L.) turkumiga mansub kamyob va yo'qolish xavfi ostidagi turlarning zamonaviy holati, tarqalishi hamda bioekologik xususiyatlari keltirilgan.\n\nKeyingi yillarda iqlim o'zgarishi va chorvachilik tufayli lola areallari qisqarmoqda. GIS xaritalari hamda monitoring natijalari ushbu maydonlarni raqamli muhofaza qilish uchun zamin yaratadi.",
      "I-BOB. LOLA TURLARINING ADABIYOT TAHLILI VA TAKSONOMIYASI\n\nTyan-Shan va Pomir-Oloy tog'lari lolalarning kelib chiqish markazi hisoblanadi. O'zbekistonda ushbu turkumning 34 dan ortiq turi yovvoyi holda o'sadi, shulardan 19 turi Qizil kitobga kiritilgan.\n\n- Tulipa fosteriana (Foster lolasi): Eng jozibador yirik lolalardan biri. Pomir-Oloy endemigi.\n- Tulipa greigii (Greig lolasi): Barglarida to'q binafsha rangli dog'lari borligi bilan boshqa lolalardan ajralib turadi.",
      "II-BOB. EKOLOGIK MONITORING VA GEOGRAFIK AREALLAR (GIS tahlil)\n\nBotanika institutining dala ekpeditsiyalari Toshkent, Jizzax, Qashqadaryo va Surxondaryo tog'li tizma hududlarida 120 ta monitoring nuqtalarini belgiladi. \n\nKattaliklar jadvali (Populyatsiya zichligi % m²):\n1. Foster lolasi (Chimyon): ~4-6 nusxa/m² (Kamayuvchi)\n2. Shrenk lolasi (Qizilqum): ~2-3 nusxa/m² (Barqaror)\n3. Buyse lolasi (Zarafshon): ~1-2 nusxa/m² (Xavf ostida)",
      "TAVSIYALAR VA XULOSA\n\n- Kamyob lolalar o'sadigan areallarni mikro-buyurtmaxona sifatida muhofazaga olish.\n- Mahalliy aholi orasida 'Qizil kitob loyihasi' bo'yicha tushuntirish ishlarini olib govish va gullarni uzishni taqiqlash.\n- Har yili GIS datchiklari orqali populatsiya o'zgarishlarini raqamli reestrga kiritish."
    ]
  },
  {
    id: "pdf-2",
    title: "Kovrak turkumi (Ferula L.) dorivor turlarini saqlash va barqaror foydalanish",
    author: "N. Beshko, A. Mahmudov",
    date: "2026-02",
    size: "1.8 MB",
    category: "Qo'llanma",
    pagesCount: 3,
    description: "Sariq kovrak (Ferula assa-foetida) va uning shifobaxsh yelimi (smolasi) ekstratsiyasi areallarini GIS teleradar monitoringi yordamida himoya qilish uslubiy qo'llanmasi.",
    authorInstitution: "O'zbekiston Fanlar akademiyasi Botanika instituti",
    authorRole: "tadqiqotchi",
    isApproved: true,
    pages: [
      "KIRISH: KOVRAKLARNING REZINALASHISH MUAMMOSI\n\nFerula assa-foetida O'zbekistonning cho'l va yarim cho'l zonalarida muhim iqtisodiy ahamiyatga ega. Biroq, noqonuniy ravishda shira olish ushbu o'simlikning tabiiy ko'payishiga jiddiy zarba bermoqda.\n\nUshbu qo'llanmada kovrak o'simligini muttasil va xavfsiz ekspluatatsiya qilish qoidalari xaritada ko'rsatiladi.",
      "KOVRAK MONITORING USULLARI\n\nGIS karkas tahlili yordamida o'simlik tarqalgan hududlarda maxsus grid to'ri tuzilgan. Har bir tadqiqot nuqtasi platforma ma'lumotlar bazasida saqlanadi.\n\nTaqiqlangan areallar ro'yxati (2026 monitoringi):\n- Buxoro viloyati, Shofirkon qumlik areali\n- Qashqadaryo viloyati, Muborak cho'l massivi\n- Navoiy viloyati, Tomdi tog' massivlari",
      "XULOSA VA REKOMENDATSIYALAR\n\n- Kovrak shirasini yig'ishda o'simlik ildizining 30% dan ko'p qismini shikastlamaslik.\n- Shiradan so'ng sun'iy urug'lantirish va maydonlarni dam olish (vadashtirish) rejimiga o'tkazish.\n- Har bir litsenziyaga ega bo'lgan fermer xo'jaligiga 'BIOMap' orqali geo-loyiha hudud biriktirish."
    ]
  },
  {
    id: "pdf-3",
    title: "G'arbiy Tyan-Shan noyob o'simliklari raqamli floristik xaritasi",
    author: "Fanlar Akademiyasi Botanika Instituti",
    date: "2026-05",
    size: "4.5 MB",
    category: "Ilmiy maqola",
    pagesCount: 3,
    description: "Ushbu tadqiqotda G'arbiy Tyan-Shan tizmasidagi Qizil kitob florasini kartografik modellashtirish, iqlim o'zgarishi ssenariylariga muvofiq o'zgarish bashoratlari bayon etilgan.",
    authorInstitution: "O'zbekiston Fanlar akademiyasi Botanika instituti",
    authorRole: "tadqiqotchi",
    isApproved: true,
    pages: [
      "MUQADDIMA VA METODOLOGIYA\n\nG'arbiy Tyan-Shan o'zida 2200 dan ortiq yuksak o'simlik turini mujassam etgan bioxilma-xillik 'issiq nuqtasi' (biodiversity hotspot) hisoblanadi.\n\nTadqiqotda Sentinel-2 sun'iy yo'ldosh xaritasi hamda dala koordinat nuqtalari asosidagi MaxEnt modeli tahlil qilingan.",
      "NATIJALAR VA ASSORTIMENT TAHLILI\n\nAreallar migratsiyasi o'rganilganda, bir qator endemik turlar tog'ning yuqori kamarlariga balandlashayotgani guvohi bo'lindi. \n\nIqlimiy migratsiya koeffisiyentlari:\n- Juno lolasi: Yillik +15m tepaga siljish\n- Shrenk lolasi (pasttekislik): janubga qarab qisqarish areali (-8.2%)\n- Dorema oltingul: barqaror tog' yonbag'irlarida",
      "XULOSAVIY PROTOKOLLAR\n\nTiyanshan o'rmon va cho'l florasini saqlash uchun transchegaraviy muhofaza etiladigan hududlarni kengaytirish va raqamli monitoringni 'BIOMap' tizimiga to'liq integratsiya qilish lozim."
    ]
  }
];

export const SEEDED_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "Surxondaryoda fanda yangi lola turi kashf etildi: Tulipa microapiculata",
    category: "kashfiyot",
    date: "14-May, 2025",
    summary: "O'zbekiston Fanlar akademiyasi Botanika instituti olimlari Hisor tog' tizmasi tizmali areallaridan noyob, fanga noma'lum lola populatsiyasini aniqlashdi. Ushbu tur o'zining qip-qizil gulbarglari va kichik o'lchami bilan ajralib turib, endemik hisoblanadi.",
    content: "O'zbekiston Fanlar akademiyasi Botanika instituti olimlari Hisor tog' tizmasi tizmali areallaridan noyob, fanga noma'lum lola populatsiyasini aniqlashdi. Urg'ochi yoki erkak datchiklar tog' etaklarida olib borgan ekspeditsiyalar natijasida yig'ilgan materiallarni tahlil qilib, lolaning ushbu yangi turini Tulipa microapiculata deb nomlashdi. Ushbu tur mahalliy populyatsiyada juda tor arealda tarqalgan bo'lib, zudlik bilan muhofazaga muhtoj.",
    source: "O'z FA Botanika Instituti",
    isApproved: true
  },
  {
    id: "news-2",
    title: "Dorivor Kovrak (Ferula) o'simligi areallari xaritalashtirildi",
    category: "monitoring",
    date: "28-Fevral, 2026",
    summary: "Cho'l va tog'oldi hududlarida dorivor hamda ekologik ahamiyatga ega bo'lgan Kovrak (Ferula assa-foetida) tabiiy zaxiralari kamayib borayotgani sababli sun'iy yo'ldosh va GIS texnologiyalari yordamida yagona raqamli monitoring xaritasi ishlab chiqildi.",
    content: "Cho'l va tog'oldi hududlarida dorivor hamda ekologik ahamiyatga ega bo'lgan Kovrak (Ferula assa-foetida) tabiiy zaxiralari kamayib borayotgani sababli sun'iy yo'ldosh va GIS texnologiyalari yordamida yagona raqamli monitoring xaritasi ishlab chiqildi. Ekologiya vazirligi va mutaxassislar areallarni muhofaza qilish uchun yangi qonuniy choralar ko'rmoqda hamda taqiqlangan maydonlarni kuzatmoqda.",
    source: "Ekologiya Vazirligi OAV",
    isApproved: true
  },
  {
    id: "news-3",
    title: "Zarafshon milliy bog'ida noyob o'simliklar ko'paytirildi",
    category: "muhofaza",
    date: "05-Aprel, 2026",
    summary: "Milliy bog' hududida Qizil kitobga kiritilgan 'Zarafshon chetinchasi' (Aflatunia sarmatica) urug'idan va ildizidan qayta tiklash harakatlari natijasida tabiiy populyatsiyalar areali 12% ga kengaydi va muhofaza choralari kuchaytirildi.",
    content: "Milliy bog' hududida Qizil kitobga kiritilgan 'Zarafshon chetinchasi' (Aflatunia sarmatica) urug'idan va ildizidan qayta tiklash harakatlari natijasida tabiiy populyatsiyalar areali 12% ga kengaydi va muhofaza choralari kuchaytirildi. Mahalliy ekologlar ko'chatlarni parvarish qilishning yangi usullarini muvaffaqiyatli qo'llashdi.",
    source: "Yuz.uz / Ekologiya",
    isApproved: true
  },
  {
    id: "news-4",
    title: "Yangi nashr: O'zbekiston Qizil Kitobining yangilangan nashri tayyorlanmoqda",
    category: "nashr",
    date: "12-Yanvar, 2026",
    summary: "O'zbekiston Fanlar akademiyasi Botanika instituti olimlari 2026-yilda chop etilishi kutilayotgan yangi nashr uchun 30 dan ortiq o'simlik turlarini yangi toifalar bo'yicha baholashdi va xaritadagi areallari yangilandi.",
    content: "O'zbekiston Fanlar akademiyasi Botanika instituti olimlari 2026-yilda chop etilishi kutilayotgan yangi nashr uchun 30 dan ortiq o'simlik turlarini yangi toifalar bo'yicha baholashdi va xaritadagi areallari yangilandi. Ushbu nashr biologik xilma-xillikni asrashda muhim qo'llanma bo'lib xizmat qiladi.",
    source: "Fanlar Akademiyasi Axboroti",
    isApproved: true
  }
];

export default function Home({ 
  onStartPlatform, 
  onSearchNavigation,
  currentUser,
  documents,
  onAddDocument,
  onDeleteDocument,
  news,
  onAddNews,
  onDeleteNews,
  users,
  observations,
  onNavigateToTab
}: HomeProps) {
  const [activeTab, setActiveTab] = useState<"umumiy" | "yangiliklar" | "kutubxona">("umumiy");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [selectedNewsCat, setSelectedNewsCat] = useState<string>("barchasi");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // News Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState<NewsArticle["category"]>("kashfiyot");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsSource, setNewsSource] = useState("");

  // PDF Submission Form State
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docAuthor, setDocAuthor] = useState("");
  const [docInstitution, setDocInstitution] = useState("");
  const [docRole, setDocRole] = useState<"talaba" | "o'qituvchi" | "tadqiqotchi" | "boshqa">("talaba");
  const [docCategory, setDocCategory] = useState<PdfDocument["category"]>("Ilmiy maqola");
  const [docDescription, setDocDescription] = useState("");

  // PDF Articles and Guides management states
  const [selectedDoc, setSelectedDoc] = useState<PdfDocument | null>(null);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [uploadingState, setUploadingState] = useState<{ progress: number; fileName: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>("barchasi");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"info" | "error" | "success">("info");
  const [pendingDeleteDocId, setPendingDeleteDocId] = useState<string | null>(null);
  const [docSearchQuery, setDocSearchQuery] = useState("");

  const filteredNews = news.filter(item => {
    if (!item.isApproved) return false;
    const matchesSearch = item.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(newsSearchQuery.toLowerCase());
    const matchesCat = selectedNewsCat === "barchasi" || item.category === selectedNewsCat;
    return matchesSearch && matchesCat;
  });

  const handleSubmitNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsContent.trim() || !newsSource.trim()) {
      setToastMessage("Iltimos, barcha maydonlarni to'ldiring.");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const newArticle: NewsArticle = {
      id: "news-" + Date.now(),
      title: newsTitle.trim(),
      category: newsCategory,
      date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      summary: newsSummary.trim(),
      content: newsContent.trim(),
      source: newsSource.trim(),
      userId: currentUser?.id,
      isApproved: false // Admin approval required
    };

    onAddNews(newArticle);
    
    // Reset Form
    setNewsTitle("");
    setNewsSummary("");
    setNewsContent("");
    setNewsSource("");
    setShowSubmitModal(false);

    setToastMessage("Yangilik yuborildi. Admin tasdiqlagach chop etiladi.");
    setToastType("success");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredDocs = documents.filter(doc => {
    if (!doc.isApproved) return false;
    const matchesSearch = doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                          doc.author.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesCat = docCategoryFilter === "barchasi" || doc.category === docCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const getInstitutionRankings = () => {
    const scores: Record<string, { name: string; docCount: number; obsCount: number; points: number }> = {};

    documents.forEach(doc => {
      if (!doc.isApproved) return;
      const inst = doc.authorInstitution || "Mustaqil";
      if (!scores[inst]) {
        scores[inst] = { name: inst, docCount: 0, obsCount: 0, points: 0 };
      }
      scores[inst].docCount += 1;
      scores[inst].points += 10;
    });

    observations?.forEach(obs => {
      if (!obs.isApproved) return;
      const matchedUser = users?.find(u => u.fullname === obs.tadqiqotchi || u.id === obs.userId);
      const inst = matchedUser ? matchedUser.organization : "Mustaqil";
      if (!scores[inst]) {
        scores[inst] = { name: inst, docCount: 0, obsCount: 0, points: 0 };
      }
      scores[inst].obsCount += 1;
      scores[inst].points += 5;
    });

    users?.forEach(u => {
      const inst = u.organization;
      if (inst) {
        if (!scores[inst]) {
          scores[inst] = { name: inst, docCount: 0, obsCount: 0, points: 0 };
        }
        scores[inst].points += 1;
      }
    });

    return Object.values(scores)
      .filter(s => s.name !== "Mustaqil")
      .sort((a, b) => b.points - a.points);
  };

  // Drag and drop events logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setToastMessage("Faqat PDF formatidagi ilmiy hujjat va qo'llanmalarni yuklash mumkin.");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setSelectedDocFile(file);
    setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    setDocAuthor(currentUser ? currentUser.fullname : "");
    setDocInstitution(currentUser ? currentUser.organization : "");
    setDocRole("talaba");
    setDocCategory("Ilmiy maqola");
    setDocDescription("");
    setShowDocUploadModal(true);
  };

  const handleSubmitDocMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocFile) return;

    setShowDocUploadModal(false);
    const file = selectedDocFile;
    setUploadingState({ progress: 15, fileName: file.name });
    
    // Simulate natural upload and security check timeline
    let prog = 15;
    const interval = setInterval(() => {
      prog += 25;
      if (prog >= 100) {
        clearInterval(interval);
        setUploadingState({ progress: 100, fileName: file.name });
        
        setTimeout(() => {
          const fileUrl = URL.createObjectURL(file);
          const fileSizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
          
          const newDoc: PdfDocument = {
            id: "uploaded-" + Date.now(),
            title: docTitle.trim() || file.name.replace(/\.[^/.]+$/, ""),
            author: docAuthor.trim() || (currentUser ? currentUser.fullname : "Mustaqil Tadqiqotchi"),
            date: new Date().toISOString().split('T')[0],
            size: fileSizeStr,
            category: docCategory,
            pagesCount: 1,
            description: docDescription.trim() || "Platformaga muvaffaqiyatli yuklangan hamda o'simliklarni saqlash dasturiga kiritilgan ilmiy hisobot / loyiha qo'llanmasi.",
            pages: [
              `HUJJAT MAZMUNI PREVIEW & XULOSA\n\nYuklangan fayl: ${file.name}\nFayl hajmi: ${fileSizeStr}\nTahlil sanasi: ${new Date().toLocaleDateString()}\n\nTizimda ushbu PDF hujjatining raqamli integratsiyasi tugatildi. PDF plagin yordamida asl nusxasini ko'rish uchun quyidagi 'Asl PDF Faylini Ochish' tugmasini bosing.`
            ],
            downloadUrl: fileUrl,
            userId: currentUser?.id,
            authorInstitution: docInstitution.trim() || (currentUser ? currentUser.organization : "Mustaqil"),
            authorRole: docRole,
            isApproved: false // Admin tasdiqlashi kerak
          };

          onAddDocument(newDoc);
          setUploadingState(null);
          setSelectedDocFile(null);

          setToastMessage("Hujjat yuborildi. Admin tasdiqlagach kutubxonada chop etiladi.");
          setToastType("success");
          setTimeout(() => setToastMessage(null), 4000);
        }, 500);
      } else {
        setUploadingState({ progress: prog, fileName: file.name });
      }
    }, 120);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteDocId(id);
  };

  const confirmDeleteDoc = () => {
    if (pendingDeleteDocId) {
      onDeleteDocument(pendingDeleteDocId);
      if (selectedDoc?.id === pendingDeleteDocId) {
        setSelectedDoc(null);
      }
      setPendingDeleteDocId(null);
      setToastMessage("Maqola muvaffaqiyatli o'chirildi.");
      setToastType("success");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchNavigation(searchQuery.trim());
    } else {
      onStartPlatform();
    }
  };

  return (
    <div id="home_splash_root" className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col gap-12 select-none animate-fade-in">
      
      {/* Editorial Header Section */}
      <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto mt-6">
        
        {/* Large BIOMap Premium Digital Logo */}
        <div id="biomap_big_logo" className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center font-display text-neutral-900 text-3xl font-extrabold shadow-2xl relative">
            <Layers className="w-8 h-8 text-neutral-950" />
            {/* High fidelity pulsing point */}
            <span className="w-4 h-4 rounded-full bg-white absolute -top-1 -right-1 block animate-ping opacity-75" />
            <span className="w-3 h-3 rounded-full bg-amber-600 absolute -top-0.5 -right-0.5 block" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight text-neutral-900 leading-none">
              BIOMap
            </h1>
            <span className="text-[10px] font-mono font-bold tracking-widest text-brand-secondary block mt-1 uppercase">
              GIS & BOTANICAL AI CORES
            </span>
          </div>
        </div>

        {/* Title & Uzbek Subtitle */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl md:text-3.5xl font-display font-extrabold text-neutral-950 tracking-tight leading-tight">
            O‘zbekistonning noyob va Qizil kitobga kiritilgan o‘simliklarini kuzatish platformasi
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl">
            Sun'iy intellekt yordamida florani aniqlash, GIS texnologiyalari orqali areallarni monitoring qilish va O‘zbekiston Fanlar akademiyasi Botanika instituti dala hisobotlarini jamlash milliy tizimi.
          </p>
        </div>

        {/* Search Panel overlay */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-xl relative flex items-center bg-white p-2 rounded-3xl shadow-xl border border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 ml-3 shrink-0" />
          <input
            type="text"
            required
            placeholder="Shrenk lolasi, za'faron yoki oilasini yozing..."
            className="w-full bg-transparent border-none text-neutral-800 text-sm focus:outline-none placeholder-neutral-400 pl-2.5 py-2.5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs tracking-wide px-5 py-3 rounded-2xl transition"
          >
            Skanerlash
          </button>
        </form>

        {/* Premium Category Tabs Navigation */}
        <div id="home_categories_navigation" className="w-full max-w-xl mx-auto flex p-1 bg-neutral-100 rounded-2xl border border-neutral-200 mt-2">
          <button
            id="tab_btn_umumiy"
            type="button"
            onClick={() => setActiveTab("umumiy")}
            className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-display font-bold transition duration-200 flex items-center justify-center gap-2 select-none ${
              activeTab === "umumiy"
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-850 hover:bg-white/50"
            }`}
          >
            <Compass className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
            <span>Kuzatuv Teleradari</span>
          </button>

          <button
            id="tab_btn_yangiliklar"
            type="button"
            onClick={() => setActiveTab("yangiliklar")}
            className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-display font-bold transition duration-200 flex items-center justify-center gap-2 select-none ${
              activeTab === "yangiliklar"
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-850 hover:bg-white/50"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Flora Yangiliklari</span>
          </button>

          <button
            id="tab_btn_kutubxona"
            type="button"
            onClick={() => setActiveTab("kutubxona")}
            className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-display font-bold transition duration-200 flex items-center justify-center gap-2 select-none ${
              activeTab === "kutubxona"
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-850 hover:bg-white/50"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>PDF Kutubxona</span>
          </button>
        </div>

      </div>

      {activeTab === "umumiy" && (
        <>
          {/* Modern Interactive Map Preview Panel */}
          <div
            id="home_map_preview"
            onClick={onStartPlatform}
            className="relative w-full h-[280px] md:h-[350px] rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200 cursor-pointer group flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${map3dBackground})` }}
          >
            {/* Dark glassmorphic overlay for maximum text readability and sci-fi aesthetic */}
            <div className="absolute inset-0 bg-neutral-950/70 group-hover:bg-neutral-950/60 transition duration-300 pointer-events-none" />

            {/* Background Uzbekistan stylized lines rendering */}
            <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
              <div className="absolute left-[30%] h-full border-r border-[#FFB300] border-dashed" />
              <div className="absolute left-[70%] h-full border-r border-[#FFB300] border-dashed" />
              <div className="absolute top-[40%] w-full border-b border-[#FFB300] border-dashed" />
              
              <svg viewBox="0 0 800 450" className="w-full h-full">
                <path
                  d="M 100,240 L 100,140 L 360,140 L 420,200 L 500,130 L 540,170 L 600,160 L 680,170 L 670,210 L 610,210 L 550,225 L 540,270 L 500,370 L 450,310 L 320,290 L 245,260 L 180,260 Z"
                  fill="rgba(255, 179, 0, 0.03)"
                  stroke="#FFB300"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

        {/* Central visual text launcher */}
        <div className="z-10 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center text-neutral-950 shadow-lg group-hover:scale-110 transition duration-300">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white group-hover:text-amber-400 transition">
              GIS Kuzatuv Teleradarini Boshlash
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              O‘zbekiston xaritasidagi barcha o‘simliklar telemetryasini kuzatish
            </p>
          </div>
        </div>

        {/* Floating cards representing high tech visual metrics on home preview */}
        <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] text-brand-primary border border-white/5 font-mono select-none hidden md:block">
          <span>LAT_MERIDIAN: CENTRAL ASIA</span>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-neutral-100 border border-white/5 flex items-center gap-2 select-none hidden md:flex text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-neutral-300">Tizim holati: Onlayn Kuzatuv</span>
        </div>
      </div>

      {/* Feature Bento Highlights row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core 1: AI scan */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm flex gap-4 items-start hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-brand-primary shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-neutral-900">AI Skaner laboratoriyasi</h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Yo'lkada yoki dalada topilgan o'simlikni rasmga oling. Kamera va sun'iy intellekt sekunlar ichida turni aniqlab, Qizil Kitob tahlilini beradi.
            </p>
          </div>
        </div>

        {/* Core 2: Dynamic database */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm flex gap-4 items-start hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-neutral-900">Taxonomik Qizil Kitob</h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              O'simliklar oilasi, tarqalish areali va himoya maqomi bo'yicha tartiblangan to'liq ilmiy katalog hamda dorivor xususiyatlar shajarasi.
            </p>
          </div>
        </div>

        {/* Core 3: GPS mapping */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm flex gap-4 items-start hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-neutral-900">Dala nazoratchisi paneli</h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Botanika instituti tadqiqotchilari uchun mo'ljallangan yagona reestr: dala koordinat nuqtalarini qo'shish va geo-nazorat monitoringini yozish.
            </p>
          </div>
        </div>

      </div>
        </>
      )}

      {/* Latest Flora News & Discoveries Panel (Google Search Grounded) */}
      {activeTab === "yangiliklar" && (
        <div id="flora_news_panel" className="bg-white rounded-[32px] p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col gap-6 animate-fade-in mt-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                <span>Noyob Flora Yangiliklari & Kashfiyotlar</span>
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Google Search va O'zbekiston Fanlar akademiyasi ma'lumotlariga ko'ra o'simliklar dunyosidagi so'nggi ilmiy yangiliklar.
              </p>
            </div>
          </div>
          
          {/* Quick inline search for news */}
          <div className="bg-neutral-50 border border-neutral-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 w-full md:w-64">
            <Search className="w-4 h-4 text-neutral-450 shrink-0" />
            <input
              type="text"
              placeholder="Yangiliklardan qidirish..."
              className="bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
              value={newsSearchQuery}
              onChange={(e) => setNewsSearchQuery(e.target.value)}
            />
          </div>
        </div>
          {/* Categories toggles for news */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["barchasi", "kashfiyot", "monitoring", "muhofaza", "nashr"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedNewsCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize tracking-wide select-none ${
                  selectedNewsCat === cat
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat === "barchasi" ? "Barcha yangiliklar" : cat}
              </button>
            ))}
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition select-none shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yangilik yuklash</span>
            </button>
          )}
        </div>

        {/* News Cards list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-neutral-450 text-xs italic">
              Mos keluvchi maqola yoki yangilik topilmadi.
            </div>
          ) : (
            filteredNews.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className="bg-neutral-50 hover:bg-amber-500/[0.02] border border-neutral-200/60 p-5 rounded-2.5xl cursor-pointer hover:border-amber-300 transition flex flex-col justify-between hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.category === "kashfiyot" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      item.category === "monitoring" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                      item.category === "muhofaza" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-neutral-450 font-mono font-medium">{item.date}</span>
                  </div>

                  <h4 className="text-sm font-display font-black text-neutral-900 leading-snug group-hover:text-amber-600 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed mt-2.5">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4.5 pt-3 border-t border-neutral-100 text-[10px] text-neutral-400 font-mono font-bold">
                  <span>Manba: {item.source}</span>
                  <span className="text-amber-600 group-hover:underline flex items-center gap-0.5">
                    Batafsil o'qish ➔
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected news article details modal overlay */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 animate-slide-up flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-neutral-150 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-200">
                    {selectedArticle.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">{selectedArticle.date}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-7 h-7 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 transition"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-xl font-display font-black text-neutral-900 leading-tight">
                {selectedArticle.title}
              </h3>

              <div className="bg-amber-500/[0.02] border border-amber-200/50 rounded-2xl p-4 text-xs italic text-neutral-600 leading-relaxed">
                "{selectedArticle.summary}"
              </div>

              <div className="text-xs text-neutral-700 leading-relaxed font-normal flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
                {selectedArticle.content.split('\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-neutral-150 pt-5 mt-2">
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span>Tizim: Google Search Grounded • </span>
                  <span className="font-bold text-neutral-500">{selectedArticle.source}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* News upload form modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <form onSubmit={handleSubmitNews} className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 animate-scale-up flex flex-col gap-4 text-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-150 pb-4">
                <h3 className="text-lg font-display font-black text-neutral-950 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>Noyob Flora Yangiligi Yuborish</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="w-7 h-7 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-450 uppercase tracking-wider font-mono mb-1">
                    Yangilik Sarlavhasi
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                    placeholder="Masalan: Surxondaryoda yangi lola turi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-450 uppercase tracking-wider font-mono mb-1">
                    Yangilik rukni (Rukn)
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value as NewsArticle["category"])}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                  >
                    <option value="kashfiyot">Kashfiyot</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="muhofaza">Muhofaza</option>
                    <option value="nashr">Nashr</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-450 uppercase tracking-wider font-mono mb-1">
                  Qisqacha mazmuni (Summary)
                </label>
                <input
                  type="text"
                  required
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-medium"
                  placeholder="Maqolaning qisqacha mazmuni (karta yuzida ko'rinadi)..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-455 uppercase tracking-wider font-mono mb-1">
                  Maqola to'liq matni (Content)
                </label>
                <textarea
                  rows={4}
                  required
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-normal resize-none"
                  placeholder="Maqolaning to'liq ilmiy matnini kiriting..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-455 uppercase tracking-wider font-mono mb-1">
                  Manba yoki Muallif (Source)
                </label>
                <input
                  type="text"
                  required
                  value={newsSource}
                  onChange={(e) => setNewsSource(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                  placeholder="Masalan: O'z FA Botanika Instituti"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-150 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-250 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition duration-200 shadow-sm"
                >
                  <span>Yuborish</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      )}

      {/* ========================================== */}
      {/* Premium GIS & Scientific Document Library */}
      {/* ========================================== */}
      {activeTab === "kutubxona" && (
        <div 
          id="flora_library_panel" 
        className="bg-white rounded-[32px] p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col gap-6 animate-fade-in"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                <span>Ilmiy Maqolalar & Qo'llanmalar (PDF)</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full font-mono font-bold">Kutubxona</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                O'zbekiston noyob o'simliklarini saqlash qonun-qoidalari, xaritalash metodlari va rasmiy darslik hisobotlari.
              </p>
            </div>
          </div>

          {/* Document Search & Filter Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
            <div className="bg-neutral-50 border border-neutral-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 w-full md:w-56 shrink-0">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Kutubxonadan izlash..."
                className="bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories of PDF library */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["barchasi", "Kitob", "Ilmiy maqola", "Qo'llanma", "Loyiha"].map((cat) => (
              <button
                key={cat}
                onClick={() => setDocCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition select-none ${
                  docCategoryFilter === cat
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat === "barchasi" ? "Barcha hujjatlar" : cat}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-neutral-400 font-mono">
            Jami: {filteredDocs.length} tahliliy material
          </div>
        </div>

        {/* Split Grid: Upload Zone on Left, Document Cards list on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Block: Usability Compliant Upload Dropzone */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {!currentUser ? (
              <div className="border-2 border-dashed border-neutral-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] bg-neutral-50/50">
                <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-850">
                    Kutubxonaga hujjat yuklash
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-[180px] mx-auto leading-normal">
                    Fayl yuklash uchun tizimga kiring yoki ro'yxatdan o'ting
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab("profile")}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 rounded-xl font-bold text-xs shadow-md transition-all mt-2"
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            ) : (
              <div
                id="pdf_drag_drop_zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 transition duration-300 min-h-[220px] relative select-none cursor-pointer ${
                  dragActive 
                    ? "border-amber-500 bg-amber-500/[0.03]" 
                    : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-amber-300"
                }`}
              >
                <input
                  type="file"
                  id="file_upload_input"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                <label 
                  htmlFor="file_upload_input" 
                  className="cursor-pointer flex flex-col items-center gap-3 w-full"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                    <UploadCloud className="w-6 h-6 animate-bounce" />
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-neutral-850">
                      PDF hujjatini yuklash
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-[180px] mx-auto leading-normal">
                      Faylni bosing yoki bu yerga sudrab olib keling (maks: 15MB)
                    </p>
                  </div>
                  
                  <span className="text-[9px] bg-neutral-200/80 text-neutral-600 font-mono font-bold px-2.5 py-1 rounded-lg hover:bg-amber-500 hover:text-neutral-950 transition">
                    Fayl tanlash
                  </span>
                </label>

                {/* High Fidelity Simulated Uploading State Overlay */}
                {uploadingState && (
                  <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-4 z-10 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3 animate-spin">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  <span className="text-xs font-bold text-neutral-800 text-center truncate max-w-[180px]">
                    {uploadingState.fileName}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-1 font-mono">
                    Integratsiya tahlili: {uploadingState.progress}%
                  </span>
                  
                  {/* Progress bar container */}
                  <div className="w-36 h-1 w-full max-w-[160px] bg-neutral-100 rounded-full mt-3 overflow-hidden">
                    <div 
                      style={{ width: `${uploadingState.progress}%` }}
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Micro warning label */}
            <div className="bg-amber-500/[0.04] border border-amber-500/15 p-4 rounded-2xl flex gap-3 text-[10px] leading-relaxed text-neutral-600">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Eslatma:</span> Bizga yuklayotgan PDF maqolalaringiz intellektual xavfsizlik filtrlari tomonidan tekshiriladi va xaritalash bazasiga kiritiladi.
              </div>
            </div>

            {/* Institution Leaderboard Card */}
            <div className="bg-neutral-50/50 rounded-3xl p-5 border border-neutral-200 shadow-sm flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-850">Institutlar Reytingi</h4>
                  <p className="text-[9px] text-neutral-450 font-mono">Barcha hissa qo'shgan muassasalar</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {getInstitutionRankings().length === 0 ? (
                  <p className="text-[10px] text-neutral-400 italic text-center py-4">Reyting shakllanmoqda...</p>
                ) : (
                  getInstitutionRankings().slice(0, 5).map((inst, index) => (
                    <div 
                      key={inst.name}
                      className="bg-white border border-neutral-200/80 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition duration-150"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Rank Badge */}
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 font-mono ${
                          index === 0 ? "bg-amber-500 text-neutral-950" :
                          index === 1 ? "bg-stone-300 text-stone-900" :
                          index === 2 ? "bg-amber-700/20 text-amber-800" :
                          "bg-neutral-105 text-neutral-500"
                        }`}>
                          {index + 1}
                        </span>
                        
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-neutral-800 block truncate" title={inst.name}>
                            {inst.name.replace("O'zbekiston Fanlar akademiyasi ", "O'zFA ").replace("Toshkent Davlat ", "TD ").replace(" Universiteti", " Univ.").replace(" Instituti", " Inst.")}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono font-medium block">
                            {inst.docCount} maqola • {inst.obsCount} kuzatuv
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs font-black text-amber-600 font-mono">{inst.points}</span>
                        <span className="text-[8px] text-neutral-400 font-mono block leading-none">ball</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Block: Rendered PDF Documents collection list */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-3xl border border-neutral-150 text-neutral-450 text-xs italic">
                Ushbu ruknga mos birorta ilmiy maqola yoki PDF topilmadi.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setActivePageIdx(0);
                    }}
                    className="bg-neutral-50/50 hover:bg-white border border-neutral-200/70 hover:border-amber-400 p-4 rounded-2.5xl cursor-pointer hover:shadow-md transition flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Document Meta Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-amber-500/10 text-amber-700 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {doc.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-neutral-400 font-mono font-medium">{doc.size}</span>
                          {doc.id.startsWith("uploaded-") && (
                            <button
                              onClick={(e) => handleDeleteDoc(doc.id, e)}
                              className="text-neutral-400 hover:text-red-500 p-0.5 rounded transition"
                              title="Hujjatni o'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Doc Title & Description */}
                      <h4 className="text-xs font-black text-neutral-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition title-claim">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed mt-1.5">
                        {doc.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Trigger row */}
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-4 text-[9px] text-neutral-450 font-mono font-semibold">
                      <span className="truncate max-w-[120px]" title={doc.author}>Hammuallif: {doc.author}</span>
                      <span className="text-amber-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition font-bold uppercase tracking-wider text-[8px]">
                        Ko'rish (PDF) ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =================================================== */}
        {/* Live Interactive Premium Scientific PDF Reader Modal */}
        {/* =================================================== */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 select-none">
            <div className="bg-white rounded-[32px] max-w-4xl w-full h-[90vh] md:h-[82vh] shadow-2xl border border-neutral-200 animate-slide-up flex flex-col overflow-hidden">
              
              {/* Modal control bar header */}
              <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 shrink-0 shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs md:text-sm font-black text-white truncate max-w-xs md:max-w-md leading-normal">
                      {selectedDoc.title}
                    </h3>
                    <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                      Muallif: {selectedDoc.author} • {selectedDoc.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pr-1 shrink-0">
                  {/* Native Download button if available */}
                  {selectedDoc.downloadUrl ? (
                    <a
                      href={selectedDoc.downloadUrl}
                      download={`${selectedDoc.title}.pdf`}
                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-750 flex items-center justify-center text-white text-xs transition"
                      title="Yuklab olish (PDF)"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        setToastMessage("Asl nusxasi tizim backend arxivida saqlanmoqda (Himoyalangan).");
                        setToastType("info");
                        setTimeout(() => setToastMessage(null), 4000);
                      }}
                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-750 flex items-center justify-center text-neutral-400 text-xs transition"
                      title="Yuklab olish himoyalangan"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="w-9 h-9 bg-neutral-800 hover:bg-red-600 text-white rounded-xl flex items-center justify-center text-sm font-bold transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* PDF Document Controls Strip */}
              <div className="bg-neutral-100 border-b border-neutral-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-neutral-600 font-mono">
                <div className="flex items-center gap-3">
                  <span className="bg-white/85 px-2 py-1 rounded border border-neutral-200 font-bold block text-[10px]">
                    Masshtab: 100% Fit
                  </span>
                  <span className="text-[10px] hidden sm:inline text-neutral-400">
                    Rejim: Ilmiy o'quvchi v.2
                  </span>
                </div>

                {/* Page Navigation controllers */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={activePageIdx === 0}
                    onClick={() => setActivePageIdx(prev => Math.max(0, prev - 1))}
                    className={`w-7 h-7 rounded bg-white border border-neutral-200 flex items-center justify-center transition ${
                      activePageIdx === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-50"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-neutral-800 select-none">
                    Varoq: {activePageIdx + 1} / {selectedDoc.pagesCount}
                  </span>
                  <button
                    disabled={activePageIdx === selectedDoc.pagesCount - 1}
                    onClick={() => setActivePageIdx(prev => Math.min(selectedDoc.pagesCount - 1, prev + 1))}
                    className={`w-7 h-7 rounded bg-white border border-neutral-200 flex items-center justify-center transition ${
                      activePageIdx === selectedDoc.pagesCount - 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-50"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tekshirilgan material</span>
                </div>
              </div>

              {/* Main Reader Content Canvas Area */}
              <div className="flex-1 bg-stone-100 p-4 md:p-6 overflow-y-auto flex flex-col justify-between select-text">
                
                {selectedDoc.downloadUrl ? (
                  /* If actual file is uploaded, render side by side embedding and fallback sheet */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
                    {/* Native PDF Reader component */}
                    <div className="md:col-span-7 flex flex-col h-full bg-white rounded-2xl border border-neutral-250 p-2 shadow-sm min-h-[300px]">
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 uppercase px-2 mb-2">
                        <span>Fayl interfeys predprosmotri</span>
                        <span className="text-emerald-600 font-bold">PDF embedder faol</span>
                      </div>
                      <iframe 
                        src={`${selectedDoc.downloadUrl}#toolbar=0`} 
                        className="w-full h-full min-h-[280px] border-none rounded-xl"
                        title="Native PDF Viewer Web Frame"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Metadata text sheet */}
                    <div className="md:col-span-5 bg-white rounded-2xl border border-neutral-250 p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-600 mb-3 uppercase">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Tizim xulosaviy hisoboti</span>
                        </div>
                        <h4 className="text-xs font-black text-neutral-850 uppercase border-b pb-2 mb-3">
                          Hujjat tahlili
                        </h4>
                        <p className="text-[11px] leading-relaxed text-stone-600 font-normal whitespace-pre-line">
                          {selectedDoc.pages[activePageIdx]}
                        </p>
                      </div>

                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150 mt-4 text-[9px] font-semibold text-neutral-500 leading-normal">
                        Yuklangan ushbu loyiha materialingiz raqamli pasporti teleradar himoyasiga kiritildi va Botanika akademiyasi tomonidan tasdiqdan o'tkaziladi.
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Seeded document paper layout simulation */
                  <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl border border-stone-250 p-6 md:p-10 shadow-lg relative min-h-[460px] flex flex-col justify-between">
                    {/* Watermark branding */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                      <Layers className="w-80 h-80 text-neutral-900" />
                    </div>

                    {/* Document Header details */}
                    <div className="border-b-2 border-stone-200 pb-3 mb-6 flex justify-between items-end text-[10px] text-stone-400 font-mono uppercase">
                      <span>BIOMap Milliy Kutubxona Series</span>
                      <span>Sana: {selectedDoc.date}</span>
                    </div>

                    {/* PDF page content text */}
                    <div className="flex-1">
                      <div className="text-stone-800 text-xs leading-relaxed font-serif whitespace-pre-line text-justify pr-2">
                        {selectedDoc.pages[activePageIdx]}
                      </div>
                    </div>

                    {/* Document Footer details */}
                    <div className="border-t border-stone-200 pt-4 mt-8 flex justify-between items-center text-[10px] text-stone-400 font-mono">
                      <span>Varoq: {activePageIdx + 1} / {selectedDoc.pagesCount}</span>
                      <span>O'zbekiston Fanlar Akademiyasi</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal action bar footer */}
              <div className="bg-neutral-50 border-t border-neutral-250 p-4 shrink-0 flex items-center justify-between">
                <p className="text-[10px] text-neutral-400 font-mono">
                  Hujjat sarlavhasi identifikatori: #{selectedDoc.id}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Kutubxonaga qaytish
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PDF Metadata Upload Form Modal */}
        {showDocUploadModal && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <form onSubmit={handleSubmitDocMetadata} className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 animate-scale-up flex flex-col gap-4 text-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-150 pb-4">
                <h3 className="text-lg font-display font-black text-neutral-950 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>Kutubxonaga Hujjat Joylash</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="w-7 h-7 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-450 uppercase tracking-wider font-mono mb-1">
                    Hujjat Sarlavhasi
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                    placeholder="Masalan: O'simliklar monitoringi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-450 uppercase tracking-wider font-mono mb-1">
                    Hujjat Turi (Rukn)
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as PdfDocument["category"])}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                  >
                    <option value="Ilmiy maqola">Ilmiy maqola</option>
                    <option value="Kitob">Kitob</option>
                    <option value="Qo'llanma">Qo'llanma</option>
                    <option value="Loyiha">Loyiha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-455 uppercase tracking-wider font-mono mb-1">
                    Muallif (Ism, Familiya)
                  </label>
                  <input
                    type="text"
                    required
                    value={docAuthor}
                    onChange={(e) => setDocAuthor(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                    placeholder="Masalan: Ali Valiyev"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-455 uppercase tracking-wider font-mono mb-1">
                    Lavozimi / Roli
                  </label>
                  <select
                    value={docRole}
                    onChange={(e) => setDocRole(e.target.value as PdfDocument["authorRole"])}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                  >
                    <option value="talaba">Talaba</option>
                    <option value="o'qituvchi">O'qituvchi / Professor</option>
                    <option value="tadqiqotchi">Tadqiqotchi / Ilmiy xodim</option>
                    <option value="boshqa">Boshqa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-455 uppercase tracking-wider font-mono mb-1">
                  Muassasa / O'qish yoki Ish Joyi
                </label>
                <input
                  type="text"
                  required
                  value={docInstitution}
                  onChange={(e) => setDocInstitution(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-semibold"
                  placeholder="Masalan: Toshkent Davlat Agrar Universiteti"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-455 uppercase tracking-wider font-mono mb-1">
                  Qisqacha tavsifi (Hujjat haqida)
                </label>
                <textarea
                  rows={3}
                  required
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-neutral-250 rounded-xl text-xs p-2.5 outline-none focus:border-amber-500 focus:bg-white transition font-normal resize-none"
                  placeholder="Hujjatning mazmuni haqida qisqacha yozing..."
                />
              </div>

              <div className="bg-amber-500/[0.04] border border-amber-500/15 p-3 rounded-xl flex gap-2 text-[10px] leading-relaxed text-neutral-600">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Eslatma:</span> Hujjat admin tomonidan tasdiqlanganidan so'ng kutubxonada chop etiladi hamda muassasa reytingiga ball qo'shiladi.
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-150 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocUploadModal(false);
                    setSelectedDocFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-neutral-250 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition duration-200 shadow-sm"
                >
                  <span>Yuklash</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
      )}

      {/* Beautiful Inline Toast system */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[6000] bg-neutral-900 border border-neutral-750 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up text-xs font-semibold">
          <div className={`w-2.5 h-2.5 rounded-full ${
            toastType === "success" ? "bg-emerald-500" : toastType === "error" ? "bg-rose-500" : "bg-amber-500"
          }`} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white ml-2 transition text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Beautiful Custom Delete Confirmation Modal */}
      {pendingDeleteDocId && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[6000] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 border border-red-200">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <div>
              <h3 className="text-base font-display font-black text-neutral-900">Hujjatni o'chirish</h3>
              <p className="text-xs text-neutral-500 mt-2">
                Ushbu maqolani kutubxonadan o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setPendingDeleteDocId(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDeleteDoc}
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
