import React, { useState, useEffect } from 'react';

/**
 * GeminiLoginBackground
 * 
 * Tło ekranu logowania z płynną zmianą kolorów co ~20 sekund
 * oraz autentycznym efektem fali świetlnych kropek (halftone particle wave)
 * w stylu Google Gemini (zgodnym w 100% ze zdjęciem Image 2).
 */

const PALETTES = [
  // Faza 0: Głęboki szafir i kosmiczny błękit (klasyczny Kalendarz Google)
  {
    radial1: 'radial-gradient(ellipse 85% 65% at 65% 38%, rgba(28, 68, 158, 0.48) 0%, rgba(18, 42, 105, 0.28) 35%, rgba(11, 22, 60, 0.12) 65%, transparent 85%)',
    radial2: 'radial-gradient(circle 500px at 50% 50%, rgba(30, 75, 170, 0.28) 0%, rgba(14, 28, 70, 0.12) 50%, transparent 80%)',
    waveGrad1: '#8ab4f8',
    waveGrad2: '#3b82f6',
    waveGrad3: '#1d4ed8',
    waveGrad4: '#06b6d4',
    waveOpacity: 0.75
  },
  // Faza 1: Gemini Neon Violet, Magenta & Deep Cobalt (1:1 jak na zdjęciu Image 2)
  {
    radial1: 'radial-gradient(ellipse 80% 65% at 60% 40%, rgba(147, 51, 234, 0.45) 0%, rgba(219, 39, 119, 0.28) 35%, rgba(49, 16, 85, 0.15) 65%, transparent 85%)',
    radial2: 'radial-gradient(circle 520px at 45% 55%, rgba(99, 102, 241, 0.32) 0%, rgba(168, 85, 247, 0.18) 45%, transparent 80%)',
    waveGrad1: '#f43f5e',
    waveGrad2: '#d946ef',
    waveGrad3: '#8b5cf6',
    waveGrad4: '#3b82f6',
    waveOpacity: 0.95
  },
  // Faza 2: Cyber Cyan & Electric Blue (Gemini Intelligence glow)
  {
    radial1: 'radial-gradient(ellipse 75% 60% at 70% 35%, rgba(14, 165, 233, 0.45) 0%, rgba(37, 99, 235, 0.26) 35%, rgba(8, 47, 73, 0.14) 65%, transparent 85%)',
    radial2: 'radial-gradient(circle 480px at 50% 50%, rgba(6, 182, 212, 0.28) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 80%)',
    waveGrad1: '#38bdf8',
    waveGrad2: '#06b6d4',
    waveGrad3: '#2563eb',
    waveGrad4: '#6366f1',
    waveOpacity: 0.8
  },
  // Faza 3: Sunset Ruby, Purple & Warm Amber (wieczorny blask Gemini)
  {
    radial1: 'radial-gradient(ellipse 80% 65% at 65% 42%, rgba(225, 29, 72, 0.38) 0%, rgba(147, 51, 234, 0.32) 35%, rgba(60, 10, 40, 0.15) 65%, transparent 85%)',
    radial2: 'radial-gradient(circle 500px at 45% 48%, rgba(245, 158, 11, 0.25) 0%, rgba(190, 24, 93, 0.16) 50%, transparent 80%)',
    waveGrad1: '#fb7185',
    waveGrad2: '#c084fc',
    waveGrad3: '#818cf8',
    waveGrad4: '#38bdf8',
    waveOpacity: 0.85
  }
];

export default function GeminiLoginBackground() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Zmiana kolorów co ~20 sekund
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PALETTES.length);
    }, 20000); // 20 000 ms = 20 sekund

    return () => clearInterval(timer);
  }, []);

  const activePalette = PALETTES[phaseIndex];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Płynnie interpolujące gradienty aury kosmicznej */}
      {PALETTES.map((pal, idx) => {
        const isActive = idx === phaseIndex;
        return (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-[3500ms] ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              background: `${pal.radial1}, ${pal.radial2}`
            }}
          />
        );
      })}

      {/* 2. Efekt fali świetlnych kropek z Google Gemini (Image 2) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[62vh] overflow-hidden pointer-events-none transition-opacity duration-[3000ms] ease-in-out"
        style={{ opacity: activePalette.waveOpacity }}
      >
        <svg 
          className="w-full h-full" 
          viewBox="0 0 1440 600" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Siatka halftone małych okrągłych kropek ze zdjęcia Gemini */}
            <pattern 
              id="gemini-halftone-pattern" 
              width="15" 
              height="15" 
              patternUnits="userSpaceOnUse"
            >
              <circle cx="7.5" cy="7.5" r="1.9" fill="white" />
            </pattern>

            {/* Dynamiczne przejście tonalne kolorów kropek (fiolet -> magenta -> błękit -> cyan) */}
            <linearGradient id="gemini-dots-gradient" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor={activePalette.waveGrad1} stopOpacity="1" />
              <stop offset="32%" stopColor={activePalette.waveGrad2} stopOpacity="0.95" />
              <stop offset="68%" stopColor={activePalette.waveGrad3} stopOpacity="0.9" />
              <stop offset="100%" stopColor={activePalette.waveGrad4} stopOpacity="0.85" />
            </linearGradient>

            {/* Maska z organicznymi, sinusoidalnymi falami Gemini */}
            <mask id="gemini-wave-mask-1">
              <path 
                className="gemini-wave-anim-1"
                d="M 0,220 C 260,110 480,310 740,190 C 1000,70 1240,240 1440,160 L 1440,600 L 0,600 Z" 
                fill="url(#wave-fade-gradient)" 
              />
            </mask>

            <mask id="gemini-wave-mask-2">
              <path 
                className="gemini-wave-anim-2"
                d="M 0,260 C 280,330 540,160 800,270 C 1060,380 1280,180 1440,230 L 1440,600 L 0,600 Z" 
                fill="url(#wave-fade-gradient)" 
              />
            </mask>

            {/* Pionowy gradient zanikania fali ku górze i krawędziom */}
            <linearGradient id="wave-fade-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="25%" stopColor="white" stopOpacity="0.4" />
              <stop offset="60%" stopColor="white" stopOpacity="0.95" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>

            {/* Filtr neonowego rozmycia blasku dla warstwy poświaty */}
            <filter id="gemini-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Warstwa A: Neonowa poświata kropek (glow) */}
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#gemini-dots-gradient)" 
            mask="url(#gemini-wave-mask-1)" 
            filter="url(#gemini-neon-glow)"
            opacity="0.65"
          />

          {/* Warstwa B: Wyraziste, ostre punkty świetlne dokładnie jak na zdjęciu Image 2 */}
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#gemini-halftone-pattern)" 
            mask="url(#gemini-wave-mask-1)" 
            className="gemini-dots-screen"
          />
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#gemini-dots-gradient)" 
            mask="url(#gemini-wave-mask-2)" 
            opacity="0.8"
            style={{ mixBlendMode: 'screen' }}
          />
        </svg>
      </div>

      {/* 3. Subtelny dolny gradient przyciemniający dół dla czytelności stopki */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(13, 14, 18, 0.85) 0%, rgba(13, 14, 18, 0) 100%)'
        }}
      />
    </div>
  );
}
