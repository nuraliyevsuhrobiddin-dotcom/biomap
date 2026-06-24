export interface Plant {
  id: string;
  nomi: string;
  lotincha_nomi: string;
  oilasi: string;
  status: string; // e.g. "1 (Yo‘qolib borayotgan)", "2 (Kamayib borayotgan)", etc.
  tarqalishi: string; // Uzbek regional distribution
  tavsifi: string; // Scientific description
  dorivorligi?: string; // Medicinal properties
  image: string; // Image placeholder or SVG representation
  kordinata: {
    lat: number;
    lng: number;
  };
  boshqa_nomlar?: string;
}

export interface Observation {
  id: string;
  plantId?: string; // If recognized as an existing plant
  nomi: string;
  lotincha_nomi?: string;
  oilasi?: string;
  status?: string;
  image: string; // Base64 or image URL
  images?: string[]; // Multiple images support
  video?: string; // Video base64 or URL under 10MB
  kordinata: {
    lat: number;
    lng: number;
  };
  sana: string;
  izoh: string;
  tadqiqotchi: string;
  isAIIdentified: boolean;
  isApproved: boolean;
  userId?: string; // Associated registered user ID if authenticated
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  organization: string;
  specialty: string;
  bio?: string;
  avatarUrl?: string;
  registeredAt: string;
}

export interface PdfDocument {
  id: string;
  title: string;
  author: string;
  date: string;
  size: string;
  category: "Kitob" | "Ilmiy maqola" | "Qo'llanma" | "Loyiha";
  pagesCount: number;
  description: string;
  pages: string[];
  downloadUrl?: string;
  userId?: string; // Link to user's profile ID
  authorInstitution?: string;
  authorRole?: "talaba" | "o'qituvchi" | "tadqiqotchi" | "boshqa";
  isApproved: boolean;
}

export interface RegionStat {
  id: string;
  name: string; // Region name (e.g. "Toshkent viloyati")
  count: number; // Number of unique endangered species registered
  observationCount: number; // All observations tracked
  statusDistribution: {
    yoqolib_borayotgan: number; // Status 1
    kamayib_borayotgan: number; // Status 2
    kamyob: number;             // Status 3
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  category: "kashfiyot" | "monitoring" | "muhofaza" | "nashr";
  date: string;
  summary: string;
  content: string;
  source: string;
  userId?: string;
  isApproved: boolean;
}
