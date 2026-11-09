import React, { useState, useEffect } from 'react';

/**
 * GeminiLoginBackground
 * 
 * Czysty, oryginalny kosmiczny gradient w tle logowania,
 * którego kolor płynnie zmienia się co 20 sekund.
 * Dokładnie te same koordynaty co oryginalny gradient, bez dodatkowych efektów.
 */

const PALETTES = [
  // Faza 0: Oryginalny głęboki szafir i kosmiczny błękit (Google Calendar)
  {
    background: `
      radial-gradient(ellipse 85% 65% at 65% 38%, rgba(28, 68, 158, 0.45) 0%, rgba(18, 42, 105, 0.28) 35%, rgba(11, 22, 60, 0.12) 65%, transparent 85%),
      radial-gradient(circle 500px at 50% 50%, rgba(30, 75, 170, 0.25) 0%, rgba(14, 28, 70, 0.12) 50%, transparent 80%)
    `
  },
  // Faza 1: Głęboki kosmiczny fiolet / indygo
  {
    background: `
      radial-gradient(ellipse 85% 65% at 65% 38%, rgba(109, 40, 217, 0.45) 0%, rgba(76, 29, 149, 0.28) 35%, rgba(46, 16, 101, 0.12) 65%, transparent 85%),
      radial-gradient(circle 500px at 50% 50%, rgba(124, 58, 237, 0.25) 0%, rgba(88, 28, 135, 0.12) 50%, transparent 80%)
    `
  },
  // Faza 2: Głęboki morski błękit / cyjan
  {
    background: `
      radial-gradient(ellipse 85% 65% at 65% 38%, rgba(14, 116, 144, 0.45) 0%, rgba(15, 76, 110, 0.28) 35%, rgba(8, 47, 73, 0.12) 65%, transparent 85%),
      radial-gradient(circle 500px at 50% 50%, rgba(6, 182, 212, 0.25) 0%, rgba(3, 105, 161, 0.12) 50%, transparent 80%)
    `
  },
  // Faza 3: Głęboka szkarłatna magenta / róża
  {
    background: `
      radial-gradient(ellipse 85% 65% at 65% 38%, rgba(190, 24, 93, 0.42) 0%, rgba(136, 19, 55, 0.26) 35%, rgba(76, 5, 25, 0.12) 65%, transparent 85%),
      radial-gradient(circle 500px at 50% 50%, rgba(225, 29, 72, 0.24) 0%, rgba(159, 18, 57, 0.12) 50%, transparent 80%)
    `
  },
  // Faza 4: Głęboki szmaragd / leśna zieleń
  {
    background: `
      radial-gradient(ellipse 85% 65% at 65% 38%, rgba(16, 149, 106, 0.42) 0%, rgba(13, 94, 69, 0.26) 35%, rgba(6, 54, 38, 0.12) 65%, transparent 85%),
      radial-gradient(circle 500px at 50% 50%, rgba(16, 185, 129, 0.24) 0%, rgba(5, 110, 75, 0.12) 50%, transparent 80%)
    `
  }
];

export default function GeminiLoginBackground() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Płynna zmiana koloru co 20 sekund
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PALETTES.length);
    }, 20000); // 20 sekund

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Płynnie przenikające się warstwy oryginalnego gradientu */}
      {PALETTES.map((pal, idx) => {
        const isActive = idx === phaseIndex;
        return (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              background: pal.background
            }}
          />
        );
      })}
    </div>
  );
}
