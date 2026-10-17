/**
 * @file src/components/layout/PatliputraWatermark.jsx
 * @description Fixed architectural watermark layer depicting Bihar's civil heritage:
 * - Left: Mahabodhi Temple spire and Buddhist stupa dome.
 * - Center: Ancient brick terraces of Nalanda Mahavihara.
 * - Right: Monolithic Ashoka sandstone columns with carved lion capitals.
 * 
 * Fits fully across the viewport with clear visibility matching the Patliputra Modern aesthetic.
 */
import React from 'react';
import biharHeritageBg from '@/assets/images/bihar_heritage_watermark.jpg';

export function PatliputraWatermark() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden bg-[#FAF7F2] dark:bg-[#0D1117] select-none transition-colors duration-200"
      aria-hidden="true"
    >
      {/* 
        High-fidelity architectural sketch image matching user specification
        Fully fitted with object-cover, crisp visibility in light mode and soft luminescence in dark mode
      */}
      <img 
        src={biharHeritageBg} 
        alt="Bihar Civil Heritage Watermark" 
        className="absolute inset-0 w-full h-full object-cover object-center lg:object-[center_35%] opacity-90 dark:opacity-25 dark:invert dark:mix-blend-screen transition-all duration-300"
      />

      {/* Very soft ambient tint so background watermark lines remain clearly visible everywhere */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF8F5]/20 dark:to-[#0D1117]/40 pointer-events-none" 
      />
    </div>
  );
}
