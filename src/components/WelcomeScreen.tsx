"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy-load WebGL component agar tidak crash saat SSR
const MagicRings = dynamic(() => import("./MagicRings"), { ssr: false });

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [textReady, setTextReady] = useState(false);
  const [greeting, setGreeting] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const now = new Date();
    const witaDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
    const hour = witaDate.getHours();
    
    if (hour >= 0 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    audioRef.current = new Audio("/welcome-sound.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleInteraction = () => {
    if (stage === 0) {
      setStage(1);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.log("Audio play error:", err));
      }
      setTimeout(() => setTextReady(true), 600);
    } else if (stage === 1) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setStage(2);
      setTimeout(() => {
        onEnter();
      }, 700);
    }
  };

  return (
    <div
      className="welcome-screen"
      style={{ opacity: stage === 2 ? 0 : 1 }}
      onClick={handleInteraction}
    >
      {stage === 0 ? (
        <div className="welcome-prestart">
          <p className="welcome-hint prestart-text">Tap anywhere to start experience</p>
        </div>
      ) : (
        <>
          {/* MagicRings — fullscreen WebGL canvas */}
          <div className="welcome-rings">
        <MagicRings
          color="#6366f1"
          colorTwo="#38bdf8"
          ringCount={6}
          speed={0.9}
          attenuation={9}
          lineThickness={2.5}
          baseRadius={0.32}
          radiusStep={0.09}
          scaleRate={0.12}
          opacity={1}
          noiseAmount={0.06}
          ringGap={1.6}
          fadeIn={0.7}
          fadeOut={0.55}
          followMouse={true}
          mouseInfluence={0.15}
          hoverScale={1.15}
          parallax={0.04}
          clickBurst={true}
        />
      </div>

      {/* Text overlay — centered */}
      <div className={`welcome-text ${textReady ? "welcome-text--visible" : ""}`}>
        <p className="welcome-label">Welcome</p>
        <p className="welcome-greeting">{greeting}</p>
        <p className="welcome-sub">Elkunyuk</p>
        <p className="welcome-hint">Tap / klik untuk mulai</p>
      </div>
        </>
      )}

      <style>{`
        .welcome-prestart {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }
        .prestart-text {
          margin-top: 0;
          font-size: 1.1rem;
          color: rgba(148,163,184,0.65);
        }
        .welcome-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #080c1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.7s ease;
        }

        .welcome-rings {
          position: absolute;
          inset: 0;
        }

        /* ── Center text ── */
        .welcome-text {
          position: relative;
          z-index: 1;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.9s ease, transform 0.9s ease;
          pointer-events: none;
          user-select: none;
        }
        .welcome-text--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .welcome-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 40%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          text-shadow: none;
          /* Soft glow behind via drop-shadow filter */
          filter: drop-shadow(0 0 28px rgba(99,102,241,0.55));
        }

        .welcome-greeting {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(1.2rem, 3vw, 2rem);
          font-weight: 600;
          color: #e2e8f0;
          margin-top: -6px;
          margin-bottom: 8px;
          text-shadow: 0 0 10px rgba(226,232,240,0.3);
        }

        .welcome-sub {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(0.75rem, 2vw, 1rem);
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(165,180,252,0.65);
        }

        .welcome-hint {
          margin-top: 32px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: rgba(148,163,184,0.45);
          animation: pulse-hint 2.4s ease-in-out infinite;
        }

        @keyframes pulse-hint {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
