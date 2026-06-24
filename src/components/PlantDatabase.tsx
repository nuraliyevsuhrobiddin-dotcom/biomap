import React, { useState, useMemo } from "react";
import { Search, Filter, ShieldAlert, BookOpen, MapPin, Feather, HeartPulse } from "lucide-react";
import { Plant, Observation } from "../types";
import { SEEDED_PLANTS } from "../data/plants";

interface PlantDatabaseProps {
  onShowOnMap: (lat: number, lng: number, obsId?: string) => void;
  observations: Observation[];
  initialSearchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
}

export default function PlantDatabase({ onShowOnMap, observations, initialSearchQuery = "", onSearchQueryChange }: PlantDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedFamily, setSelectedFamily] = useState<string>("Barchasi");
  const [selectedStatus, setSelectedStatus] = useState<string>("Barchasi");
  const [activePlant, setActivePlant] = useState<Plant | null>(null);

  // initialSearchQuery o'zgarganda (Home-dan kelganda) sync qilish
  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Combine seeded plants with custom plants from approved observations dynamically
  const allPlants = useMemo(() => {
    const list = [...SEEDED_PLANTS];
    
    // Only display approved observations as catalog cards
    observations.forEach(obs => {
      if (!obs.isApproved) return;
      const exists = list.some(p => p.nomi.toLowerCase() === obs.nomi.toLowerCase());
      if (!exists) {
        list.push({
          id: obs.id,
          nomi: obs.nomi,
          lotincha_nomi: obs.lotincha_nomi || "",
          oilasi: obs.oilasi || "Aniqlanmagan oila",
          status: obs.status || "Qizil kitobga kiritilmagan",
          tarqalishi: `${obs.kordinata.lat.toFixed(3)}, ${obs.kordinata.lng.toFixed(3)}`,
          tavsifi: obs.izoh || "Ushbu tur yovvoyi tabiat monitoringi davomida tadqiqotchi tomonidan kiritilgan.",
          image: obs.image,
          kordinata: obs.kordinata
        });
      }
    });
    
    return list;
  }, [observations]);

  // Extract unique families for filters dynamically
  const families = useMemo(() => {
    const fams = allPlants.map(p => {
      const raw = p.oilasi.split("/")[0].trim().split("(")[0].trim();
      return raw;
    }).filter(Boolean);
    return ["Barchasi", ...Array.from(new Set(fams))];
  }, [allPlants]);

  // Map plants based on filters
  const filteredPlants = useMemo(() => {
    return allPlants.filter(plant => {
      const matchesSearch = plant.nomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            plant.lotincha_nomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            plant.tavsifi.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFamily = selectedFamily === "Barchasi" || plant.oilasi.toLowerCase().includes(selectedFamily.toLowerCase());
      const matchesStatus = selectedStatus === "Barchasi" || 
                            (selectedStatus === "Yo‘qolib borayotgan" && plant.status.includes("1")) ||
                            (selectedStatus === "Kamayib borayotgan" && plant.status.includes("2")) ||
                            (selectedStatus === "Kamyob" && plant.status.includes("3"));

      return matchesSearch && matchesFamily && matchesStatus;
    });
  }, [allPlants, searchQuery, selectedFamily, selectedStatus]);

  return (
    <div id="plant_database_container" className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-4">
      {/* Search and Filters Hub */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white px-6 py-5 rounded-3xl shadow-sm border border-neutral-200">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="O‘simlik nomi yoki oilasini yozing..."
            className="w-full bg-neutral-100 border border-neutral-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-brand-primary"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchQueryChange?.(e.target.value);
            }}
          />
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Filter className="w-4 h-4 text-neutral-400" />
            <span>Filtrlar:</span>
          </div>

          {/* Oila bo'yicha filter */}
          <select
            className="bg-neutral-100 border border-neutral-200 text-xs font-semibold rounded-xl px-3 py-2 text-neutral-700 outline-none focus:border-brand-primary"
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
          >
            <option value="Barchasi">Hamma oilalar ({families.length - 1})</option>
            {families.filter(f => f !== "Barchasi").map((fam, i) => (
              <option key={i} value={fam}>{fam}</option>
            ))}
          </select>

          {/* Status bo'yicha filter */}
          <select
            className="bg-neutral-100 border border-neutral-200 text-xs font-semibold rounded-xl px-3 py-2 text-neutral-700 outline-none focus:border-brand-primary"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Barchasi">Hamma maqomlar</option>
            <option value="Yo‘qolib borayotgan">1 (Yo‘qolib borayotgan)</option>
            <option value="Kamayib borayotgan">2 (Kamayib borayotgan)</option>
            <option value="Kamyob">3 (Kamyob turlar)</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Plant Cards Catalog Grid */}
        <div id="plant_catalog_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-200">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-neutral-800">Ma‘lumot topilmadi</h3>
              <p className="text-xs text-neutral-400 mt-1">Siz izlagan mezonlar bo'yicha O'zbekiston Qizil kitobi o'simliklari bazasida mos keladigan turi aniqlanmadi.</p>
            </div>
          ) : (
            filteredPlants.map((plant) => {
              const isCriticallyEndangered = plant.status.includes("1") || plant.status.includes("Yo‘qo");
              return (
                <div
                  key={plant.id}
                  onClick={() => setActivePlant(plant)}
                  className={`group bg-white rounded-3xl p-5 border shadow-sm transition hover:shadow-xl hover:border-brand-primary cursor-pointer flex flex-col justify-between ${
                    activePlant?.id === plant.id ? "ring-2 ring-brand-primary border-brand-primary" : "border-neutral-200/60"
                  }`}
                >
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-neutral-100 mb-4">
                    <img
                      src={plant.image}
                      alt={plant.nomi}
                      className="w-full h-full object-cover transition duration-550 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-md text-white backdrop-blur-md ${
                        isCriticallyEndangered ? "bg-red-500/90" : "bg-amber-500/90"
                      }`}>
                        {plant.status.split(" ")[0] || "IUCN"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block font-mono">
                      {plant.oilasi.split("/")[0].trim()}
                    </span>
                    <h3 className="text-xl font-display font-bold text-neutral-900 mt-1 group-hover:text-amber-600 transition truncate">
                      {plant.nomi}
                    </h3>
                    <p className="text-xs italic text-neutral-500 mt-0.5 truncate">
                      {plant.lotincha_nomi}
                    </p>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mt-2.5">
                      {plant.tavsifi}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-150 pt-4 mt-4 text-[11px] font-semibold text-neutral-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[120px]">{plant.tarqalishi.split(",")[0]}</span>
                    </div>
                    <span className="text-brand-secondary group-hover:translate-x-1 transition flex items-center gap-0.5">
                      Batafsil ma‘lumot ➔
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detailed Side Drawer Overlay */}
      {activePlant && (
        <div className="fixed inset-0 z-[2000] flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-neutral-950/45 backdrop-blur-xs transition-opacity duration-300 animate-fade-in cursor-pointer"
            onClick={() => setActivePlant(null)}
          />
          {/* Drawer Body */}
          <div
            id="plant_detail_panel"
            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-neutral-200 z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-neutral-100 bg-white shrink-0">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-brand-secondary font-mono">
                  {activePlant.oilasi}
                </span>
                <h2 className="text-2xl font-display font-bold text-neutral-900 mt-1">
                  {activePlant.nomi}
                </h2>
                <p className="text-sm italic text-neutral-500 font-medium">
                  {activePlant.lotincha_nomi}
                </p>
              </div>
              <button
                onClick={() => setActivePlant(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold transition shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-inner shrink-0">
                <img
                  src={activePlant.image}
                  alt={activePlant.nomi}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Scientific Details Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-mono uppercase">Muhofaza maqomi</span>
                    <span className="text-xs font-bold text-neutral-800 leading-snug">{activePlant.status}</span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-mono uppercase">Tarqalish areali</span>
                    <span className="text-xs font-bold text-neutral-800 leading-snug" title={activePlant.tarqalishi}>
                      {activePlant.tarqalishi}
                    </span>
                  </div>
                </div>

                {activePlant.boshqa_nomlar && (
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex gap-3 col-span-full">
                    <Feather className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-mono uppercase">Xalqaro va mahalliy sinonimlari</span>
                      <span className="text-xs font-semibold text-neutral-700 leading-snug">{activePlant.boshqa_nomlar}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5 font-mono">
                  <BookOpen className="w-4 h-4 text-neutral-400" />
                  <span>Botanika Tavsifi</span>
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100/50">
                  {activePlant.tavsifi}
                </p>
              </div>

              {activePlant.dorivorligi && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5 font-mono">
                    <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />
                    <span>Seleksiya & Dorivorlik Ahamiyati</span>
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed bg-amber-50/30 p-4 rounded-2xl border border-amber-100/30">
                    {activePlant.dorivorligi}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-100 bg-white shrink-0">
              <button
                onClick={() => onShowOnMap(activePlant.kordinata.lat, activePlant.kordinata.lng, activePlant.id)}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-neutral-900 py-3.5 rounded-2xl font-bold tracking-wide shadow-md hover:shadow-lg transition text-xs flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Xaritada nuqtasini ko‘rsatish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
