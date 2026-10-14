/**
 * @file src/components/shared/BiharSkyline.jsx
 * @description Vector illustration of iconic Bihar architectural landmarks:
 * Mahabodhi Temple (Bodh Gaya), Golghar (Patna), Nalanda University ancient arches,
 * and the Gandhi Setu / JP Ganga Path river bridge.
 */
import React from 'react';

export function BiharSkyline({ className = "w-full h-28 sm:h-36 opacity-15" }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-amber-500/30 dark:text-amber-400/20"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="biharSkylineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Base ground line representing Ganga embankment */}
        <path d="M0,238 L1440,238" stroke="url(#biharSkylineGrad)" strokeWidth="2" strokeDasharray="6 4" />

        {/* 1. MAHABODHI TEMPLE (Bodh Gaya) - Left Sector (X: 120 - 280) */}
        <g opacity="0.85">
          {/* Main Shikhara Spire */}
          <polygon points="200,238 215,80 220,40 222,25 224,40 229,80 244,238" fill="currentColor" />
          {/* Top Kalash / Amalaka */}
          <circle cx="222" cy="18" r="6" fill="#F59E0B" />
          {/* Horizontal architectural bhumi tiers */}
          <line x1="211" y1="110" x2="233" y2="110" stroke="#071527" strokeWidth="2" />
          <line x1="214" y1="145" x2="230" y2="145" stroke="#071527" strokeWidth="2" />
          <line x1="207" y1="180" x2="237" y2="180" stroke="#071527" strokeWidth="2" />
          {/* Corner Miniature Stupas */}
          <polygon points="175,238 185,150 190,135 195,150 205,238" fill="currentColor" opacity="0.7" />
          <circle cx="190" cy="130" r="3.5" fill="#F59E0B" />
          <polygon points="239,238 249,150 254,135 259,150 269,238" fill="currentColor" opacity="0.7" />
          <circle cx="254" cy="130" r="3.5" fill="#F59E0B" />
        </g>

        {/* 2. NALANDA UNIVERSITY RUINS - Arches & Chaityas (X: 380 - 580) */}
        <g opacity="0.75">
          {/* Stupa mound */}
          <path d="M380,238 C380,160 450,160 450,238 Z" fill="currentColor" opacity="0.6" />
          {/* Classic Nalanda Monastic Arch 1 */}
          <path d="M470,238 L470,140 C470,105 510,105 510,140 L510,238 Z" fill="currentColor" />
          <path d="M480,238 L480,155 C480,130 500,130 500,155 L500,238 Z" fill="#071527" />
          {/* Monastic Arch 2 */}
          <path d="M525,238 L525,160 C525,125 565,125 565,160 L565,238 Z" fill="currentColor" opacity="0.8" />
          <path d="M535,238 L535,175 C535,150 555,150 555,175 L555,238 Z" fill="#071527" />
        </g>

        {/* 3. GOLGHAR (Patna) - Center Dome & Spiral Staircase (X: 680 - 880) */}
        <g opacity="0.9">
          {/* Main Stupa / Dome Structure */}
          <ellipse cx="780" cy="238" rx="95" ry="90" fill="currentColor" />
          {/* Top Platform / Lantern */}
          <rect x="768" y="142" width="24" height="8" rx="2" fill="#F59E0B" />
          <circle cx="780" cy="138" r="4" fill="#EA580C" />
          {/* Iconic Dual Outer Staircase Spiral Silhouettes */}
          <path d="M685,238 Q730,170 770,146" stroke="#071527" strokeWidth="3" fill="none" />
          <path d="M875,238 Q830,170 790,146" stroke="#071527" strokeWidth="3" fill="none" />
        </g>

        {/* 4. GANDHI SETU / JP GANGA PATH - Right River Bridge (X: 980 - 1320) */}
        <g opacity="0.85">
          {/* Pylon 1 */}
          <polygon points="1030,238 1038,70 1046,70 1054,238" fill="currentColor" />
          <rect x="1036" y="65" width="12" height="6" fill="#F59E0B" />
          {/* Cable stays Pylon 1 */}
          <line x1="1042" y1="80" x2="960" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1042" y1="105" x2="985" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1042" y1="130" x2="1010" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1042" y1="80" x2="1120" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1042" y1="105" x2="1095" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1042" y1="130" x2="1070" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />

          {/* Pylon 2 */}
          <polygon points="1200,238 1208,70 1216,70 1224,238" fill="currentColor" />
          <rect x="1206" y="65" width="12" height="6" fill="#F59E0B" />
          {/* Cable stays Pylon 2 */}
          <line x1="1212" y1="80" x2="1130" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1212" y1="105" x2="1155" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1212" y1="130" x2="1180" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1212" y1="80" x2="1290" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1212" y1="105" x2="1265" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="1212" y1="130" x2="1240" y2="238" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
