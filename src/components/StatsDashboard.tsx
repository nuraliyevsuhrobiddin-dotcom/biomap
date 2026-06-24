import React, { useState, useMemo } from "react";
import { BarChart, ShieldAlert, Layers, MapPin, ClipboardList, Info, LineChart, PieChart, Trophy, Award, Star, Download, FileSpreadsheet, FileText, Printer, Filter } from "lucide-react";
import { SEEDED_PLANTS } from "../data/plants";
import { Observation, User } from "../types";

const REGIONS_GEODATA = [
  { id: "reg_tashkent", name: "Toshkent viloyati", lat: 41.3, lng: 69.6 },
  { id: "reg_jizzax", name: "Jizzax viloyati", lat: 40.1, lng: 67.8 },
  { id: "reg_surxondaryo", name: "Surxondaryo viloyati", lat: 38.0, lng: 67.2 },
  { id: "reg_qashqadaryo", name: "Qashqadaryo viloyati", lat: 38.8, lng: 66.0 },
  { id: "reg_samarqand", name: "Samarqand viloyati", lat: 39.6, lng: 66.9 },
  { id: "reg_namangan", name: "Namangan viloyati", lat: 41.0, lng: 71.2 },
  { id: "reg_fergana", name: "Farg'ona viloyati", lat: 40.3, lng: 71.7 },
  { id: "reg_buxoro", name: "Buxoro viloyati", lat: 40.0, lng: 64.4 },
  { id: "reg_navoiy", name: "Navoiy viloyati", lat: 41.5, lng: 64.5 },
  { id: "reg_qoraqalpogiston", name: "Qoraqalpog'iston Respub.", lat: 43.0, lng: 59.5 }
];

function getRegionIdFromCoords(lat: number, lng: number): string {
  let minDistance = Infinity;
  let closestRegionId = "reg_tashkent";
  
  for (const reg of REGIONS_GEODATA) {
    const dy = lat - reg.lat;
    const dx = lng - reg.lng;
    const dist = dy * dy + dx * dx;
    if (dist < minDistance) {
      minDistance = dist;
      closestRegionId = reg.id;
    }
  }
  return closestRegionId;
}

interface StatsDashboardProps {
  observations: Observation[];
  currentUser?: User | null;
}

export default function StatsDashboard({ observations: allObservations, currentUser }: StatsDashboardProps) {
  // Faqat admin tasdiqlagan kuzatuvlar statistikada ko'rinadi
  const observations = allObservations.filter(o => o.isApproved);
  const pendingCount = allObservations.filter(o => !o.isApproved).length;
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"umumiy" | "hududlar" | "statuslar" | "tadqiqotchilar" | "hisobotlar">("umumiy");

  // Reports & Exporter local states
  const [reportStatus, setReportStatus] = useState<string>("Barchasi");
  const [reportMethod, setReportMethod] = useState<string>("Barchasi");
  const [reportResearcher, setReportResearcher] = useState<string>("Barchasi");
  const [exportError, setExportError] = useState<string | null>(null);

  // Dynamic list of unique researchers in observations for filtering
  const dynamicResearchers = useMemo(() => {
    const names = new Set<string>();
    observations.forEach(obs => {
      if (obs.tadqiqotchi) {
        names.add(obs.tadqiqotchi);
      }
    });
    return Array.from(names);
  }, [observations]);

  // Filtered observations for the official report
  const filteredReportObservations = useMemo(() => {
    return observations.filter(obs => {
      // 1. Status Filter
      if (reportStatus !== "Barchasi") {
        if (reportStatus === "Status 1" && !obs.status?.includes("1")) return false;
        if (reportStatus === "Status 2" && !obs.status?.includes("2")) return false;
        if (reportStatus === "Status 3" && !obs.status?.includes("3") && obs.status?.includes("1") === false && obs.status?.includes("2") === false) return false;
      }
      
      // 2. Method Filter
      if (reportMethod !== "Barchasi") {
        const isAI = obs.isAIIdentified;
        if (reportMethod === "AI Scanner" && !isAI) return false;
        if (reportMethod === "Dala hisoboti" && isAI) return false;
      }

      // 3. Researcher Filter
      if (reportResearcher !== "Barchasi") {
        if (obs.tadqiqotchi !== reportResearcher) return false;
      }

      return true;
    });
  }, [observations, reportStatus, reportMethod, reportResearcher]);

  const handleExportFilteredCSV = () => {
    const headers = ["ID", "Nomi (Uzbek)", "Lotincha nomi", "Oila turkumi", "Qizil Kitob Maqomi", "Kenglik (Latitude)", "Uzunlik (Longitude)", "Sana", "Tadqiqotchi", "Identifikatsiya usuli", "Izoh"];
    const rows = filteredReportObservations.map(obs => [
      obs.id,
      `"${obs.nomi.replace(/"/g, '""')}"`,
      `"${(obs.lotincha_nomi || "").replace(/"/g, '""')}"`,
      `"${(obs.oilasi || "").replace(/"/g, '""')}"`,
      `"${(obs.status || "").replace(/"/g, '""')}"`,
      obs.kordinata.lat,
      obs.kordinata.lng,
      obs.sana,
      `"${obs.tadqiqotchi.replace(/"/g, '""')}"`,
      obs.isAIIdentified ? "AI SCANNER" : "MANUAL FIELD REPORT",
      `"${(obs.izoh || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BIOMap_Soha_Hisoboti_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFilteredPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportError("Brauzer popup oynani blokladi. Hisobotni ochish uchun popup ruxsatini yoqing.");
      setTimeout(() => setExportError(null), 4500);
      return;
    }

    const reportNo = `BI-HR-2026/06-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const total = filteredReportObservations.length;
    const aiCount = filteredReportObservations.filter(o => o.isAIIdentified).length;
    const s1 = filteredReportObservations.filter(o => o.status?.includes("1")).length;
    const s2 = filteredReportObservations.filter(o => o.status?.includes("2")).length;

    const rowsHtml = filteredReportObservations.map((obs, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: bold; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px;">
          <div style="font-weight: bold; color: #1e293b;">${obs.nomi}</div>
          ${obs.lotincha_nomi ? `<div style="font-style: italic; font-size: 11px; color: #64748b; margin-top: 2px;">${obs.lotincha_nomi}</div>` : ""}
        </td>
        <td style="padding: 10px; font-size: 11px; text-transform: uppercase;">${obs.oilasi || "Oila toifasiz"}</td>
        <td style="padding: 10px; text-align: center;">
          <span style="font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 4px; ${
            obs.status?.includes("1") 
              ? "background-color: #fef2f2; color: #991b1b; border: 1px solid #fee2e2;" 
              : obs.status?.includes("2")
              ? "background-color: #fffbeb; color: #92400e; border: 1px solid #fef3c7;"
              : "background-color: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;"
          }">
            ${obs.status || "Status aniqlanmagan"}
          </span>
        </td>
        <td style="padding: 10px; font-family: monospace; font-size: 11px; text-align: center;">
          ${obs.kordinata.lat.toFixed(4)}° N,<br/>${obs.kordinata.lng.toFixed(4)}° E
        </td>
        <td style="padding: 10px; font-size: 11px; text-align: center;">${obs.sana}</td>
        <td style="padding: 10px; font-size: 11px;">
          <div style="font-weight: 600; color: #334155;">${obs.tadqiqotchi}</div>
          <div style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase; margin-top: 3px;">
            ${obs.isAIIdentified ? "SOLUTIONS AI" : "DALA EKSPED."}
          </div>
        </td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rasmiy Hisobot_${reportNo}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: white;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
          }
          .header-container {
            text-align: center;
            border-bottom: 3px double #1e293b;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .title-republic {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin: 0 0 5px 0;
            color: #0f172a;
          }
          .title-institute {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0 0 8px 0;
            color: #334155;
          }
          .title-committee {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            margin: 0;
            letter-spacing: 0.5px;
          }
          .doc-num-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: bold;
            color: #475569;
            margin-bottom: 20px;
            font-family: monospace;
          }
          .doc-title {
            text-align: center;
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.3;
          }
          .filters-summary {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 25px;
          }
          .filters-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .filter-item {
            font-size: 12px;
          }
          .filter-label {
            font-weight: bold;
            color: #475569;
          }
          .filter-val {
            color: #0f172a;
            font-weight: 600;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-box {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          }
          .stat-num {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 5px;
          }
          .stat-label {
            font-size: 10px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .report-table th {
            background-color: #0f172a;
            color: white;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            padding: 12px 10px;
            letter-spacing: 0.5px;
          }
          .sign-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .sign-block {
            width: 250px;
            font-size: 12px;
          }
          .sign-line {
            border-bottom: 1px dashed #64748b;
            height: 35px;
            margin-bottom: 8px;
          }
          .sign-title {
            font-weight: bold;
            color: #334155;
          }
          .stamp-block {
            border: 2px solid #059669;
            border-radius: 8px;
            padding: 10px;
            color: #059669;
            text-align: center;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            align-self: center;
          }
          @media print {
            body {
              padding: 15px;
            }
            .print-btn-bar {
              display: none !important;
            }
          }
          .print-btn-bar {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 10px 20px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .btn-print {
            background-color: #10b981;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 12px;
          }
          .btn-close {
            background-color: #64748b;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <p class="title-republic">O'zbekiston Respublikasi Fanlar akademiyasi</p>
          <p class="title-institute">Botanika instituti</p>
          <p class="title-committee">Raqamli Biologik monitoring va Milliy Telemetriya Qo'mitasi</p>
        </div>

        <div class="doc-num-row">
          <span>Katalog raqami: ${reportNo}</span>
          <span>Sana: ${today}</span>
        </div>

        <div class="doc-title">
          Muhofaza ostidagi o'simlik turlari areallari monitoringi bo'yicha rasmiy hisobot
        </div>

        <div class="filters-summary">
          <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; tracking: 0.5px;">Eksport filtrlari ko'rsatkichlari:</div>
          <div class="filters-grid">
            <div class="filter-item">
              <span class="filter-label">Tanlangan Status:</span>
              <span class="filter-val">${reportStatus}</span>
            </div>
            <div class="filter-item">
              <span class="filter-label">Tadqiqotchi:</span>
              <span class="filter-val">${reportResearcher}</span>
            </div>
            <div class="filter-item">
              <span class="filter-label">Uslubiyat:</span>
              <span class="filter-val">${reportMethod}</span>
            </div>
            <div class="filter-item">
              <span class="filter-label">Umumiy eksport nuqtalari:</span>
              <span class="filter-val" style="color: #10b981;">${total} ta koordinata</span>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-num">${total}</div>
            <div class="stat-label">Jami topilmalar</div>
          </div>
          <div class="stat-box">
            <div class="stat-num" style="color: #b91c1c;">${s1}</div>
            <div class="stat-label">Yo'qolayotgan (I)</div>
          </div>
          <div class="stat-box">
            <div class="stat-num" style="color: #b45309;">${s2}</div>
            <div class="stat-label">Kamayayotgan (II)</div>
          </div>
          <div class="stat-box">
            <div class="stat-num" style="color: #047857;">${aiCount}</div>
            <div class="stat-label">AI Skanerlagan</div>
          </div>
        </div>

        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%; text-align: left; padding-left: 10px;">Tur nomi / Ilmiy latincha</th>
              <th style="width: 20%; text-align: left; padding-left: 10px;">Oila turkumi</th>
              <th style="width: 15%;">Status</th>
              <th style="width: 15%;">GIZ Koordinatalari</th>
              <th style="width: 10%;">Sanasi</th>
              <th style="width: 15%; text-align: left; padding-left: 10px;">Mas'ul tadqiqotchi</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="7" style="text-align: center; padding: 25px; color: #64748b; font-weight: bold;">Ushbu filtrlar bo'yicha hech qanday ma'lumot topilmadi.</td></tr>`}
          </tbody>
        </table>

        <div class="sign-section">
          <div class="sign-block">
            <div class="sign-line"></div>
            <div class="sign-title">GIZ ma'lumotlari auditor-mas'uli:</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Olim / S. Nuraliyev</div>
          </div>

          <div class="stamp-block">
            <span style="color: #059669; font-size: 12px; margin-bottom: 2px;">✓ DIGITALLY SEALED</span>
            <span>BOTANIKA INSTITUTI</span>
            <span style="font-size: 8px; color: #64748b;">GIS AUDITED SECURE • 2026</span>
          </div>

          <div class="sign-block" style="text-align: right;">
            <div class="sign-line"></div>
            <div class="sign-title">Ilmiy rahbar / Direktor:</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Akademik imzo / Muhr o'rni</div>
          </div>
        </div>

        <div class="print-btn-bar">
          <button class="btn-close" onclick="window.close()">Yopish</button>
          <button class="btn-print" onclick="window.print()">Ushbu hisobotni chop etish (PDF)</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Client-side telemetry data exporter for academic research (Excel / QGIS ready)
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(observations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BIOMap_Kuzatuvlar_Eksport_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Standard CSV headers for botanical databases
    const headers = ["ID", "Nomi (Uzbek)", "Lotincha nomi", "Oila turkumi", "Qizil Kitob Maqomi", "Kenglik (Latitude)", "Uzunlik (Longitude)", "Sana", "Tadqiqotchi nomi", "Identifikatsiya usuli"];
    const rows = observations.map(obs => [
      obs.id,
      `"${obs.nomi.replace(/"/g, '""')}"`,
      `"${(obs.lotincha_nomi || "").replace(/"/g, '""')}"`,
      `"${(obs.oilasi || "").replace(/"/g, '""')}"`,
      `"${(obs.status || "").replace(/"/g, '""')}"`,
      obs.kordinata.lat,
      obs.kordinata.lng,
      obs.sana,
      `"${obs.tadqiqotchi.replace(/"/g, '""')}"`,
      obs.isAIIdentified ? "AI SCANNER" : "MANUAL FIELD REPORT"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BIOMap_Telemetriya_Katalog_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  // Group and count observations per researcher dynamically (Real only)
  const researcherStats = useMemo(() => {
    const counts: Record<string, { count: number; lastActive: string; regions: Set<string> }> = {};
    
    // Process live observations
    observations.forEach((obs) => {
      const name = obs.tadqiqotchi || "Anonim Tadqiqotchi";
      if (!counts[name]) {
        counts[name] = { count: 0, lastActive: obs.sana, regions: new Set() };
      }
      counts[name].count += 1;
      
      // Keep track of the most recent activity date
      const obsDate = new Date(obs.sana);
      const prevDate = new Date(counts[name].lastActive);
      if (obsDate > prevDate || !counts[name].lastActive) {
        counts[name].lastActive = obs.sana;
      }
      if (obs.oilasi) {
        counts[name].regions.add(obs.oilasi.split(" / ")[0]);
      }
    });

    const combined: any[] = [];

    // Append live data
    Object.keys(counts).forEach(name => {
      const isSiz = name.toLowerCase().includes("suhrobiddin") || name.toLowerCase().includes("nuraliyev") || name.toLowerCase().includes("siz") || (currentUser && name.toLowerCase() === currentUser.fullname.toLowerCase());
      combined.push({
        name: isSiz ? `${currentUser?.fullname || "Suhrobiddin Nuraliyev"} (Siz)` : name,
        count: counts[name].count,
        lastActive: counts[name].lastActive,
        avatar: isSiz ? "🎯" : "🧑‍💻",
        specialty: counts[name].regions.size > 0 ? Array.from(counts[name].regions)[0] : "Dala nazorati"
      });
    });

    return combined.sort((a, b) => b.count - a.count);
  }, [observations, currentUser]);

  const userObservationsCount = useMemo(() => {
    const userFullname = currentUser?.fullname || "Suhrobiddin Nuraliyev";
    return observations.filter(o => 
      o.tadqiqotchi.toLowerCase().includes(userFullname.toLowerCase()) || 
      (currentUser && o.userId === currentUser.id)
    ).length;
  }, [observations, currentUser]);
  // Totals calculations
  const redBookCount = 314; // Estimated official red book flora of Uzbekistan
  const totalObservations = observations.length;

  // Status distributions
  const statusCounts = observations.reduce(
    (acc, obs) => {
      if (obs.status?.includes("1")) acc.yoqolib++;
      else if (obs.status?.includes("2")) acc.kamayib++;
      else acc.kamyob++;
      return acc;
    },
    { yoqolib: 0, kamayib: 0, kamyob: 0 }
  );

  // Dynamic regions calculation based on actual coordinates
  const regionStats = useMemo(() => {
    const stats: Record<string, { id: string; name: string; count: number }> = {};
    
    // Initialize
    REGIONS_GEODATA.forEach(reg => {
      stats[reg.id] = { id: reg.id, name: reg.name, count: 0 };
    });

    // Populate from active observations
    observations.forEach(obs => {
      if (obs.kordinata && typeof obs.kordinata.lat === "number" && typeof obs.kordinata.lng === "number") {
        const regId = getRegionIdFromCoords(obs.kordinata.lat, obs.kordinata.lng);
        if (stats[regId]) {
          stats[regId].count += 1;
        }
      }
    });

    return Object.values(stats);
  }, [observations]);

  // Maximum value for scaling the bar chart
  const maxRegionCount = useMemo(() => {
    const counts = regionStats.map(r => r.count);
    const max = Math.max(...counts);
    return max > 0 ? max : 1; // Prevent division by zero
  }, [regionStats]);

  return (
    <div id="stats_dashboard_container" className="w-full max-w-7xl mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      {exportError && (
        <div className="fixed bottom-6 right-6 z-[6000] bg-neutral-900 border border-neutral-750 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>{exportError}</span>
          <button
            onClick={() => setExportError(null)}
            className="text-neutral-400 hover:text-white ml-2 transition text-[10px]"
          >
            x
          </button>
        </div>
      )}
      
      {/* Mini Stats Bento Grid row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total species cataloged */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono uppercase font-semibold block leading-tight">Turlarning jami soni</span>
            <h3 className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 mt-0.5">{redBookCount}</h3>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 font-medium block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Barcha turlar ro‘yxatda</span>
          </div>
        </div>

        {/* Total Red Book endangered count */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold shrink-0">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono uppercase font-semibold block leading-tight">Yoʻqolib borayotganlar</span>
            <h3 className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 mt-0.5">{statusCounts.yoqolib}</h3>
            <span className="text-[9px] sm:text-[10px] text-red-500 font-medium font-semibold block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">FA nazorati ostida</span>
          </div>
        </div>

        {/* Total telemetry point observations */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold shrink-0">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono uppercase font-semibold block leading-tight">Kuzatuv nuqtalari</span>
            <h3 className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 mt-0.5">{totalObservations}</h3>
            <span className="text-[9px] sm:text-[10px] text-blue-500 font-medium block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Admin tasdiqlagan</span>
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold shrink-0">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono uppercase font-semibold block leading-tight">Admin kutmoqda</span>
            <h3 className="text-xl sm:text-2xl font-mono font-bold text-amber-500 mt-0.5">{pendingCount}</h3>
            <span className="text-[9px] sm:text-[10px] text-amber-500 font-medium font-semibold block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Tasdiqlanmagan</span>
          </div>
        </div>
      </div>

      {/* Modern Premium Category Tab Selector */}
      <div className="flex flex-wrap items-center justify-start gap-1 bg-neutral-100 p-1 sm:p-1.5 rounded-[20px] sm:rounded-[24px] border border-neutral-200 shadow-sm max-w-full md:max-w-4xl">
        <button
          onClick={() => setActiveTab("umumiy")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === "umumiy"
              ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/20"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          <span>Umumiy monitoring</span>
        </button>
        <button
          onClick={() => setActiveTab("hududlar")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === "hududlar"
              ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/20"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
          <span>Hududiy tahlil</span>
        </button>
        <button
          onClick={() => setActiveTab("statuslar")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === "statuslar"
              ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/20"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
          }`}
        >
          <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          <span>Statuslar tasnifi</span>
        </button>
        <button
          onClick={() => setActiveTab("tadqiqotchilar")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === "tadqiqotchilar"
              ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/20"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-500 shrink-0" />
          <span>Tadqiqotchilar faolligi</span>
        </button>
        <button
          onClick={() => setActiveTab("hisobotlar")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === "hisobotlar"
              ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/20"
              : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          <span>Rasmiy Hisobotlar</span>
        </button>
      </div>

      {/* Conditional category viewport container */}
      <div className="w-full transition-all duration-300">
        
        {/* ================= UMUMIY MONITORING TAB ================= */}
        {activeTab === "umumiy" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
            {/* Overview Informational Panel */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 font-display">Tizim boʻyicha qisqacha ma'lumot</h3>
                    <p className="text-xs text-neutral-400">Raqamli Biologik monitoring va Milliy Telemetriya platformasi</p>
                  </div>
                </div>

                <div className="space-y-4 text-neutral-600 text-xs md:text-sm leading-relaxed mt-4">
                  <p>
                    Ushbu tizim O'zbekiston Respublikasi Fanlar akademiyasi Botanika instituti olimlari faoliyatini raqamlashtirish yuzasidan yo'lga qo'yilgan. Platforma nobiologik, ekologik yuklamalarni baholash hamda muhofaza ostidagi o'simlik turlarining geo-axborot bazasini shakllantiradi.
                  </p>
                  <p>
                    <strong>Tizim imkoniyatlari:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs font-semibold text-neutral-700">
                    <li>Dala tadqiqotlari natijasida olingan o'simlik koordinatalarini to'g'ridan-to'g'ri GIS-xarita interfeysiga joylashtirish</li>
                    <li>Sinfga oid yuqori aniqlikdagi tasvirlarni sun'iy intellekt (AI Scanner) yordamida tezkor identifikatsiyalash</li>
                    <li>Noyob turlar arealini dinamik ravishda guruhlash va viloyatlar kesimida hisobotlar tayyorlash</li>
                  </ul>
                </div>
              </div>

              {/* Telemetry Export Center for Scientists */}
              <div className="border-t border-neutral-100 pt-5 mt-5">
                <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider block mb-2">
                  Ilmiy ma'lumotlar va Geo-telemetriya eksport markazi
                </span>
                <p className="text-xs text-neutral-500 mb-3">
                  Ushbu jadval ma'lumotlarini Excel, GIS QGIS yoki boshqa statistik databazalarda tahlil qilish uchun yuklab oling.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                    <span>Telemetriyani yuklab olish (CSV / Excel)</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>JSON formatida eksport</span>
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl mt-6 text-[11px] text-neutral-500 font-semibold italic">
                Saha olimlari va foydalanuvchilar tomonidan kiritilgan ma'lumotlarning ishonchliligi unvondor moderatorlar guruhi hamda geo-lokatsiya audit tizimi orqali nazoratdan o'tkaziladi.
              </div>
            </div>

            {/* Recent Live Observations list */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 font-display flex items-center gap-2 mb-4">
                  <ClipboardList className="w-4.5 h-4.5 text-blue-500" />
                  <span>Yaqindagi kuzatuvlar ({observations.length} ta)</span>
                </h3>

                <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {observations.map((obs) => {
                    return (
                      <div key={obs.id} className="flex gap-2.5 items-center p-2 rounded-2xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition">
                        <img
                          src={obs.image}
                          alt={obs.nomi}
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-150 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-800 truncate leading-snug">{obs.nomi}</h4>
                          <span className="text-[10px] block text-neutral-400 font-mono leading-none mt-0.5">{obs.sana} • {obs.tadqiqotchi.split(" ")[0]}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 shrink-0 block">
                          {obs.isAIIdentified ? "AI" : "FIELD"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-neutral-100 pt-3 mt-4 text-[10px] text-neutral-400 text-center font-mono font-medium">
                Tizim yangilanishi: Jonli vaqtda
              </div>
            </div>
          </div>
        )}

        {/* ================= HUDUDLAR TAHLILI TAB ================= */}
        {activeTab === "hududlar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
            {/* Main Bar Chart: Species Count by Region */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neutral-800 font-display flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-red-500" />
                    <span>Viloyatlar kesimida muhofaza turlar soni</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded-lg font-bold">
                    Yillik hisobot (2026)
                  </span>
                </div>

                {/* Custom SVG/HTML Bar Chart with precise sizing and hover tools */}
                <div id="stats_regions_chart" className="flex flex-col gap-3.5 mt-6">
                  {regionStats.slice().sort((a, b) => b.count - a.count).map((reg) => {
                    const percentage = (reg.count / maxRegionCount) * 100;
                    const isHovered = hoveredRegion === reg.id;
                    
                    return (
                      <div
                        key={reg.id}
                        onMouseEnter={() => setHoveredRegion(reg.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className={`flex items-center gap-4 transition-all duration-200 ${
                          isHovered ? "bg-amber-50/50 py-1 px-2 rounded-xl -mx-2" : ""
                        }`}
                      >
                        <span className="w-28 text-xs font-semibold text-neutral-600 truncate">{reg.name}</span>
                        
                        <div className="flex-1 h-3.5 bg-neutral-100 rounded-full overflow-hidden relative border border-neutral-150">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full transition-all duration-1000 rounded-full ${
                              percentage > 80 
                                ? "bg-red-500" 
                                : percentage > 50 
                                ? "bg-amber-500" 
                                : "bg-emerald-500"
                            }`}
                          />
                        </div>

                        <div className="w-12 text-right font-mono text-xs font-bold text-neutral-800">
                          {reg.count} ta
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 mt-6 flex items-center gap-2 text-[11px] text-neutral-400 leading-normal">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Viloyatlar bo‘yicha ekologik zonalar asosan tog‘li hududlar kesimida (Toshkent, Jizzax, Surxondaryo) yuqori ko’rsatkichga ega.</span>
              </div>
            </div>

            {/* Regions Info Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 font-display flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Kritik hududiy zonalar</span>
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed mb-4 font-semibold">
                  Hozirda geo-telemetry tahlillari bo'yicha quyidagi zonalarga tegishli ilmiy ekspeditsiyalar ko'paytirilishi zarur:
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 flex items-start gap-2.5">
                    <span className="text-lg">⛰️</span>
                    <div>
                      <h4 className="text-xs font-bold text-red-800">G'arbiy Tyan-Shan (Toshkent v.)</h4>
                      <p className="text-[10px] text-red-700 mt-0.5 font-medium">Lola va Kovrak turlarining qisqarish areali eng yuqori bo'lgan zona.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start gap-2.5">
                    <span className="text-lg">🏜️</span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-800">Orolbo'yi va Qizilqum (Qoraqalpog'iston)</h4>
                      <p className="text-[10px] text-amber-705 mt-0.5 font-medium">Cho'l florasining sho'rlanish tufayli generativ organlari zaiflashuvi.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                    <span className="text-lg">🗻</span>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800">Hisor-Zarafshon tog'lari</h4>
                      <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">Endemik turlarni tabiatda saqlash va monitoringini yuritish talab etiladi.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-neutral-400 mt-6 pt-3 border-t border-neutral-100 font-mono text-center font-medium">
                * Koordinata xaritalash real-vaqtda yangilanadi.
              </div>
            </div>
          </div>
        )}

        {/* ================= STATUSLAR TASNIFI TAB ================= */}
        {activeTab === "statuslar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
            {/* Status Ratio Indicators */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-800 font-display flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-emerald-500" />
                  <span>Kuzatilgan turlarning muhofaza statusi ulushi</span>
                </h3>

                <div className="space-y-6">
                  
                  {/* Yo'qolib borayotgan */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-neutral-750 mb-1.5 transition-all">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        1 — Yo‘qolib borayotgan (Kategoria I)
                      </span>
                      <span className="font-bold text-neutral-800 font-mono bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg border border-red-100">
                        {Math.round((statusCounts.yoqolib / (totalObservations || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-150">
                      <div style={{ width: `${(statusCounts.yoqolib / (totalObservations || 1)) * 100}%` }} className="h-full bg-red-500" />
                    </div>
                  </div>

                  {/* Kamayib borayotgan */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-neutral-750 mb-1.5 transition-all">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        2 — Kamayib borayotgan (Kategoria II)
                      </span>
                      <span className="font-bold text-neutral-800 font-mono bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-lg border border-amber-100">
                        {Math.round((statusCounts.kamayib / (totalObservations || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-150">
                      <div style={{ width: `${(statusCounts.kamayib / (totalObservations || 1)) * 100}%` }} className="h-full bg-amber-500" />
                    </div>
                  </div>

                  {/* Kamyob */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-neutral-750 mb-1.5 transition-all">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        3 — Kamyob va cheklangan turlar
                      </span>
                      <span className="font-bold text-neutral-800 font-mono bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                        {Math.round((statusCounts.kamyob / (totalObservations || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-150">
                      <div style={{ width: `${(statusCounts.kamyob / (totalObservations || 1)) * 100}%` }} className="h-full bg-emerald-500" />
                    </div>
                  </div>

                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 mt-8 flex items-center gap-2 text-[11px] text-neutral-400 font-semibold">
                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ushbu foizlar kiritilgan jami dala topilmalari soni va ularning tasdiqlangan statuslariga asosan hisoblangan.</span>
              </div>
            </div>

            {/* Status Guidelines definitions Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 font-display flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                  <span>Qizil kitob statuslari tushuntirishi</span>
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  O`zbekiston Respublikasi "Qizil Kitobi"da biologik turlar quyidagi muhofaza darajalariga ko`ra ajratiladi:
                </p>

                <div className="space-y-3.5">
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-150">
                    <span className="text-xs font-bold text-red-650 block">Status 1: Yoʻqolib borayotgan tur</span>
                    <p className="text-[10px] text-neutral-500 leading-normal mt-1 font-medium">Butunlay yo‘q bo‘lib ketish xavfi ostidagi, saqlab qolish uchun maxsus biotexnik va muhofaza choralari ko'rilishi shart bo'lgan o'ta nozik turlar.</p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-150">
                    <span className="text-xs font-bold text-amber-650 block">Status 2: Kamayib borayotgan tur</span>
                    <p className="text-[10px] text-neutral-500 leading-normal mt-1 font-medium">Yashash muhiti buzilayotganligi yoxud inson ta'siri (chorvachilik, dorivorlik yig'imi) oqibatida areali shiddat bilan qisqarayotgan o‘simliklar.</p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-150">
                    <span className="text-xs font-bold text-emerald-600 block">Status 3: Kamyob tur</span>
                    <p className="text-[10px] text-neutral-500 leading-normal mt-1 font-medium">Tabiatan tor doiradagi maxsus mikro-iqlimda o'suvchi, areali kichik bo'lsada barqaror, ammo diqqat bilan nazorat qilish talab qilinadigan botanik boyliklar.</p>
                  </div>
                </div>
              </div>

              <span className="text-[9px] text-neutral-400 font-mono mt-4 block text-center">
                Manba: O'zbekiston Respublikasi Qizil Kitobi.
              </span>
            </div>
          </div>
        )}

        {/* ================= TADQIQOTCHILAR TAB ================= */}
        {activeTab === "tadqiqotchilar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
            {/* TOP Tadqiqotchilar Block */}
            <div className="lg:col-span-8 bg-white rounded-[32px] p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-800 font-display">
                        Eng faol tadqiqotchilar (TOP)
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-medium">
                        Tizimga kiritilgan eng so'nggi tasdiqlangan monitoring va aniqlangan o'simlik turlari areali soni bo'yicha.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider border border-amber-200/50">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                    <span>Reyting paneli</span>
                  </div>
                </div>

                {/* List of active top researchers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researcherStats.map((res, index) => {
                    const isTop3 = index < 3;
                    const badges = ["🥇", "🥈", "🥉"];
                    const maxCount = Math.max(...researcherStats.map(r => r.count));
                    const progressPercent = (res.count / (maxCount || 1)) * 100;

                    return (
                      <div
                        key={res.name}
                        className="flex flex-col gap-2.5 p-4 rounded-2.5xl bg-neutral-50/50 border border-neutral-200/60 hover:border-amber-300 transition duration-300 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white border border-neutral-150 flex items-center justify-center text-xl shadow-sm relative shrink-0">
                              {res.avatar}
                              {isTop3 && (
                                <span className="absolute -top-1.5 -right-1.5 text-xs bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-neutral-100">
                                  {badges[index]}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-neutral-850 flex items-center gap-1.5 leading-snug">
                                <span>{res.name}</span>
                                {res.name.includes("(Siz)") && (
                                  <span className="text-[8px] bg-amber-500 text-neutral-950 font-extrabold px-1.5 py-0.5 rounded-full uppercase font-mono tracking-wider shrink-0 font-extrabold">Siz</span>
                                )}
                              </h4>
                              <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5 truncate max-w-40" title={res.specialty}>
                                {res.specialty}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-neutral-850 font-mono block">
                              {res.count} ta nuqta
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono font-medium block mt-0.5">
                              {res.lastActive}
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${progressPercent}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-neutral-300"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Campaign Info Card */}
            <div className="lg:col-span-4 bg-gradient-to-br from-amber-500/10 via-amber-600/[0.03] to-transparent rounded-[32px] p-6 lg:p-8 border border-neutral-200/80 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-amber-850 font-display flex items-center gap-2 mb-3 animate-pulse">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Sizning hissangiz</span>
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                  Kritgan har bir yovvoyi tabiat monitoringingiz, koordinatalaringiz va ilmiy kuzatuv suratlaringiz O'zbekistonning nozik o'simlik xilma-xilligi Milliy bazasini mustahkamlaydi hamda ilmiy jamoamizga kuch bag'ishlaydi.
                </p>

                <div className="bg-white/85 backdrop-blur border border-neutral-200 p-4 rounded-2xl mt-5 text-[11px] text-stone-600 font-mono shadow-inner">
                  <div className="flex justify-between mb-1.5">
                    <span>Ekspeditsiyalar soni:</span>
                    <span className="font-bold text-neutral-850">{userObservationsCount} marta</span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span>Olingan litsenziya:</span>
                    <span className="font-bold text-neutral-850">{userObservationsCount > 0 ? "Ekologik GIS No-423" : "Mavjud emas"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Raqamli sertifikat:</span>
                    <span className="text-emerald-700 font-bold uppercase font-sans text-[10px]">Aktiv</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-neutral-450 mt-6 pt-3 border-t border-neutral-100 font-mono leading-relaxed font-semibold italic">
                * Hisoblar har 24 soatda Botanika instituti qo'mitasi tomonidan verifikatsiya qilinadi.
              </div>
            </div>
          </div>
        )}

        {/* ================= HISOBOTLAR TAB ================= */}
        {activeTab === "hisobotlar" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header / Intro section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-sm">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-605 font-bold">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 font-display">Ilmiy hisobotlar va eksport generatsiya markazi</h3>
                  <p className="text-xs text-neutral-400">O'zbekiston Respublikasi Fanlar akademiyasi Botanika instituti andozalariga asosan rasmiy hisobot tayyorlash</p>
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
                Ushbu tahliliy va rasmiy hisobot generatsiyasi sohadagi botanik olimlar va biologiya mutaxassislarining dala tadqiqotlari natijalarini vazirliklar yoxud ma'muriy qo'mitalarga rasmiy shaklda taqdim etishini osonlashtirish uchun mo'ljallangan. Quyidagi filtrlardan foydalanib jadvalni shakllantiring va chop etuvchi PDF yoki QGIS-ready CSV formatidgi kataloglarni yuklab oling.
              </p>
            </div>

            {/* Filters Section & Stats Summary Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Filter controls column */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-amber-500" />
                  <span>Dala ma'lumotlari bo'yicha filtrlar</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-500">Muhofaza maqomi (Qizil Kitob):</label>
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                      className="bg-neutral-50 hover:bg-neutral-100 transition px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-850 outline-none focus:border-amber-500 shadow-sm"
                    >
                      <option value="Barchasi">Barchasi (Status 1, 2, 3)</option>
                      <option value="Status 1">1 - Yo'qolib borayotgan</option>
                      <option value="Status 2">2 - Kamayib borayotgan</option>
                      <option value="Status 3">3 - Kamyob turlar</option>
                    </select>
                  </div>

                  {/* Method selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-500">Kiritilish / Identifikatsiya uslubi:</label>
                    <select
                      value={reportMethod}
                      onChange={(e) => setReportMethod(e.target.value)}
                      className="bg-neutral-50 hover:bg-neutral-100 transition px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-850 outline-none focus:border-amber-500 shadow-sm"
                    >
                      <option value="Barchasi">Barcha usullar</option>
                      <option value="AI Scanner">Sun'iy intellekt (AI scanner)</option>
                      <option value="Dala hisoboti">Dala ekspeditsiyasi monitoringi</option>
                    </select>
                  </div>

                  {/* Researcher selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-500">Mas'ul tadqiqotchi:</label>
                    <select
                      value={reportResearcher}
                      onChange={(e) => setReportResearcher(e.target.value)}
                      className="bg-neutral-50 hover:bg-neutral-100 transition px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-850 outline-none focus:border-amber-500 shadow-sm"
                    >
                      <option value="Barchasi">Barcha olimlar va jamoalar</option>
                      {dynamicResearchers.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Exporter triggers */}
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-neutral-100">
                  <button
                    onClick={handleExportFilteredPDF}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-emerald-100" />
                    <span>Rasmiy PDF Hisobotini Chop etish</span>
                  </button>
                  <button
                    onClick={handleExportFilteredCSV}
                    className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                    <span>Filtrlangan ma'lumotlarni CSV yuklash</span>
                  </button>
                </div>
              </div>

              {/* Subset Stats Card */}
              <div className="lg:col-span-4 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl p-6 border border-neutral-200/80 shadow-sm h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-extrabold mb-3">
                    Hisob-kitob natijalari
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-semibold mb-4">
                    Tizimdagi jami ma'lumotlardan tanlangan filtr buyruqlari asosida sarolangan hisobot ko'rsatkichlari.
                  </p>

                  <div className="space-y-2.5 bg-white/70 rounded-2xl p-4 border border-neutral-200/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-semibold">Saralangan nuqtalar:</span>
                      <span className="font-bold text-neutral-900 font-mono text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {filteredReportObservations.length} ta
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-semibold">Yo'qolayotgan (I) soni:</span>
                      <span className="font-bold text-neutral-900 font-mono">
                        {filteredReportObservations.filter(o => o.status?.includes("1")).length} ta
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-semibold">Kamayayotgan (II) soni:</span>
                      <span className="font-bold text-neutral-900 font-mono">
                        {filteredReportObservations.filter(o => o.status?.includes("2")).length} ta
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-semibold">SUN'IY INTELLEKT ulushi:</span>
                      <span className="font-bold text-neutral-900 font-mono">
                        {filteredReportObservations.filter(o => o.isAIIdentified).length} ta
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-450 font-mono leading-relaxed mt-4">
                  * Ma'lumotlar Botanika Institutining ilmiy andozalariga to'liq javob beradi hamda rasmiy tasdiq muhrlariga ega.
                </div>
              </div>
            </div>

            {/* Main Table listing Filtered Observations */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  Hisobot jadvali ko'rinishi ({filteredReportObservations.length} ta topilma)
                </h4>
                <div className="text-[11px] text-neutral-500 font-semibold italic bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-150">
                  Saralangan jadval chop etishda PDF formatida to'liq andoza shaklida ko'rsatiladi.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-400 uppercase tracking-wider font-bold text-[10px] border-b border-o-neutral-200">
                      <th className="p-4 text-center w-12">#</th>
                      <th className="p-4">Rasm</th>
                      <th className="p-4">O'simlik nomi</th>
                      <th className="p-4">Oila turkumi</th>
                      <th className="p-4">Maqomi (Status)</th>
                      <th className="p-4 text-center">GIZ Koordinatalari</th>
                      <th className="p-4 text-center">Sana</th>
                      <th className="p-4">Tadqiqotchi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {filteredReportObservations.length > 0 ? (
                      filteredReportObservations.map((obs, idx) => (
                        <tr key={obs.id} className="hover:bg-neutral-50/50 transition">
                          <td className="p-4 text-center font-bold text-neutral-400">{idx + 1}</td>
                          <td className="p-4">
                            <img
                              src={obs.image}
                              alt={obs.nomi}
                              className="w-9 h-9 rounded-lg object-cover border border-neutral-200"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-neutral-800">{obs.nomi}</div>
                            {obs.lotincha_nomi && (
                              <div className="text-[10px] italic text-neutral-400 font-mono mt-0.5">{obs.lotincha_nomi}</div>
                            )}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-neutral-500 uppercase font-semibold">{obs.oilasi || "Oila toifasiz"}</td>
                          <td className="p-4">
                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              obs.status?.includes("1")
                                ? "bg-red-50 text-red-600 border border-red-200/50"
                                : obs.status?.includes("2")
                                ? "bg-amber-50 text-amber-600 border border-amber-200/50"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                            }`}>
                              {obs.status || "Status kiritilmagan"}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-[10px] text-neutral-500">
                            {obs.kordinata.lat.toFixed(4)}°, {obs.kordinata.lng.toFixed(4)}°
                          </td>
                          <td className="p-4 text-center font-mono text-neutral-500">{obs.sana}</td>
                          <td className="p-4 font-semibold text-neutral-700">
                            <div>{obs.tadqiqotchi}</div>
                            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block mt-0.5">
                              {obs.isAIIdentified ? "AI SCANNER" : "MANUAL REPORT"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-neutral-400 font-semibold">
                          Ushbu filtrlar bo'yicha hech qanday ma'lumot topilmadi. Filtr parametrlarini o'zgartirib ko'ring.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
