import React, { useState, useRef, useEffect } from "react";
import { Search, ZoomIn, ZoomOut, Compass, Navigation, Info, ShieldAlert, Layers, SlidersHorizontal } from "lucide-react";
import { Plant, Observation } from "../types";
import { SEEDED_PLANTS } from "../data/plants";

interface GisMapProps {
  observations: Observation[];
  onSelectObservation?: (obs: Observation) => void;
  selectedObsId?: string | null;
  onAddObservationFromMap?: (lat: number, lng: number) => void;
  isPickingCoords?: boolean;
  mapFocusCoords?: { lat: number; lng: number; label?: string } | null;
}

function getStatusCategory(status: string | undefined): '1' | '2' | '3' | 'other' {
  if (!status) return 'other';
  const clean = status.toLowerCase();
  if (clean.includes("1") || clean.includes("yo'qolib") || clean.includes("yo‘qolib") || clean.includes("yoqo")) return '1';
  if (clean.includes("2") || clean.includes("kamayib") || clean.includes("kamay")) return '2';
  if (clean.includes("3") || clean.includes("kamyob")) return '3';
  return 'other';
}

const PLANT_BLOOMING_MONTHS: Record<string, number[]> = {
  "plant_1": [4, 5],    // Aprel, May (Greig lolasi)
  "plant_2": [2, 3],    // Fevral, Mart (Zarafshon shafroni)
  "plant_3": [4],       // Aprel (Shrenk lolasi)
  "plant_4": [4, 5, 6], // Aprel, May, Iyun (O'zbekiston kovragi)
  "plant_5": [5, 6],    // May, Iyun (Anzur piyozi)
  "plant_6": [7, 8],    // Iyul, Avgust (Omonqora dorivor)
};

const MONTH_NAMES_UZ = [
  { val: 1, name: "Yanvar" },
  { val: 2, name: "Fevral" },
  { val: 3, name: "Mart" },
  { val: 4, name: "Aprel" },
  { val: 5, name: "May" },
  { val: 6, name: "Iyun" },
  { val: 7, name: "Iyul" },
  { val: 8, name: "Avgust" },
  { val: 9, name: "Sentyabr" },
  { val: 10, name: "Oktyabr" },
  { val: 11, name: "Noyabr" },
  { val: 12, name: "Dekabr" }
];

export default function GisMap({
  observations: allObservations,
  onSelectObservation,
  selectedObsId,
  onAddObservationFromMap,
  isPickingCoords = false,
  mapFocusCoords
}: GisMapProps) {
  // Faqat admin tomonidan tasdiqlangan kuzatuvlarni ko'rsat va status/oila/lotincha_nomi to'ldirib ol
  const observations = React.useMemo(() => {
    return allObservations
      .filter(o => o.isApproved)
      .map(obs => {
        let status = obs.status;
        let oilasi = obs.oilasi;
        let lotincha_nomi = obs.lotincha_nomi;

        const plant = (obs.plantId ? SEEDED_PLANTS.find(p => p.id === obs.plantId) : null) ||
                      SEEDED_PLANTS.find(p => p.nomi.toLowerCase() === obs.nomi.toLowerCase());

        if (plant) {
          if (!status) status = plant.status;
          if (!oilasi) oilasi = plant.oilasi;
          if (!lotincha_nomi) lotincha_nomi = plant.lotincha_nomi;
        }

        return {
          ...obs,
          status: status || "Qizil kitobga kiritilmagan",
          oilasi: oilasi || "Aniqlanmagan",
          lotincha_nomi: lotincha_nomi || ""
        };
      });
  }, [allObservations]);
  const [mapType, setMapType] = useState<"vector" | "satellite" | "topographic" | "dark">("vector");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "endangered">("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [calendarFilterType, setCalendarFilterType] = useState<"observation" | "blooming">("observation");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [myGps, setMyGps] = useState<{ lat: number; lng: number } | null>(null);
  const [customDetailModal, setCustomDetailModal] = useState<{
    title: string;
    lotincha?: string;
    family?: string;
    status?: string;
    izoh: string;
    coordinates?: string;
    imageUrl?: string;
    images?: string[];
    video?: string;
  } | null>(null);


  // Leaflet references
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<any>(null);
  const labelLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const userGpsMarkerRef = useRef<any>(null);
  const isPickingCoordsRef = useRef(isPickingCoords);
  const onAddObservationFromMapRef = useRef(onAddObservationFromMap);

  // Sync ref to avoid re-triggering map click effects
  useEffect(() => {
    isPickingCoordsRef.current = isPickingCoords;
  }, [isPickingCoords]);

  useEffect(() => {
    onAddObservationFromMapRef.current = onAddObservationFromMap;
  }, [onAddObservationFromMap]);

  // Inject Leaflet resources dynamically and initialize map
  useEffect(() => {
    let isMounted = true;
    const styleId = "custom-leaflet-css-overrides";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .leaflet-container {
          background-color: #0c101d !important;
          font-family: inherit;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-tooltip {
          background-color: #ffffff !important;
          color: #1c1917 !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 8px 12px !important;
          font-weight: 600;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #ffffff !important;
        }
        .custom-observation-marker {
          background: transparent !important;
          border: none !important;
        }
        .user-gps-marker {
          background: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!isMounted || !L || !mapContainerRef.current || mapRef.current) return;

      try {
        // Create Leaflet map targeting the container div
        const map = L.map(mapContainerRef.current, {
          center: [41.3775, 64.5853], // Coordinate center of Uzbekistan
          zoom: 6,
          zoomControl: false, // Disabling standard zoom buttons to use our premium custom HUD buttons
          attributionControl: false
        });

        mapRef.current = map;
        markersGroupRef.current = L.layerGroup().addTo(map);

        // Handle map clicks for pinpoint coordinate selection
         map.on("click", (e: any) => {
           if (isPickingCoordsRef.current && onAddObservationFromMapRef.current) {
             onAddObservationFromMapRef.current(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
           }
         });

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (e) {
        console.error("Error setting up Leaflet map:", e);
      }
    };

    // Load Leaflet CDN script and stylesheet if not already present
    if ((window as any).L) {
      initMap();
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.crossOrigin = "";
      script.onload = () => {
        if (isMounted) {
          initMap();
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          console.error("Error during Leaflet cleanup:", e);
        }
        mapRef.current = null;
        markersGroupRef.current = null;
        tileLayerRef.current = null;
        labelLayerRef.current = null;
        userGpsMarkerRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Synchronize dynamic tile sheets corresponding to the selected map hud styles
  useEffect(() => {
    const L = (window as any).L;
    if (!mapLoaded || !mapRef.current || !L) return;

    if (tileLayerRef.current && mapRef.current) {
      try {
        if (typeof mapRef.current.hasLayer === "function" && mapRef.current.hasLayer(tileLayerRef.current)) {
          mapRef.current.removeLayer(tileLayerRef.current);
        }
      } catch (e) {
        console.error("Error removing old tile layer:", e);
      }
      tileLayerRef.current = null;
    }

    if (labelLayerRef.current && mapRef.current) {
      try {
        if (typeof mapRef.current.hasLayer === "function" && mapRef.current.hasLayer(labelLayerRef.current)) {
          mapRef.current.removeLayer(labelLayerRef.current);
        }
      } catch (e) {
        console.error("Error removing old label overlay layer:", e);
      }
      labelLayerRef.current = null;
    }

    let url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let options: any = { maxZoom: 19, subdomains: 'abcd', attribution: "CartoDB" };
    let loadLabels = false;

    if (mapType === "satellite") {
      // High resolution ESRI satellite tile maps
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      options = { maxZoom: 19, attribution: "ESRI" };
      loadLabels = true;
    } else if (mapType === "topographic") {
      // ESRI World Topo Map (Aniq va yorqin topografik xarita)
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
      options = { maxZoom: 19, attribution: "ESRI" };
    } else if (mapType === "dark") {
      // CartoDB Dark Matter (Ultra-premium dark map for GIS)
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      options = { maxZoom: 19, subdomains: 'abcd', attribution: "CartoDB" };
    } else {
      // Default: CartoDB Voyager (Yorqin va aniq vektor xarita)
      url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      options = { maxZoom: 19, subdomains: 'abcd', attribution: "CartoDB" };
    }

    try {
      const layer = L.tileLayer(url, options);
      layer.on("tileerror", (err: any) => {
        console.error("Tile load error:", err);
      });
      tileLayerRef.current = layer.addTo(mapRef.current);

      if (loadLabels) {
        // Overlay CartoDB Voyager Labels above the satellite layer
        const labelsUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png";
        const labelLayer = L.tileLayer(labelsUrl, { 
          maxZoom: 19, 
          subdomains: 'abcd',
          pane: 'overlayPane' // Keep above satellite but below markers
        });
        labelLayerRef.current = labelLayer.addTo(mapRef.current);
      }
    } catch (e) {
      console.error("Error adding tile layer:", e);
    }
  }, [mapLoaded, mapType]);

  // Get all unique families available in the observations
  const availableFamilies = React.useMemo(() => {
    // Kuzatuvlardagi oilalar + SEEDED_PLANTS dan barcha oilalar birlashtiriladi
    const obsFamily = observations.map(o => o.oilasi || "Aniqlanmagan");
    const plantFamily = SEEDED_PLANTS.map(p => p.oilasi.split(" / ")[0].trim());
    return Array.from(new Set([...obsFamily, ...plantFamily])).filter(Boolean).sort();
  }, [observations]);

  // Filter observations based on search text, endangered species, status levels, & plant families
  const filteredObs = observations.filter(obs => {
    const matchesSearch = obs.nomi.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (obs.lotincha_nomi && obs.lotincha_nomi.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          obs.tadqiqotchi.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          obs.izoh.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Check basic tabs (All vs Endangered)
    if (activeTab === "endangered") {
      const isEndangered = obs.status && (
        obs.status.includes("1") || 
        obs.status.includes("2") || 
        obs.status.includes("3") ||
        obs.status.toLowerCase().includes("kamyob") ||
        obs.status.toLowerCase().includes("yo'qol") ||
        obs.status.toLowerCase().includes("kamay")
      );
      if (!isEndangered) return false;
    }

    // Check selected Red Book status levels
    if (selectedStatuses.length > 0) {
      const cat = getStatusCategory(obs.status);
      if (!selectedStatuses.includes(cat)) return false;
    }

    // Check selected plant families
    if (selectedFamilies.length > 0) {
      const family = obs.oilasi || "Aniqlanmagan";
      if (!selectedFamilies.includes(family)) return false;
    }

    // Check selected months (seasons / blooming or observation)
    if (selectedMonths.length > 0) {
      if (calendarFilterType === "observation") {
        let obsMonth = 0;
        if (obs.sana) {
          const parts = obs.sana.split("-");
          if (parts.length >= 2) {
            obsMonth = parseInt(parts[1], 10);
          }
        }
        if (!selectedMonths.includes(obsMonth)) return false;
      } else {
        let pId = obs.plantId;
        if (!pId) {
          const foundPlant = SEEDED_PLANTS.find(p => p.nomi.toLowerCase() === obs.nomi.toLowerCase());
          if (foundPlant) pId = foundPlant.id;
        }
        const bloomingMonths = pId ? PLANT_BLOOMING_MONTHS[pId] : null;
        if (bloomingMonths) {
          const hasOverlap = bloomingMonths.some(m => selectedMonths.includes(m));
          if (!hasOverlap) return false;
        } else {
          let obsMonth = 0;
          if (obs.sana) {
            const parts = obs.sana.split("-");
            if (parts.length >= 2) {
              obsMonth = parseInt(parts[1], 10);
            }
          }
          if (!selectedMonths.includes(obsMonth)) return false;
        }
      }
    }

    return true;
  });

  // Render and update observation markers on changes to filters or state
  const prevFilterKeyRef = React.useRef<string>("");
  useEffect(() => {
    const L = (window as any).L;
    if (!mapLoaded || !mapRef.current || !markersGroupRef.current || !L) return;

    try {
      markersGroupRef.current.clearLayers();

      const validFiltered = filteredObs.filter((obs) => {
        return (
          obs &&
          obs.kordinata &&
          typeof obs.kordinata.lat === "number" &&
          typeof obs.kordinata.lng === "number" &&
          isFinite(obs.kordinata.lat) &&
          isFinite(obs.kordinata.lng)
        );
      });

      validFiltered.forEach((obs) => {
        const statusCat = getStatusCategory(obs.status);
        // Rang: 1-toifa=qizil, 2-toifa=to'q sariq, 3-toifa=sariq, boshqa=kulrang
        const pinColor = statusCat === '1' ? "#EF4444"
          : statusCat === '2' ? "#FFB300"
          : statusCat === '3' ? "#EAB308"
          : "#94A3B8";
        const isSelected = selectedObs?.id === obs.id;

        const markerHtml = `
          <div class="relative flex items-center justify-center" style="width: 28px; height: 28px;">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full opacity-50" style="background-color: ${pinColor}"></span>
            <span class="relative inline-flex rounded-full border-2 border-white shadow-lg ${isSelected ? 'h-5 w-5' : 'h-4 w-4'} transition-all duration-300" style="background-color: ${pinColor}"></span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-observation-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([obs.kordinata.lat, obs.kordinata.lng], { icon: customIcon });

        marker.on("click", () => {
          setSelectedObs(obs);
          if (onSelectObservation) {
            onSelectObservation(obs);
          }
        });

        marker.bindTooltip(`
          <div class="font-sans text-xs">
            <p class="font-extrabold text-neutral-900">${obs.nomi}</p>
            ${obs.lotincha_nomi ? `<p class="italic text-neutral-500 mt-0.5">${obs.lotincha_nomi}</p>` : ''}
            <p class="text-[10px] text-neutral-400 font-mono mt-1 font-semibold uppercase">${obs.oilasi || "Oila toifasiz"} • ${obs.sana}</p>
          </div>
        `, {
          direction: 'top',
          offset: [0, -14],
          opacity: 0.96
        });

        markersGroupRef.current.addLayer(marker);
      });

      // Filtr yoki qidiruv faol bo'lsa — avtomatik zoom
      const filterKey = filteredObs.map(o => o.id).join(",");
      const isFilterActive = searchQuery || selectedStatuses.length > 0 || selectedFamilies.length > 0 || activeTab === "endangered";
      if (isFilterActive && validFiltered.length > 0 && filterKey !== prevFilterKeyRef.current) {
        prevFilterKeyRef.current = filterKey;
        try {
          const latLngs = validFiltered.map(o => [o.kordinata.lat, o.kordinata.lng]);
          const bounds = L.latLngBounds(latLngs);
          if (bounds.isValid()) {
            mapRef.current.flyToBounds(bounds, {
              padding: [80, 80],
              maxZoom: 10,
              animate: true,
              duration: 1.1
            });
          }
        } catch (_e) { /* ignore */ }
      }
    } catch (e) {
      console.error("Error updating markers on Leaflet map:", e);
    }
  }, [mapLoaded, filteredObs, selectedObs, onSelectObservation, searchQuery, selectedStatuses, selectedFamilies, activeTab]);

  // Synchronize programmatically selected observation centering
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    try {
      if (selectedObsId) {
        const found = observations.find(o => o.id === selectedObsId);
        if (found && found.kordinata && isFinite(found.kordinata.lat) && isFinite(found.kordinata.lng)) {
          setSelectedObs(found);
          mapRef.current.flyTo([found.kordinata.lat, found.kordinata.lng], 11, {
            animate: true,
            duration: 1.5
          });
        }
      } else {
        setSelectedObs(null);
      }
    } catch (e) {
      console.error("Error setting map center via flyTo:", e);
    }
  }, [selectedObsId, observations, mapLoaded]);

  // Fly to explicit coordinates (plant with no observation)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !mapFocusCoords) return;
    try {
      mapRef.current.flyTo([mapFocusCoords.lat, mapFocusCoords.lng], 12, {
        animate: true,
        duration: 1.4
      });
    } catch (e) {
      console.error("Error flying to mapFocusCoords:", e);
    }
  }, [mapFocusCoords, mapLoaded]);

  // Force leaflet map to recompute container size on mount / tab-load
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      mapRef.current.invalidateSize();
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  // Zoom HUD custom triggers
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Real GPS location using browser geolocation API
  const placeGpsMarker = (lat: number, lng: number, label: string) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    setMyGps({ lat, lng });
    setGpsSimulating(false);

    if (userGpsMarkerRef.current) {
      try { mapRef.current.removeLayer(userGpsMarkerRef.current); } catch (_) {}
    }

    const gpsIconHtml = `
      <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-65"></span>
        <span class="relative inline-flex rounded-full" style="width:18px;height:18px;background:#2563eb;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></span>
      </div>
    `;

    const gpsIcon = L.divIcon({
      html: gpsIconHtml,
      className: 'user-gps-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    userGpsMarkerRef.current = L.marker([lat, lng], { icon: gpsIcon })
      .addTo(mapRef.current)
      .bindTooltip(`<div class="font-sans text-xs font-bold px-1 py-0.5 text-blue-700">${label}</div>`, {
        direction: 'top',
        offset: [0, -10]
      });

    mapRef.current.flyTo([lat, lng], 13, { animate: true, duration: 1.5 });
  };

  const triggerGpsKuzatuv = () => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    setGpsSimulating(true);

    if (!navigator.geolocation) {
      // Geolocation yo'q — Toshkent fallback
      placeGpsMarker(41.2995, 69.2401, "Toshkent (GPS mavjud emas)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        placeGpsMarker(
          Number(pos.coords.latitude.toFixed(5)),
          Number(pos.coords.longitude.toFixed(5)),
          "Sizning haqiqiy GPS joylashuvingiz"
        );
      },
      (_err) => {
        // Ruxsat berilmadi yoki xato — Toshkent fallback
        placeGpsMarker(41.2995, 69.2401, "Toshkent (GPS ruxsati yo'q)");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <div id="gis_map_root" className="relative w-full h-[calc(100dvh-6.5rem)] min-h-[480px] sm:h-[520px] md:h-[620px] bg-neutral-900 rounded-[20px] overflow-hidden shadow-2xl border border-neutral-800">
      
      
      {/* Map Control HUD Overlay - Search and filters */}
      <div id="gis_hud_search" className="absolute top-3 left-3 right-3 md:left-4 md:top-4 md:right-auto md:w-96 z-[1000] flex flex-col gap-2">
        {/* Search row */}
        <div className="bg-neutral-900/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl flex items-center justify-between border border-neutral-800 gap-2 min-h-[48px]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-amber-500 shrink-0" />
            <input
              type="text"
              placeholder="O'simlik nomi, oilasi, tadqiqotchi..."
              className="bg-transparent border-none text-white focus:outline-none w-full placeholder-neutral-500 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-neutral-500 hover:text-white transition text-xs px-1 shrink-0"
              >✕</button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition text-xs font-bold shrink-0 ${
              showAdvancedFilters || selectedStatuses.length > 0 || selectedFamilies.length > 0
                ? "bg-amber-500 text-neutral-950"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
            }`}
            title="Kengaytirilgan filtrlar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtrlar</span>
            {(selectedStatuses.length > 0 || selectedFamilies.length > 0) && (
              <span className="bg-neutral-950/50 rounded-full px-1.5 py-0.5 text-[9px] font-mono">
                {selectedStatuses.length + selectedFamilies.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters and toggles */}
        <div className="flex gap-2 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === "all" ? "bg-amber-500 text-neutral-950" : "text-neutral-400 hover:text-white"
            }`}
          >
            Barcha ({filteredObs.length} ta)
          </button>
          <button
            onClick={() => setActiveTab("endangered")}
            className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === "endangered" ? "bg-red-500 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            Yo'qolayotganlar
          </button>
        </div>

        {/* Zero results feedback */}
        {filteredObs.length === 0 && (searchQuery || selectedStatuses.length > 0 || selectedFamilies.length > 0) && (
          <div className="bg-neutral-900/95 backdrop-blur-md px-4 py-3 rounded-xl border border-neutral-800 text-center text-xs text-neutral-400">
            <span className="text-amber-400 font-bold">0 ta natija</span> — boshqa kalit so'z yoki filtr tanlang
          </div>
        )}

        {/* Mobile-only responsive Map Type and GIS scanning badge */}
        <div className="flex md:hidden items-center justify-between gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-0.5 bg-neutral-950 p-0.5 rounded-lg border border-neutral-850 flex-1 overflow-x-auto hide-scrollbar">
            {(["vector", "satellite", "dark", "topographic"] as const).map((type) => {
              const label = type === "vector" ? "Vek" 
                          : type === "satellite" ? "Gib"
                          : type === "dark" ? "Tun"
                          : "Top";
              const title = type === "vector" ? "Vektor"
                          : type === "satellite" ? "Gibrid"
                          : type === "dark" ? "Tungi"
                          : "Topografik";
              const isActive = mapType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMapType(type)}
                  className={`px-2 py-1 rounded text-[8.5px] font-black uppercase tracking-tighter transition flex-1 text-center ${
                    isActive 
                      ? "bg-amber-500 text-neutral-950 font-black shadow-sm" 
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title={title}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="bg-neutral-950/85 backdrop-blur px-2 py-1 rounded-lg text-[8px] text-neutral-400 flex items-center gap-0.5 font-mono tracking-tighter border border-neutral-850 shrink-0 select-none">
            <Layers className="w-2.5 h-2.5 text-amber-500 shrink-0" />
            <span>GIS: FAOL</span>
          </div>
        </div>

        {/* Advanced Filters Dropdown Block */}
        {showAdvancedFilters && (
          <div className="bg-neutral-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-neutral-800 flex flex-col gap-4 animate-fade-in text-xs text-stone-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-amber-500 uppercase tracking-widest font-mono text-[9px]">Kengaytirilgan filtrlar</span>
              {(selectedStatuses.length > 0 || selectedFamilies.length > 0 || selectedMonths.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatuses([]);
                    setSelectedFamilies([]);
                    setSelectedMonths([]);
                    setCalendarFilterType("observation");
                  }}
                  className="text-[9px] font-bold text-red-400 hover:text-red-300 font-mono flex items-center gap-1 uppercase"
                >
                  Tozalash
                </button>
              )}
            </div>

            {/* Red Book Status Multi-Select */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9px] font-mono">Qizil Kitob Toifalari</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { key: '1', label: "1-toifa (Yo‘qolib borayotgan)", color: "bg-red-500" },
                  { key: '2', label: "2-toifa (Kamayib borayotgan)", color: "bg-amber-500" },
                  { key: '3', label: "3-toifa (Kamyob turlar)", color: "bg-yellow-400" },
                  { key: 'other', label: "Qizil kitobga kiritilmagan", color: "bg-neutral-500" },
                ].map((item) => {
                  const isChecked = selectedStatuses.includes(item.key);
                  const count = observations.filter(o => getStatusCategory(o.status) === item.key).length;
                  return (
                    <label 
                      key={item.key} 
                      className="flex items-center justify-between cursor-pointer group hover:text-white transition"
                    >
                      <div className="flex items-center gap-2">
                        <input
                           type="checkbox"
                           checked={isChecked}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setSelectedStatuses([...selectedStatuses, item.key]);
                             } else {
                               setSelectedStatuses(selectedStatuses.filter(s => s !== item.key));
                             }
                           }}
                           className="accent-amber-500 h-3 w-3 rounded border-neutral-700 bg-neutral-800 focus:ring-0 cursor-pointer"
                        />
                        <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        <span className="text-[11px] text-neutral-350 group-hover:text-neutral-200">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Plant Families Selector */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9px] font-mono">O'simlik Oilalari</span>
              {availableFamilies.length === 0 ? (
                <span className="text-neutral-500 italic text-[10px]">Hozircha oilalar mavjud emas</span>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {availableFamilies.map((fam) => {
                    const isChecked = selectedFamilies.includes(fam);
                    const count = observations.filter(o => (o.oilasi || "Aniqlanmagan") === fam).length;
                    return (
                      <label 
                        key={fam} 
                        className="flex items-center justify-between cursor-pointer group hover:text-white transition"
                      >
                        <div className="flex items-center gap-2 max-w-[85%]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFamilies([...selectedFamilies, fam]);
                              } else {
                                setSelectedFamilies(selectedFamilies.filter(f => f !== fam));
                              }
                            }}
                            className="accent-amber-500 h-3 w-3 rounded border-neutral-700 bg-neutral-800 focus:ring-0 cursor-pointer shrink-0"
                          />
                          <span className="text-[11px] text-neutral-350 group-hover:text-neutral-200 truncate" title={fam}>
                            {fam.split(" / ")[0]}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Premium Blooming & Observation Month Season Filters */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9px] font-mono">Mavsumiy / Oylar</span>
                <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-850 gap-0.5 scale-[0.85] origin-right">
                  <button
                    type="button"
                    onClick={() => setCalendarFilterType("observation")}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase transition ${
                      calendarFilterType === "observation"
                        ? "bg-amber-500 text-neutral-950"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Real kuzatilgan oy"
                  >
                    Kuzatuv
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilterType("blooming")}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase transition ${
                      calendarFilterType === "blooming"
                        ? "bg-amber-500 text-neutral-950"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Tabiiy gullash oyi"
                  >
                    Gullash
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {MONTH_NAMES_UZ.map((m) => {
                  const isSelected = selectedMonths.includes(m.val);
                  return (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMonths(selectedMonths.filter(v => v !== m.val));
                        } else {
                          setSelectedMonths([...selectedMonths, m.val]);
                        }
                      }}
                      className={`py-1 px-0.5 rounded-lg text-[9px] font-black uppercase text-center transition tracking-tighter ${
                        isSelected
                          ? "bg-amber-500 text-neutral-950 shadow-md scale-[1.03]"
                          : "bg-neutral-950 text-neutral-450 hover:text-white hover:bg-neutral-850 border border-neutral-850"
                      }`}
                    >
                      {m.name.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Picking Coordinates Mode Notice */}
      {isPickingCoords && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-neutral-950 px-5 py-2.5 rounded-full font-bold shadow-2xl flex items-center gap-2 border border-amber-400 text-xs animate-bounce uppercase tracking-wider">
          <Compass className="w-4 h-4 animate-spin" />
          <span>Xaritadan kerarli nuqtani bosing (Koordinat)</span>
        </div>
      )}

      {/* Scientific layer indicator and Map Type controls */}
      <div id="gis_map_layer_controls" className="absolute top-4 right-4 z-[1000] hidden md:flex flex-col gap-2 items-end">
        <div className="bg-neutral-900/95 backdrop-blur-md p-1 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-0.5 md:gap-1 border border-neutral-800 max-w-[85vw] overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setMapType("vector")}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest transition ${
              mapType === "vector" 
                ? "bg-amber-500 text-neutral-950 font-black shadow-sm" 
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Vektor
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest transition ${
              mapType === "satellite" 
                ? "bg-amber-500 text-neutral-950 font-black shadow-sm" 
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Gibrid
          </button>
          <button
            onClick={() => setMapType("dark")}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest transition ${
              mapType === "dark" 
                ? "bg-amber-500 text-neutral-950 font-black shadow-sm" 
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Tungi
          </button>
          <button
            onClick={() => setMapType("topographic")}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest transition ${
              mapType === "topographic" 
                ? "bg-amber-500 text-neutral-950 font-black shadow-sm" 
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Topo
          </button>
        </div>

        <div className="bg-neutral-950/80 backdrop-blur px-2.5 py-1 rounded-full text-[8px] md:text-[9px] text-neutral-400 flex items-center gap-1 font-mono tracking-wider border border-neutral-850">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>GIS: FAOL</span>
        </div>
      </div>

      {/* Main Leaflet container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-10"
      />

      {/* Selected Observation Glassmorphism Popup Inside Map overlay */}
      {selectedObs && (
        <div
          id="gis_selected_observation_panel"
          className="absolute bottom-[5.75rem] left-3 right-3 md:bottom-4 md:left-4 md:right-auto md:w-96 rounded-[20px] bg-white/95 backdrop-blur-md p-4 shadow-2xl border border-neutral-200 text-neutral-800 z-[1000] transition-all duration-300 animate-slide-up flex flex-col gap-2.5 max-h-[min(44vh,26rem)] md:max-h-none overflow-y-auto overscroll-contain"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-550/10 text-amber-600 border border-amber-200/50 uppercase font-mono">
                  {selectedObs.oilasi?.split("/")[0] || "Botanika"}
                </span>
                {selectedObs.status && (
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    selectedObs.status.includes("1") ? "bg-red-50 text-red-600 border border-red-150" : "bg-amber-50 text-amber-700 border border-amber-150"
                  }`}>
                    {selectedObs.status.split(" ")[0]} Toifa
                  </span>
                )}
              </div>
              <h3 className="text-lg font-display font-black mt-2 text-neutral-900 leading-tight">
                {selectedObs.nomi}
              </h3>
              <p className="text-xs italic text-neutral-405 font-semibold">
                {selectedObs.lotincha_nomi || "Lotincha nomi kiritilmagan"}
              </p>
            </div>

            <button
              onClick={() => setSelectedObs(null)}
              className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-250 text-neutral-600 flex items-center justify-center text-xs font-bold transition"
            >
              ✕
            </button>
          </div>

          {/* Quick stats on popup */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-neutral-50 p-3 rounded-2xl border border-neutral-150">
            <div>
              <span className="text-neutral-400 block uppercase font-black">Kenglik (Lat)</span>
              <span className="text-neutral-750 font-bold">{selectedObs.kordinata.lat}° N</span>
            </div>
            <div>
              <span className="text-neutral-400 block uppercase font-black">Uzunlik (Lng)</span>
              <span className="text-neutral-750 font-bold">{selectedObs.kordinata.lng}° E</span>
            </div>
            <div className="col-span-2 border-t border-neutral-200/50 pt-2 mt-1">
              <span className="text-neutral-400 block uppercase font-black">Monitoring sanasi</span>
              <span className="text-neutral-750 font-bold">{selectedObs.sana}</span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed font-medium">
            {selectedObs.izoh || "Ushbu teleradar GIS punkti bo'yicha ekologik monitoring o'tkazilgan."}
          </p>

          <div className="flex items-center gap-3 border-t border-neutral-150 pt-4.5">
            <img
              src={selectedObs.image || "https://images.unsplash.com/photo-1550950158-d0d960dff51b"}
              alt={selectedObs.nomi}
              className="w-11 h-11 rounded-xl object-cover border border-neutral-200 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">Tadqiqotchi</span>
              <span className="text-xs font-bold text-neutral-750 truncate block">
                {selectedObs.tadqiqotchi}
              </span>
            </div>
            <button
              onClick={() => {
                const plantDetails = SEEDED_PLANTS.find(p => p.nomi.toLowerCase() === selectedObs.nomi.toLowerCase()) || 
                                     SEEDED_PLANTS.find(p => p.id === selectedObs.plantId);
                if (plantDetails) {
                  setCustomDetailModal({
                    title: plantDetails.nomi,
                    lotincha: plantDetails.lotincha_nomi,
                    family: plantDetails.oilasi,
                    status: plantDetails.status,
                    izoh: plantDetails.tavsifi,
                    coordinates: `${selectedObs.kordinata.lat}° N, ${selectedObs.kordinata.lng}° E`,
                    imageUrl: selectedObs.image || plantDetails.image,
                    images: selectedObs.images,
                    video: selectedObs.video
                  });
                } else {
                  setCustomDetailModal({
                    title: selectedObs.nomi,
                    lotincha: selectedObs.lotincha_nomi,
                    family: selectedObs.oilasi,
                    status: selectedObs.status,
                    izoh: selectedObs.izoh,
                    coordinates: `${selectedObs.kordinata.lat}° N, ${selectedObs.kordinata.lng}° E`,
                    imageUrl: selectedObs.image,
                    images: selectedObs.images,
                    video: selectedObs.video
                  });
                }
              }}
              className="bg-neutral-900 hover:bg-neutral-850 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1 shrink-0"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Batafsil</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Control HUD Buttons */}
      <div 
        id="gis_control_panel_buttons" 
        className={`absolute right-4 z-[1000] flex flex-col gap-2 transition-all duration-300 ${
          selectedObs ? "bottom-[7rem] md:bottom-4" : "bottom-[5.5rem] md:bottom-4"
        }`}
      >
        <button
          onClick={handleZoomIn}
          className="w-11 h-11 bg-neutral-900/90 hover:bg-neutral-850 text-white rounded-xl shadow-xl flex items-center justify-center border border-neutral-800 transition active:scale-95"
          title="Kattalashtirish"
        >
          <ZoomIn className="w-5 h-5 text-amber-500" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-11 h-11 bg-neutral-900/90 hover:bg-neutral-850 text-white rounded-xl shadow-xl flex items-center justify-center border border-neutral-800 transition active:scale-95"
          title="Kichiklashtirish"
        >
          <ZoomOut className="w-5 h-5 text-amber-500" />
        </button>
        <button
          onClick={triggerGpsKuzatuv}
          disabled={gpsSimulating}
          className={`w-11 h-11 rounded-xl shadow-xl flex items-center justify-center border transition active:scale-95 z-[1000] ${
            gpsSimulating 
              ? "bg-amber-500 text-neutral-900 border-amber-600 animate-pulse" 
              : "bg-neutral-900/90 hover:bg-neutral-850 text-white border-neutral-800"
          }`}
          title="GPS Kuzatuv"
        >
          <Navigation className={`w-5 h-5 ${gpsSimulating ? "animate-spin" : "text-amber-500"}`} />
        </button>
      </div>

      {/* Mini Legend overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 bg-neutral-900/85 backdrop-blur-md border border-neutral-800 px-4 py-2.5 rounded-full text-[10px] text-neutral-400 font-mono shadow-xl select-none pointer-events-none z-[1000]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
          <span>Yo‘qolayotgan turlar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse" />
          <span>Kamayib borayotganlar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
          <span>Siz (GPS)</span>
        </div>
      </div>

      {/* Batafsil — O'ng tomondagi side panel (xaritani bloklaydi) */}
      {customDetailModal && (
        <>
          {/* Shaffof overlay — faqat yopish uchun, xira emas */}
          <div
            className="absolute inset-0 z-[1999]"
            onClick={() => setCustomDetailModal(null)}
          />
          {/* Side panel — o'ng tomonga yopishgan */}
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[380px] bg-white z-[2000] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-neutral-200">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-neutral-100 bg-white shrink-0">
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[10px] uppercase tracking-wider text-amber-600 font-black font-mono block">
                  {customDetailModal.family || "Botanika / Himoyalangan"}
                </span>
                <h3 className="text-lg font-display font-black text-neutral-900 mt-0.5 leading-tight">
                  {customDetailModal.title}
                </h3>
                {customDetailModal.lotincha && (
                  <p className="text-xs italic text-neutral-400 mt-0.5">
                    {customDetailModal.lotincha}
                  </p>
                )}
              </div>
              <button
                onClick={() => setCustomDetailModal(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold transition shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

              {/* Rasm */}
              {customDetailModal.imageUrl && (
                <div className="flex flex-col gap-2">
                  <img
                    src={customDetailModal.imageUrl}
                    alt={customDetailModal.title}
                    className="w-full h-44 object-cover rounded-2xl border border-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  {customDetailModal.images && customDetailModal.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {customDetailModal.images.map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-xl border border-neutral-200 overflow-hidden shrink-0 hover:border-amber-500 transition shadow-sm"
                        >
                          <img src={src} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video */}
              {customDetailModal.video && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Dala tasdiqlovchi video
                  </span>
                  <div className="bg-neutral-950 rounded-2xl p-2 border border-neutral-800">
                    <video
                      src={customDetailModal.video}
                      controls
                      preload="metadata"
                      className="w-full max-h-40 rounded-xl object-contain bg-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* Status va tavsif */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Maqomi va ekologik tahlili</span>
                {customDetailModal.status && (
                  <div className="inline-flex self-start text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-lg">
                    {customDetailModal.status}
                  </div>
                )}
                <p className="text-xs text-neutral-600 leading-relaxed font-medium bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
                  {customDetailModal.izoh}
                </p>
              </div>

              {/* Koordinata */}
              {customDetailModal.coordinates && (
                <div className="bg-neutral-900/5 p-3 rounded-2xl border border-neutral-200/50 flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-500 uppercase font-black text-[10px]">Ilmiy topilma nuqtasi:</span>
                  <span className="font-bold text-neutral-800">{customDetailModal.coordinates}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100 bg-white shrink-0">
              <button
                onClick={() => setCustomDetailModal(null)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-bold transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
