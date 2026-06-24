import { Plant, Observation, RegionStat } from "../types";

export const SEEDED_PLANTS: Plant[] = [
  {
    id: "plant_1",
    nomi: "Greig lolasi",
    lotincha_nomi: "Tulipa greigii",
    oilasi: "Chorog'doshlar / Lolasimonlar (Liliaceae)",
    status: "2 (Kamayib borayotgan tur)",
    tarqalishi: "Toshkent, Jizzax, Samarqand va Namangan viloyatlari tog'lari, G'arbiy Tyan-Shan",
    tavsifi: "Greig lolasi barglarida to'q qizil-jigarrang dog'lari bilan ajralib turadigan, balandligi 20-45 sm bo'lgan juda chiroyli ko'p yillik piyozli o'simlikdir. Gullari yirik, to'q qizil, to'q sariq yoki sarg'ish rangda bo'ladi. U aprel-may oylarida gullaydi. Tabiiy populyatsiyalari chorva mollari boqilishi va odamlar tomonidan asossiz uzib ketilishi natijasida keskin qisqarmoqda.",
    dorivorligi: "Manzarali va seleksiyada jahon bo'yicha lola navlarining 70% dan ortig'iga asos bo'lgan eng muhim genofond hisoblanadi.",
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 41.528, lng: 69.852 },
    boshqa_nomlar: "Qirol lolasi, G'arbiy Tyan-shan lolasi"
  },
  {
    id: "plant_2",
    nomi: "Zarafshon shafroni (Za'faron)",
    lotincha_nomi: "Crocus korolkowii",
    oilasi: "Gulsafsardoshlar (Iridaceae)",
    status: "3 (Kamyob tur)",
    tarqalishi: "Zarafshon, Hisor, Pomir-Oloy tog' tizmalari (Samarqand, Qashqadaryo va Surxondaryo viloyatlari)",
    tavsifi: "Balandoqlarda gullaydigan, bo'yi 10-15 sm bo'lgan ko'p yillik poyasiz tugunakpiyozli o'simlik. Bahorda eng birinchi bo'lib, qor erishi bilan (fevral-mart oylarida) yorqin sariq yoki zarrin tusli gullari bilan ochiladi. Tog' yonbag'irlari va kserofit butazorlarda uchraydi.",
    dorivorligi: "Tarkibida efir moylari, karotinoidlar va dorivor moddalar bor. Parfyumeriya va milliy tabobatda qadimdan keng ishlatiladi.",
    image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 39.421, lng: 67.245 },
    boshqa_nomlar: "Boychechak, Korolkov krokusi"
  },
  {
    id: "plant_3",
    nomi: "Shrenk lolasi",
    lotincha_nomi: "Tulipa schrenkii",
    oilasi: "Lolasimonlar (Liliaceae)",
    status: "2 (Kamayib borayotgan tur)",
    tarqalishi: "Markaziy Qizilqum, Jizzax va Navoiy viloyatlari cho'l va adir hududlari",
    tavsifi: "Cho'l sharoitlariga va gilli tuproqlarga mukammal moslashgan, bo'yi 15-30 sm bo'lgan yovvoyi lola turi. Gullari oq, sariq, qizildan to to'q binafshagacha ranglarda bo'ladi. Aprel oyida gullashi kuzatiladi. Ekologik muvozanatning o'zgarishi va cho'llarning o'zlashtirilishi tufayli uning areal hududi maydonlari tobora qisqarmoqda.",
    dorivorligi: "Kuraksimon omonboshlarda va sho'rxok cho'llarda qum va tuproqlarni eroziyadan saqlashda muhim ahamiyatga ega.",
    image: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 40.352, lng: 65.845 },
    boshqa_nomlar: "Cho'l lolasi"
  },
  {
    id: "plant_4",
    nomi: "O'zbekiston kovragi",
    lotincha_nomi: "Ferula fedtschenkoana",
    oilasi: "Seldereydoshlar / Soyabonguldoshlar (Apiaceae)",
    status: "2 (Kamayib borayotgan tur)",
    tarqalishi: "Qashqadaryo va Surxondaryo adirlari, Boysun tog' etaklari",
    tavsifi: "Kuchli hidli va qatronli bo'lgan gigant ko'p yillik o'simlik. Bo'yi 1.5 - 2.5 metrgacha yetishi mumkin. Soyabonsimon to'pgullari sarg'ish rangda bo'ladi. U urug'idan ko'payadi va 7-9 yoshida faqat bir marta gullab, keyin butunlay quriydi. Uni dorivor yelim-smola (Asafoetida) olish uchun tartibsiz kesish uning yo'qolishiga olib kelmoqda.",
    dorivorligi: "Tarkibida antiseptik, spazmolitik xususiyatga ega smola va efir moylari mavjud bo'lib, xalqaro farmatsevtikada juda qimmatbaho xomashyo hisoblanadi.",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 38.312, lng: 67.156 },
    boshqa_nomlar: "Kovrak poyasi, Sariq kovrak"
  },
  {
    id: "plant_5",
    nomi: "Anzur piyozi",
    lotincha_nomi: "Allium anzur",
    oilasi: "Piyozguldoshlar (Amaryllidaceae)",
    status: "2 (Kamayib borayotgan tur)",
    tarqalishi: "Toshkent, Namangan, Jizzax, Samarqand va Qashqadaryo viloyatlari o'rta va yuqori tog' yonbag'irlari",
    tavsifi: "Balandligi 80-120 sm gacha yetadigan, sharsimon binafsha rang gultojibargli yovvoyi tog' piyozi. Alp va subalp o'tloqlarida toshloq tuproqlarda yaxshi o'sadi. May-iyun oylarida gullaydi. Odamlar tomonidan oziq-ovqat va shifobaxsh piyoz sifatida ko'plab qazib olinishi tabiiy unib chiqish arealini juda siyraklashtirib qo'ygan.",
    dorivorligi: "Vitaminlar va fitonsidlarga g'oyat boy. Oshqozon-ichak trakti faoliyatini va immunitetni yaxshilashda milliy tibbiyotda keng qo'llaniladi.",
    image: "https://images.unsplash.com/photo-1476137682720-25d2b9d75ee5?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 39.680, lng: 68.324 },
    boshqa_nomlar: "Tog' piyozi, Suv piyozi"
  },
  {
    id: "plant_6",
    nomi: "Omonqora dorivor",
    lotincha_nomi: "Inula helenium",
    oilasi: "Murakkabguldoshlar (Asteraceae)",
    status: "3 (Kamyob tur)",
    tarqalishi: "Sirdaryo va Amudaryo daryolari bo'ylari, tog'oldi nam o'tloqlari",
    tavsifi: "Baland bo'yli ko'p yillik dorivor o'simlik, yirik sarg'ish rangli savatchasimon to'pgullari bor. Nam va botqoqlik yonida, daryo bo'ylarida chakalakzorlarda yaxshi rivojlanadi. Iyul-avgust oylarida sarg'ish savatchalari ochiladi. Daryo o'zanlarining tozalanishi va yerlarning meliorativ o'zlashtirilishi tufayli qolgan kserofit areallari kamaygan.",
    dorivorligi: "Efir moylariga boy ildizi balg'am ko'chiruvchi, yallig'lanishga qarshi va oshqozonni mustahkamlovchi juda kuchli preparatlarda qo'llaniladi.",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 40.854, lng: 68.645 },
    boshqa_nomlar: "Andiz, Muz andiz"
  }
];

export const SEEDED_OBSERVATIONS: Observation[] = [
  {
    id: "obs_1",
    plantId: "plant_1",
    nomi: "Greig lolasi",
    lotincha_nomi: "Tulipa greigii",
    oilasi: "Chorog'doshlar / Lolasimonlar (Liliaceae)",
    status: "2 (Kamayib borayotgan tur)",
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 41.528, lng: 69.852 },
    sana: "2026-05-12",
    izoh: "Ugam-Chotqol milliy bog'i hududida 12 ta lola jamg'armasi aniqlandi. Holati barqaror, ammo sayyohlar ko'p yuradigan yo'lakka yaqin joylashgan.",
    tadqiqotchi: "E. Karimov (Botanika Instituti)",
    isAIIdentified: false,
    isApproved: true
  },
  {
    id: "obs_2",
    plantId: "plant_2",
    nomi: "Zarafshon shafroni",
    lotincha_nomi: "Crocus korolkowii",
    oilasi: "Gulsafsardoshlar (Iridaceae)",
    status: "3 (Kamyob tur)",
    image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 39.421, lng: 67.245 },
    sana: "2026-03-22",
    izoh: "Hisor tog' tizmasining sharqiy qismida qor erigan yuzada bir nechta klasterda g'unchalar paydo bo'lgan. GPS orqali xaritaga mukammal muhrlandi.",
    tadqiqotchi: "N. To'rayev (Eko-kuzatuv jamoasi)",
    isAIIdentified: true,
    isApproved: true
  },
  {
    id: "obs_3",
    plantId: "plant_4",
    nomi: "O'zbekiston kovragi",
    lotincha_nomi: "Ferula fedtschenkoana",
    oilasi: "Soyabonguldoshlar (Apiaceae)",
    status: "2 (Kamayib borayotgan tur)",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 38.312, lng: 67.156 },
    sana: "2026-06-01",
    izoh: "Boysuntog' adirlaridan o'simlikning yirik 2 metrlik poyalari aniqlandi. Noqonuniy kesilish holatlari oldini olish uchun mahalliy ekologiya boshqarmasiga xabar yuborildi.",
    tadqiqotchi: "S. Olimov (Surxondaryo Eko-Monitoring)",
    isAIIdentified: false,
    isApproved: true
  },
  {
    id: "obs_4",
    plantId: "plant_5",
    nomi: "Anzur piyozi",
    lotincha_nomi: "Allium anzur",
    oilasi: "Piyozguldoshlar (Amaryllidaceae)",
    status: "2 (Kamayib borayotgan tur)",
    image: "https://images.unsplash.com/photo-1476137682720-25d2b9d75ee5?auto=format&fit=crop&w=600&q=80",
    kordinata: { lat: 39.680, lng: 68.324 },
    sana: "2026-05-28",
    izoh: "Zomin davlat qo'riqxonasida daryo bo'yida bir nechta guruh bo'lib o'sgani aniqlandi va sayt ma'lumotlar ruyxatiga belgilab quyildi.",
    tadqiqotchi: "A. Saidova (Jizzax Davlat Universiteti)",
    isAIIdentified: true,
    isApproved: true
  }
];

export const REGION_MOCK_STATS: RegionStat[] = [
  {
    id: "reg_tashkent",
    name: "Toshkent viloyati",
    count: 48,
    observationCount: 124,
    statusDistribution: { yoqolib_borayotgan: 12, kamayib_borayotgan: 22, kamyob: 14 }
  },
  {
    id: "reg_jizzax",
    name: "Jizzax viloyati",
    count: 36,
    observationCount: 89,
    statusDistribution: { yoqolib_borayotgan: 8, kamayib_borayotgan: 16, kamyob: 12 }
  },
  {
    id: "reg_surxondaryo",
    name: "Surxondaryo viloyati",
    count: 42,
    observationCount: 95,
    statusDistribution: { yoqolib_borayotgan: 15, kamayib_borayotgan: 18, kamyob: 9 }
  },
  {
    id: "reg_qashqadaryo",
    name: "Qashqadaryo viloyati",
    count: 31,
    observationCount: 74,
    statusDistribution: { yoqolib_borayotgan: 6, kamayib_borayotgan: 15, kamyob: 10 }
  },
  {
    id: "reg_samarqand",
    name: "Samarqand viloyati",
    count: 24,
    observationCount: 61,
    statusDistribution: { yoqolib_borayotgan: 4, kamayib_borayotgan: 11, kamyob: 9 }
  },
  {
    id: "reg_namangan",
    name: "Namangan viloyati",
    count: 28,
    observationCount: 52,
    statusDistribution: { yoqolib_borayotgan: 7, kamayib_borayotgan: 13, kamyob: 8 }
  },
  {
    id: "reg_fergana",
    name: "Farg'ona viloyati",
    count: 22,
    observationCount: 44,
    statusDistribution: { yoqolib_borayotgan: 5, kamayib_borayotgan: 10, kamyob: 7 }
  },
  {
    id: "reg_buxoro",
    name: "Buxoro viloyati",
    count: 14,
    observationCount: 29,
    statusDistribution: { yoqolib_borayotgan: 3, kamayib_borayotgan: 7, kamyob: 4 }
  },
  {
    id: "reg_navoiy",
    name: "Navoiy viloyati",
    count: 19,
    observationCount: 38,
    statusDistribution: { yoqolib_borayotgan: 4, kamayib_borayotgan: 9, kamyob: 6 }
  },
  {
    id: "reg_qoraqalpogiston",
    name: "Qoraqalpog'iston Respub.",
    count: 21,
    observationCount: 41,
    statusDistribution: { yoqolib_borayotgan: 9, kamayib_borayotgan: 8, kamyob: 4 }
  }
];
