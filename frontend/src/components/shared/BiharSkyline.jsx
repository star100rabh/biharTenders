/**
 * @file src/components/shared/BiharSkyline.jsx
 * @description Highly detailed, illuminated vector illustration of Bihar's iconic landmarks:
 * Mahabodhi Temple (Bodh Gaya), Golghar (Patna), Nalanda University ancient arches,
 * and the Mahatma Gandhi Setu / JP Ganga Path cable-stayed river bridge with glowing amber lanterns.
 */
import React from 'react';

export function BiharSkyline({ className = "w-full h-48 sm:h-64 opacity-60" }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Saffron to Surya Gold to Harit Emerald skyline gradient */}
          <linearGradient id="skylineGoldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#F59E0B" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#10B981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="skylineFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#D97706" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#071527" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
          </linearGradient>

          {/* Glow filter for temple lanterns */}
          <filter id="lanternGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* =========================================================================
            1. MAHABODHI TEMPLE (BODH GAYA - UNESCO WORLD HERITAGE) - Left Side
            ========================================================================= */}
        <g id="mahabodhi-temple">
          {/* Main Shikhara Pyramidal Spire */}
          <polygon 
            points="180,280 200,90 206,45 208,25 210,45 216,90 236,280" 
            fill="url(#skylineFillGrad)" 
            stroke="url(#skylineGoldGlow)" 
            strokeWidth="2" 
          />
          {/* Top Stupa Kalash / Finial with Lantern Glow */}
          <circle cx="208" cy="18" r="8" fill="#FDE047" filter="url(#lanternGlow)" />
          <circle cx="208" cy="18" r="4" fill="#EA580C" />
          <line x1="208" y1="2" x2="208" y2="10" stroke="#FDE047" strokeWidth="2.5" />

          {/* Horizontal architectural bhumi tiers (Spire levels) */}
          <line x1="202" y1="65" x2="214" y2="65" stroke="#F59E0B" strokeWidth="2" />
          <line x1="198" y1="95" x2="218" y2="95" stroke="#F59E0B" strokeWidth="2" />
          <line x1="194" y1="130" x2="222" y2="130" stroke="#F59E0B" strokeWidth="2" />
          <line x1="190" y1="170" x2="226" y2="170" stroke="#F59E0B" strokeWidth="2" />
          <line x1="185" y1="215" x2="231" y2="215" stroke="#F59E0B" strokeWidth="2" />

          {/* Niches / Kudu Arches on Spire */}
          <circle cx="208" cy="80" r="3.5" fill="#F59E0B" />
          <circle cx="208" cy="112" r="4.5" fill="#F59E0B" />
          <circle cx="208" cy="150" r="5.5" fill="#F59E0B" />
          <circle cx="208" cy="192" r="6.5" fill="#F59E0B" />

          {/* Left Flanking Corner Stupa */}
          <polygon points="155,280 166,160 171,135 176,160 187,280" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="1.5" />
          <circle cx="171" cy="128" r="4.5" fill="#FDE047" filter="url(#lanternGlow)" />
          <line x1="164" y1="185" x2="178" y2="185" stroke="#F59E0B" strokeWidth="1.5" />

          {/* Right Flanking Corner Stupa */}
          <polygon points="229,280 240,160 245,135 250,160 261,280" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="1.5" />
          <circle cx="245" cy="128" r="4.5" fill="#FDE047" filter="url(#lanternGlow)" />
          <line x1="238" y1="185" x2="252" y2="185" stroke="#F59E0B" strokeWidth="1.5" />

          {/* Bodhi Tree Leaf Silhouette behind temple */}
          <path d="M125,240 C110,210 120,180 145,175 C150,150 175,145 190,165" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
        </g>

        {/* =========================================================================
            2. NALANDA MAHAVIHARA RUINS (ANCIENT SEAT OF LEARNING) - Center Left
            ========================================================================= */}
        <g id="nalanda-ruins">
          {/* Main Stupa Votive Base */}
          <path d="M370,280 L370,230 L390,230 L390,195 L415,195 L415,170 L455,170 L455,195 L480,195 L480,230 L500,230 L500,280 Z" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="1.5" />
          {/* Nalanda Iconic Horseshoe Arches (Chaitya) */}
          <path d="M420,280 L420,215 C420,185 450,185 450,215 L450,280 Z" fill="#071527" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="435" cy="205" r="4" fill="#FDE047" />

          {/* Monastic Cell Arch 1 */}
          <path d="M515,280 L515,200 C515,170 545,170 545,200 L545,280 Z" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="1.5" />
          <path d="M523,280 L523,212 C523,190 537,190 537,212 L537,280 Z" fill="#071527" stroke="#F59E0B" strokeWidth="1" />

          {/* Monastic Cell Arch 2 */}
          <path d="M555,280 L555,210 C555,185 580,185 580,210 L580,280 Z" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="1.5" />
        </g>

        {/* =========================================================================
            3. PATNA GOLGHAR (ICONIC GRANARY STUPA DOME) - Center
            ========================================================================= */}
        <g id="patna-golghar">
          {/* Giant Dome Silhouette */}
          <path 
            d="M680,280 C680,170 730,120 780,120 C830,120 880,170 880,280 Z" 
            fill="url(#skylineFillGrad)" 
            stroke="url(#skylineGoldGlow)" 
            strokeWidth="2.5" 
          />
          {/* Golghar Top Lantern Platform */}
          <rect x="765" y="112" width="30" height="9" rx="3" fill="#F59E0B" />
          <circle cx="780" cy="106" r="6" fill="#FDE047" filter="url(#lanternGlow)" />
          <circle cx="780" cy="106" r="3" fill="#EA580C" />

          {/* Dual Exterior Spiral Staircases Silhouettes */}
          <path d="M685,280 Q730,200 770,120" stroke="#F59E0B" strokeWidth="3" fill="none" strokeDasharray="4 2" />
          <path d="M875,280 Q830,200 790,120" stroke="#F59E0B" strokeWidth="3" fill="none" strokeDasharray="4 2" />

          {/* Architectural Ventilation Apertures */}
          <circle cx="780" cy="150" r="5" fill="#071527" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="755" cy="180" r="4.5" fill="#071527" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="805" cy="180" r="4.5" fill="#071527" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="740" cy="220" r="4" fill="#071527" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="820" cy="220" r="4" fill="#071527" stroke="#F59E0B" strokeWidth="1.5" />
        </g>

        {/* =========================================================================
            4. MAHATMA GANDHI SETU & JP GANGA PATH (RIVER BRIDGES) - Right Side
            ========================================================================= */}
        <g id="ganga-bridges">
          {/* Horizontal Bridge Deck Highway spanning over Ganga */}
          <line x1="940" y1="210" x2="1440" y2="210" stroke="url(#skylineGoldGlow)" strokeWidth="4" />
          <line x1="940" y1="215" x2="1440" y2="215" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="8 6" />

          {/* Pylon Tower 1 */}
          <polygon points="1040,280 1048,50 1056,50 1064,280" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="2" />
          {/* Top beacon warning light */}
          <circle cx="1052" cy="44" r="5" fill="#EF4444" filter="url(#lanternGlow)" />
          {/* Cable Stay Strands from Pylon 1 */}
          <line x1="1052" y1="65" x2="960" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1052" y1="90" x2="985" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1052" y1="120" x2="1015" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1052" y1="65" x2="1144" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1052" y1="90" x2="1119" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1052" y1="120" x2="1089" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />

          {/* Pylon Tower 2 */}
          <polygon points="1230,280 1238,50 1246,50 1254,280" fill="url(#skylineFillGrad)" stroke="url(#skylineGoldGlow)" strokeWidth="2" />
          <circle cx="1242" cy="44" r="5" fill="#EF4444" filter="url(#lanternGlow)" />
          {/* Cable Stay Strands from Pylon 2 */}
          <line x1="1242" y1="65" x2="1150" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1242" y1="90" x2="1175" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1242" y1="120" x2="1205" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1242" y1="65" x2="1334" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1242" y1="90" x2="1309" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
          <line x1="1242" y1="120" x2="1279" y2="210" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />

          {/* Traditional Ganga Wooden Boat Silhouette under bridge */}
          <path d="M1120,265 C1135,272 1165,272 1180,265 L1175,260 L1125,260 Z" fill="#F59E0B" />
          <line x1="1150" y1="260" x2="1150" y2="242" stroke="#F59E0B" strokeWidth="1.5" />
          <polygon points="1150,244 1165,252 1150,256" fill="#FDE047" opacity="0.7" />
        </g>

        {/* =========================================================================
            5. SACRED GANGA RIVER WATERS & REFLECTIONS
            ========================================================================= */}
        <path d="M0,274 L1440,274" stroke="url(#waterGrad)" strokeWidth="3" />
        <path d="M60,278 L260,278 M380,278 L560,278 M700,278 L860,278 M980,278 L1380,278" stroke="#FDE047" strokeWidth="1.5" opacity="0.6" strokeDasharray="12 8" />
      </svg>
    </div>
  );
}
