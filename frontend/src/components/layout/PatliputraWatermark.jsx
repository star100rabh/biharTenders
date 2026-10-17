/**
 * @file src/components/layout/PatliputraWatermark.jsx
 * @description Fixed architectural watermark layer depicting Bihar's civil heritage:
 * - Light Mode: Ancient architectural sketches (Mahabodhi Temple spire, Nalanda stupa terraces, Ashoka column)
 *   in faint earthy-sepia (#8C6D58) at 5% opacity against warm parchment (#FAF8F5).
 * - Dark Mode: Modern civil engineering (Mahatma Gandhi Setu bridge, JP Ganga Path flyover, steel truss & cranes)
 *   in desaturated indigo-gray (#7EA2D6) at 2% opacity against deep basalt (#0D1117).
 * - Split Mode: Side-by-side rendering with Light mode on the left and Dark mode on the right.
 */
import React from 'react';
import { useTheme } from '@/context/ThemeProvider';

export function PatliputraWatermark() {
  const { theme, isDark } = useTheme();
  const isSplit = theme === 'split';

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden" 
      aria-hidden="true"
    >
      {isSplit ? (
        // Side-by-side split view watermark: Left Light, Right Dark
        <div className="w-full h-full grid grid-cols-2">
          {/* Left: Historic Light Canvas */}
          <div className="relative w-full h-full bg-[#FAF8F5] border-r border-[#E6E1D8]">
            <HistoricWatermarkSvg opacity={0.05} strokeColor="#8C6D58" />
          </div>
          {/* Right: Modern Dark Canvas */}
          <div className="relative w-full h-full bg-[#0D1117]">
            <ModernWatermarkSvg opacity={0.02} strokeColor="#7EA2D6" />
          </div>
        </div>
      ) : isDark ? (
        // Standard Dark Mode Watermark: Gandhi Setu + JP Ganga Path
        <div className="relative w-full h-full bg-[#0D1117]">
          <ModernWatermarkSvg opacity={0.02} strokeColor="#7EA2D6" />
        </div>
      ) : (
        // Standard Light Mode Watermark: Mahabodhi + Nalanda + Ashoka Pillar
        <div className="relative w-full h-full bg-[#FAF8F5]">
          <HistoricWatermarkSvg opacity={0.05} strokeColor="#8C6D58" />
        </div>
      )}
    </div>
  );
}

/**
 * Historical Architectural Sketch SVG (Mahabodhi Temple, Nalanda Stupa, Ashoka Column)
 */
function HistoricWatermarkSvg({ opacity = 0.05, strokeColor = '#8C6D58' }) {
  return (
    <svg 
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1600 1200" 
      fill="none" 
      stroke={strokeColor} 
      strokeWidth="1.2"
      strokeLinecap="round" 
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Background Geometric Grid / Kachni Guidelines */}
      <defs>
        <pattern id="kachni-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 80 M 0 0 L 80 80" stroke={strokeColor} strokeWidth="0.3" strokeOpacity="0.25" />
          <circle cx="40" cy="40" r="1.5" fill={strokeColor} fillOpacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kachni-grid)" stroke="none" />

      {/* --- MAHABODHI TEMPLE TOWER (Center Left, Bodh Gaya) --- */}
      <g transform="translate(180, 220)">
        {/* Foundation & Base Plinth */}
        <rect x="100" y="680" width="300" height="70" rx="4" />
        <line x1="80" y1="750" x2="420" y2="750" strokeWidth="2" />
        <line x1="120" y1="715" x2="380" y2="715" strokeDasharray="4 4" />
        
        {/* Niches and Sculptural Relief Rows in Lower Sanctum */}
        <path d="M 140 680 L 140 620 Q 170 590 200 620 L 200 680" />
        <path d="M 220 680 L 220 600 Q 250 570 280 600 L 280 680" />
        <path d="M 300 680 L 300 620 Q 330 590 360 620 L 360 680" />
        
        {/* Pyramidal Main Shikhara Spire (Tapering Terraces with Chaitya Windows) */}
        <polygon points="120,580 380,580 320,120 180,120" strokeWidth="1.5" />
        
        {/* Horizontal Terraced Bhumis (Layers of Stone & Ancient Bricks) */}
        <line x1="126" y1="540" x2="374" y2="540" />
        <line x1="133" y1="500" x2="367" y2="500" />
        <line x1="140" y1="460" x2="360" y2="460" />
        <line x1="148" y1="420" x2="352" y2="420" />
        <line x1="155" y1="380" x2="345" y2="380" />
        <line x1="162" y1="340" x2="338" y2="340" />
        <line x1="168" y1="300" x2="332" y2="300" />
        <line x1="174" y1="260" x2="326" y2="260" />
        <line x1="178" y1="220" x2="322" y2="220" />
        <line x1="180" y1="180" x2="320" y2="180" />
        <line x1="180" y1="140" x2="320" y2="140" />

        {/* Central Vertical Spine Ribs */}
        <line x1="250" y1="120" x2="250" y2="580" strokeWidth="1.5" />
        <line x1="215" y1="120" x2="190" y2="580" strokeDasharray="3 3" />
        <line x1="285" y1="120" x2="310" y2="580" strokeDasharray="3 3" />

        {/* Chaitya Arch Medallions on the Shikhara */}
        {[520, 440, 360, 280, 200].map((y, idx) => (
          <circle key={idx} cx="250" cy={y} r="14" strokeWidth="1" />
        ))}

        {/* Crown Amalaka (Ribbed Cogged Stone Disc) & Kalasha Finial */}
        <ellipse cx="250" cy="115" rx="42" ry="12" strokeWidth="1.5" />
        <ellipse cx="250" cy="98" rx="26" ry="8" />
        <path d="M 235 98 C 235 70 242 55 250 40 C 258 55 265 70 265 98" />
        <line x1="250" y1="40" x2="250" y2="15" strokeWidth="2" />
        <circle cx="250" cy="12" r="4" fill={strokeColor} />

        {/* Corner Miniature Votive Shikharas */}
        <polygon points="100,680 140,680 130,520 110,520" />
        <polygon points="360,680 400,680 390,520 370,520" />
      </g>

      {/* --- NALANDA MAHAVIHARA STUPA EXCAVATIONS (Bottom Right) --- */}
      <g transform="translate(850, 450)">
        {/* Ancient Brick Layered Terraces */}
        <rect x="100" y="450" width="550" height="35" rx="2" />
        <rect x="140" y="415" width="470" height="35" rx="2" />
        <rect x="180" y="380" width="390" height="35" rx="2" />
        <rect x="230" y="340" width="290" height="40" rx="3" />
        
        {/* Stupa Semi-Spherical Dome (Anda) */}
        <path d="M 270 340 C 270 230 430 230 430 340 Z" strokeWidth="1.5" />
        
        {/* Harmika (Square Balcony atop Stupa) */}
        <rect x="325" y="200" width="50" height="25" />
        <line x1="325" y1="212" x2="375" y2="212" strokeDasharray="3 3" />
        
        {/* Chhatravali (Multi-Tiered Honorific Umbrella Discs) */}
        <line x1="350" y1="200" x2="350" y2="120" strokeWidth="2" />
        <ellipse cx="350" cy="170" rx="36" ry="6" />
        <ellipse cx="350" cy="150" rx="28" ry="5" />
        <ellipse cx="350" cy="130" rx="18" ry="4" />
        
        {/* Corner Votive Stupas & Monastic Cell Brick Arches */}
        <path d="M 120 450 L 120 370 Q 145 340 170 370 L 170 450" strokeWidth="1" />
        <path d="M 530 450 L 530 370 Q 555 340 580 370 L 580 450" strokeWidth="1" />
        
        {/* Ancient Step-wells and Monastic Stairs */}
        <polyline points="330,485 330,450 370,450 370,485" />
        <line x1="330" y1="462" x2="370" y2="462" />
        <line x1="330" y1="474" x2="370" y2="474" />
      </g>

      {/* --- ASHOKA LION PILLAR OF VAISHALI / PATLIPUTRA (Far Left) --- */}
      <g transform="translate(60, 300)">
        {/* Monolithic Polished Sandstone Column Shaft */}
        <line x1="60" y1="750" x2="72" y2="220" strokeWidth="2.5" />
        <line x1="90" y1="750" x2="78" y2="220" strokeWidth="2.5" />
        <line x1="75" y1="750" x2="75" y2="220" strokeWidth="0.8" strokeDasharray="6 6" />

        {/* Inverted Lotus Bell Capital */}
        <path d="M 55 220 C 55 185 95 185 95 220 Z" strokeWidth="1.5" />
        <line x1="65" y1="220" x2="70" y2="190" />
        <line x1="75" y1="220" x2="75" y2="185" />
        <line x1="85" y1="220" x2="80" y2="190" />

        {/* Circular Abacus Decorated with Ashoka Chakra Spoke Lines */}
        <rect x="52" y="172" width="46" height="15" rx="3" />
        <circle cx="75" cy="180" r="4.5" />
        
        {/* Lion Capital Silhouette */}
        <path d="M 62 172 C 60 145 68 135 75 130 C 82 135 90 145 88 172" strokeWidth="1.8" />
        <circle cx="75" cy="132" r="3" fill={strokeColor} />
      </g>
    </svg>
  );
}

/**
 * Modern Civil Engineering Watermark SVG (Mahatma Gandhi Setu, JP Ganga Path, Steel Truss Bridges, Scaffolding Cranes)
 */
function ModernWatermarkSvg({ opacity = 0.02, strokeColor = '#7EA2D6' }) {
  return (
    <svg 
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1600 1200" 
      fill="none" 
      stroke={strokeColor} 
      strokeWidth="1.2"
      strokeLinecap="round" 
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Background Engineering Technical Grid */}
      <defs>
        <pattern id="modern-tech-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" stroke={strokeColor} strokeWidth="0.4" strokeOpacity="0.3" />
          <line x1="0" y1="30" x2="60" y2="30" stroke={strokeColor} strokeWidth="0.2" strokeDasharray="2 4" strokeOpacity="0.2" />
          <line x1="30" y1="0" x2="30" y2="60" stroke={strokeColor} strokeWidth="0.2" strokeDasharray="2 4" strokeOpacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#modern-tech-grid)" stroke="none" />

      {/* --- MAHATMA GANDHI SETU & STEEL TRUSS GIRDERS (Spanning Top-to-Center) --- */}
      <g transform="translate(50, 180)">
        {/* Continuous Elevated Deck Slab */}
        <line x1="0" y1="400" x2="1500" y2="400" strokeWidth="4" />
        <line x1="0" y1="416" x2="1500" y2="416" strokeWidth="2" />
        <line x1="0" y1="390" x2="1500" y2="390" strokeWidth="1" strokeDasharray="8 6" />

        {/* Massive Concrete Pillars & Well Foundations into Ganga River */}
        {[100, 360, 620, 880, 1140, 1400].map((x, idx) => (
          <g key={idx}>
            {/* Flared Pier Cap */}
            <polygon points={`${x-45},416 ${x+45},416 ${x+25},450 ${x-25},450`} strokeWidth="1.5" />
            {/* Dual Column Pier Shaft */}
            <rect x={x-20} y="450" width="16" height="280" />
            <rect x={x+4} y="450" width="16" height="280" />
            {/* Well Cap / Caisson Foundation into River Bed */}
            <rect x={x-35} y="730" width="70" height="50" rx="3" strokeWidth="2" />
            <line x1={x-50} y1="780" x2={x+50} y2="780" strokeWidth="3" />
          </g>
        ))}

        {/* Steel Warren / Pratt Triangular Truss System on Girders */}
        <line x1="100" y1="320" x2="1400" y2="320" strokeWidth="2.5" />
        {[100, 360, 620, 880, 1140].map((startX, idx) => (
          <g key={idx}>
            {/* Steel Truss Web (Diagonal Braces & Vertical Posts) */}
            <line x1={startX} y1="400" x2={startX + 65} y2="320" strokeWidth="1.5" />
            <line x1={startX + 65} y1="320" x2={startX + 130} y2="400" strokeWidth="1.5" />
            <line x1={startX + 130} y1="400" x2={startX + 195} y2="320" strokeWidth="1.5" />
            <line x1={startX + 195} y1="320" x2={startX + 260} y2="400" strokeWidth="1.5" />

            <line x1={startX + 65} y1="320" x2={startX + 65} y2="400" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={startX + 130} y1="320" x2={startX + 130} y2="400" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={startX + 195} y1="320" x2={startX + 195} y2="400" strokeWidth="1" strokeDasharray="3 3" />
          </g>
        ))}
      </g>

      {/* --- PATNA JP GANGA PATH (MARINE DRIVE) CURVED ELEVATED FLYOVER --- */}
      <g transform="translate(100, 580)">
        {/* Curvilinear Sweeping Highway Ramp */}
        <path d="M 0 350 C 400 350 700 200 1400 160" strokeWidth="4" />
        <path d="M 0 366 C 400 366 700 216 1400 176" strokeWidth="2" />
        <path d="M 0 342 C 400 342 700 192 1400 152" strokeWidth="1" strokeDasharray="6 4" />

        {/* Prestressed Concrete Box Girder Support Columns */}
        {[180, 420, 680, 960, 1220].map((cx, idx) => {
          const cy = 350 - (idx * 38);
          return (
            <g key={idx}>
              <rect x={cx-14} y={cy+16} width="28" height="200" rx="3" strokeWidth="1.5" />
              <line x1={cx-30} y1={cy+216} x2={cx+30} y2={cy+216} strokeWidth="3" />
            </g>
          );
        })}
      </g>

      {/* --- ACTIVE CIVIL CRANES & SCAFFOLDING TOWER SILHOUETTES (Far Right) --- */}
      <g transform="translate(1180, 80)">
        {/* Tower Crane Vertical Mast */}
        <rect x="180" y="80" width="16" height="340" strokeWidth="1.5" />
        {/* Internal Cross Bracing of Crane Mast */}
        {[100, 140, 180, 220, 260, 300, 340, 380].map((y, idx) => (
          <line key={idx} x1="180" y1={y} x2="196" y2={y + 40} strokeWidth="0.8" />
        ))}
        {/* Crane Operator Cabin */}
        <rect x="165" y="60" width="30" height="22" rx="2" strokeWidth="1.5" />
        {/* Crane Apex Tower */}
        <polygon points="180,60 196,60 188,15" strokeWidth="1.5" />
        {/* Horizontal Jib / Boom */}
        <line x1="80" y1="50" x2="340" y2="50" strokeWidth="2.5" />
        {/* Tie Cables */}
        <line x1="188" y1="15" x2="310" y2="50" strokeWidth="1" />
        <line x1="188" y1="15" x2="100" y2="50" strokeWidth="1" />
        {/* Counterweight */}
        <rect x="80" y="52" width="30" height="20" rx="2" fill={strokeColor} fillOpacity="0.2" />
        {/* Hoist Trolley Cable & Hook */}
        <line x1="280" y1="50" x2="280" y2="180" strokeWidth="1" strokeDasharray="4 2" />
        <circle cx="280" cy="184" r="4" />
      </g>
    </svg>
  );
}
