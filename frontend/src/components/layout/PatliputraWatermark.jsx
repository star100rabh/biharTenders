/**
 * @file src/components/layout/PatliputraWatermark.jsx
 * @description Authentic Bihar heritage and civil infrastructure background watermark:
 * - Left: Historic civil architecture (Mahabodhi Temple Shikhara, Nalanda Stupa & brick terraces, Ashoka Pillar).
 * - Right: Modern civil infrastructure (Mahatma Gandhi Setu steel trusses, JP Ganga Path flyover, construction cranes).
 * 
 * Stacking & Blending:
 * - Fixed background layer: `pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden`
 * - Base Light background: `#FAF8F5` with `opacity-15 mix-blend-multiply`
 * - Base Dark background: `#0D1117` with `dark:opacity-10 dark:invert dark:mix-blend-screen`
 * - Bottom gradient fade: `from-transparent via-transparent to-[#FAF8F5]/85 dark:to-[#0D1117]/90`
 */
import React from 'react';

export function PatliputraWatermark() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#0D1117] select-none transition-colors duration-200"
      aria-hidden="true"
    >
      {/* 
        Unified Architectural Line-Art Sketch 
        Left: Heritage (Mahabodhi + Nalanda + Ashoka Pillar)
        Right: Modern Civil Infrastructure (Gandhi Setu + JP Ganga Path + Tower Cranes)
      */}
      <svg 
        className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply dark:opacity-10 dark:invert dark:mix-blend-screen transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        stroke="#1F2937" 
        strokeWidth="1.2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          {/* Subtle architectural blueprint grid */}
          <pattern id="patliputra-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" stroke="#1F2937" strokeWidth="0.3" strokeOpacity="0.2" />
            <circle cx="40" cy="40" r="1.2" fill="#1F2937" fillOpacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#patliputra-grid)" stroke="none" />

        {/* ============================================================== */}
        {/* LEFT SECTION: HISTORIC BIHAR HERITAGE & CIVIL MONUMENTS       */}
        {/* ============================================================== */}

        {/* --- ASHOKA LION PILLAR OF VAISHALI (x: 50 - 150) --- */}
        <g transform="translate(60, 220)">
          {/* Pillar Foundation & Plinth */}
          <rect x="30" y="660" width="80" height="24" rx="2" />
          <line x1="20" y1="684" x2="120" y2="684" strokeWidth="2" />
          {/* Monolithic Shaft (Tapering Sandstone Column) */}
          <line x1="55" y1="660" x2="63" y2="160" strokeWidth="2.5" />
          <line x1="85" y1="660" x2="77" y2="160" strokeWidth="2.5" />
          <line x1="70" y1="660" x2="70" y2="160" strokeWidth="0.8" strokeDasharray="6 6" />
          {/* Inverted Lotus Bell Capital */}
          <path d="M 50 160 C 50 125 90 125 90 160 Z" strokeWidth="1.5" />
          <line x1="60" y1="160" x2="65" y2="132" />
          <line x1="70" y1="160" x2="70" y2="125" />
          <line x1="80" y1="160" x2="75" y2="132" />
          {/* Circular Abacus with Chakra Details */}
          <rect x="48" y="112" width="44" height="13" rx="2" strokeWidth="1.2" />
          <circle cx="70" cy="118.5" r="3.5" />
          {/* Lion Capital Silhouette */}
          <path d="M 58 112 C 56 86 64 76 70 72 C 76 76 84 86 82 112" strokeWidth="1.8" />
          <circle cx="70" cy="74" r="2.5" fill="#1F2937" />
        </g>

        {/* --- MAHABODHI TEMPLE GREAT SHIKHARA SPIRE (Bodh Gaya, x: 220 - 520) --- */}
        <g transform="translate(220, 140)">
          {/* Multi-layered Temple Plinth */}
          <rect x="70" y="680" width="300" height="60" rx="4" />
          <line x1="50" y1="740" x2="390" y2="740" strokeWidth="2" />
          <line x1="90" y1="710" x2="350" y2="710" strokeDasharray="4 4" />
          
          {/* Sanctum Arches and Niches */}
          <path d="M 110 680 L 110 620 Q 140 590 170 620 L 170 680" />
          <path d="M 190 680 L 190 600 Q 220 570 250 600 L 250 680" />
          <path d="M 270 680 L 270 620 Q 300 590 330 620 L 330 680" />

          {/* Stepped Pyramidal Main Shikhara Tower */}
          <polygon points="90,580 350,580 290,120 150,120" strokeWidth="1.6" />

          {/* Horizontal Stone Bhumi Tiers */}
          <line x1="96" y1="540" x2="344" y2="540" />
          <line x1="103" y1="500" x2="337" y2="500" />
          <line x1="110" y1="460" x2="330" y2="460" />
          <line x1="117" y1="420" x2="323" y2="420" />
          <line x1="124" y1="380" x2="316" y2="380" />
          <line x1="131" y1="340" x2="309" y2="340" />
          <line x1="138" y1="300" x2="302" y2="300" />
          <line x1="144" y1="260" x2="296" y2="260" />
          <line x1="148" y1="220" x2="292" y2="220" />
          <line x1="150" y1="180" x2="290" y2="180" />
          <line x1="150" y1="140" x2="290" y2="140" />

          {/* Shikhara Centerline & Chaitya Medallions */}
          <line x1="220" y1="120" x2="220" y2="580" strokeWidth="1.5" />
          <line x1="185" y1="120" x2="160" y2="580" strokeDasharray="3 3" />
          <line x1="255" y1="120" x2="280" y2="580" strokeDasharray="3 3" />
          {[520, 440, 360, 280, 200].map((y, idx) => (
            <circle key={idx} cx="220" cy={y} r="13" strokeWidth="1" />
          ))}

          {/* Amalaka Finial & Crown Kalasha */}
          <ellipse cx="220" cy="115" rx="38" ry="11" strokeWidth="1.5" />
          <ellipse cx="220" cy="98" rx="24" ry="7" />
          <path d="M 207 98 C 207 72 213 58 220 44 C 227 58 233 72 233 98" />
          <line x1="220" y1="44" x2="220" y2="20" strokeWidth="2" />
          <circle cx="220" cy="16" r="4" fill="#1F2937" />

          {/* Corner Miniature Turrets */}
          <polygon points="70,680 110,680 100,520 80,520" />
          <polygon points="330,680 370,680 360,520 340,520" />
        </g>

        {/* --- NALANDA MAHAVIHARA STUPA EXCAVATIONS (x: 550 - 860) --- */}
        <g transform="translate(560, 360)">
          {/* Multi-Tier Ancient Brick Platforms */}
          <rect x="30" y="440" width="340" height="28" rx="2" />
          <rect x="60" y="412" width="280" height="28" rx="2" />
          <rect x="90" y="384" width="220" height="28" rx="2" />
          <rect x="125" y="354" width="150" height="30" rx="3" />

          {/* Stupa Hemispherical Dome (Anda) */}
          <path d="M 140 354 C 140 270 260 270 260 354 Z" strokeWidth="1.5" />

          {/* Harmika & Tiered Chhatras */}
          <rect x="180" y="246" width="40" height="20" />
          <line x1="200" y1="246" x2="200" y2="180" strokeWidth="2" />
          <ellipse cx="200" cy="222" rx="28" ry="5" />
          <ellipse cx="200" cy="204" rx="22" ry="4" />
          <ellipse cx="200" cy="188" rx="14" ry="3.5" />

          {/* Excavated Monastic Arched Cells */}
          <path d="M 45 440 L 45 385 Q 65 360 85 385 L 85 440" strokeWidth="1" />
          <path d="M 285 440 L 285 385 Q 305 360 325 385 L 325 440" strokeWidth="1" />
          <polyline points="180,480 180,440 220,440 220,480" />
        </g>

        {/* ============================================================== */}
        {/* RIGHT SECTION: MODERN CIVIL INFRASTRUCTURE & BRIDGES          */}
        {/* ============================================================== */}

        {/* --- MAHATMA GANDHI SETU GANGA BRIDGE TRUSSES (x: 920 - 1880) --- */}
        <g transform="translate(900, 180)">
          {/* Continuous Highway Deck Slab across Ganga */}
          <line x1="20" y1="360" x2="980" y2="360" strokeWidth="3.5" />
          <line x1="20" y1="375" x2="980" y2="375" strokeWidth="1.8" />
          <line x1="20" y1="350" x2="980" y2="350" strokeWidth="0.8" strokeDasharray="8 6" />

          {/* Massive Deep-Well Concrete River Piers */}
          {[80, 280, 480, 680, 880].map((px, idx) => (
            <g key={idx}>
              {/* Flared Cantilever Pier Cap */}
              <polygon points={`${px-40},375 ${px+40},375 ${px+20},405 ${px-20},405`} strokeWidth="1.3" />
              {/* Dual Pier Shaft */}
              <rect x={px-16} y="405" width="13" height="230" />
              <rect x={px+3} y="405" width="13" height="230" />
              {/* Caisson Well Cap at Ganga River Bed */}
              <rect x={px-30} y="635" width="60" height="40" rx="3" strokeWidth="1.6" />
              <line x1={px-45} y1="675" x2={px+45} y2="675" strokeWidth="2.5" />
            </g>
          ))}

          {/* Steel Warren / Pratt Triangular Bridge Truss System */}
          <line x1="80" y1="285" x2="880" y2="285" strokeWidth="2.2" />
          {[80, 280, 480, 680].map((startX, idx) => (
            <g key={idx}>
              <line x1={startX} y1="360" x2={startX + 50} y2="285" strokeWidth="1.4" />
              <line x1={startX + 50} y1="285" x2={startX + 100} y2="360" strokeWidth="1.4" />
              <line x1={startX + 100} y1="360" x2={startX + 150} y2="285" strokeWidth="1.4" />
              <line x1={startX + 150} y1="285" x2={startX + 200} y2="360" strokeWidth="1.4" />

              {/* Vertical Stiffeners */}
              <line x1={startX + 50} y1="285" x2={startX + 50} y2="360" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={startX + 100} y1="285" x2={startX + 100} y2="360" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={startX + 150} y1="285" x2={startX + 150} y2="360" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          ))}
        </g>

        {/* --- PATNA JP GANGA PATH (MARINE DRIVE) CURVED ELEVATED FLYOVER --- */}
        <g transform="translate(920, 520)">
          {/* Sweeping Curvilinear Elevated Highway Ramp */}
          <path d="M 0 280 C 280 280 500 160 960 120" strokeWidth="3.5" />
          <path d="M 0 294 C 280 294 500 174 960 134" strokeWidth="1.8" />
          <path d="M 0 272 C 280 272 500 152 960 112" strokeWidth="0.8" strokeDasharray="6 4" />

          {/* Elevated Monopile Pier Columns */}
          {[120, 310, 500, 700, 880].map((cx, idx) => {
            const cy = 280 - (idx * 34);
            return (
              <g key={idx}>
                <rect x={cx-11} y={cy+14} width="22" height="160" rx="3" strokeWidth="1.4" />
                <line x1={cx-24} y1={cy+174} x2={cx+24} y2={cy+174} strokeWidth="2.5" />
              </g>
            );
          })}
        </g>

        {/* --- ACTIVE CIVIL TOWER CRANE & CONSTRUCTION SCAFFOLDING (x: 1680 - 1880) --- */}
        <g transform="translate(1620, 80)">
          {/* Tower Crane Vertical Lattice Mast */}
          <rect x="140" y="70" width="16" height="380" strokeWidth="1.4" />
          {/* Lattice Diagonal Bracing */}
          {[80, 120, 160, 200, 240, 280, 320, 360, 400].map((y, idx) => (
            <line key={idx} x1="140" y1={y} x2="156" y2={y + 40} strokeWidth="0.8" />
          ))}

          {/* Crane Operator Cabin */}
          <rect x="126" y="52" width="28" height="20" rx="2" strokeWidth="1.4" />

          {/* Apex Mast Top */}
          <polygon points="140,52 156,52 148,12" strokeWidth="1.4" />

          {/* Horizontal Working Jib / Boom */}
          <line x1="50" y1="42" x2="280" y2="42" strokeWidth="2.4" />

          {/* Tension Cables */}
          <line x1="148" y1="12" x2="250" y2="42" strokeWidth="0.9" />
          <line x1="148" y1="12" x2="70" y2="42" strokeWidth="0.9" />

          {/* Counterweight Block */}
          <rect x="50" y="44" width="26" height="18" rx="2" fill="#1F2937" fillOpacity="0.25" />

          {/* Hoist Trolley Cable & Suspension Hook */}
          <line x1="220" y1="42" x2="220" y2="160" strokeWidth="0.9" strokeDasharray="4 2" />
          <circle cx="220" cy="164" r="3.5" />
        </g>
      </svg>

      {/* 
        Subtle Bottom Fade Overlay:
        Ensures all high-density tender cards, tables, and text remain 100% legible as users scroll down.
      */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF8F5]/85 dark:to-[#0D1117]/90 pointer-events-none" 
      />
    </div>
  );
}
