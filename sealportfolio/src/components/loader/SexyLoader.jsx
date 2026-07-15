import { useEffect, useState, useRef } from "react";

/**
 * INFERNO LOADER
 * Signature element: a molten 3D dice-cube, cracks glowing hotter as it loads,
 * encircled by a coiling ember-serpent whose body burns in as progress advances.
 * Rising embers + a lava-pit glow ground the whole thing in one coherent "forge" world.
 */

const EMBERS = Array.from({ length: 40 }, (_, i) => {
  const rand = (n) => ((Math.sin(i * n) * 43758.5453) % 1 + 1) % 1;
  return {
    id: i,
    x: rand(12.9898) * 100,
    size: 2 + rand(78.233) * 5,
    delay: rand(45.164) * 6,
    dur: 4 + rand(94.673) * 5,
    drift: (rand(33.1) - 0.5) * 60,
    hue: rand(5.5) > 0.5 ? "#ff6a1a" : "#ffb020",
  };
});

// dice pip layouts on a 3x3 grid (row, col) 0-indexed
const PIPS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function Face({ n, transform, glow }) {
  return (
    <div style={{
      position: "absolute",
      width: 108, height: 108,
      left: -54, top: -54,
      background: "linear-gradient(155deg, #2a1006 0%, #170905 60%, #0d0503 100%)",
      border: "1px solid rgba(255,140,60,0.35)",
      borderRadius: 10,
      transform,
      boxShadow: `inset 0 0 18px rgba(0,0,0,0.6), 0 0 ${14 + glow * 40}px rgba(255,${90 + glow * 60},${20 + glow * 40},${0.35 + glow * 0.5})`,
      display: "grid",
      gridTemplateRows: "repeat(3, 1fr)",
      gridTemplateColumns: "repeat(3, 1fr)",
      padding: 14,
      boxSizing: "border-box",
    }}>
      {/* molten crack overlay */}
      <svg viewBox="0 0 108 108" style={{ position: "absolute", inset: 0, opacity: 0.5 + glow * 0.5, mixBlendMode: "screen" }}>
        <path d="M6,20 L34,32 L28,54 L58,50 L64,80 L100,92" stroke="url(#crackGrad)" strokeWidth={1.4 + glow * 1.6} fill="none" strokeLinecap="round" />
      </svg>
      {PIPS[n].map(([r, c], idx) => (
        <div key={idx} style={{
          gridRow: r + 1, gridColumn: c + 1,
          width: 14, height: 14, borderRadius: "50%",
          justifySelf: "center", alignSelf: "center",
          background: `radial-gradient(circle at 35% 30%, #fff3d6, #ffb020 45%, #ff4d1a 85%)`,
          boxShadow: `0 0 ${6 + glow * 16}px rgba(255,150,40,${0.6 + glow * 0.4})`,
        }} />
      ))}
    </div>
  );
}

export default function InfernoLoader({ onComplete }) {
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("in");
  const [headPos, setHeadPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const pathRef = useRef(null);

  const TITLE = "Portfolio";
  const SUB = "forging something extraordinary";

  useEffect(() => {
    let frame;
    const loop = (ts) => { setTick(ts); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPhase("run"), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "run") return;
    const start = performance.now();
    const dur = 2800;
    const animate = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else {
        setPhase("out");
        setTimeout(() => onComplete?.(), 800);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const t = tick / 1000;
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  const pip = Math.min(6, Math.max(1, Math.ceil(eased * 6) || 1));

  // serpent path length reveal + head tracking
  const PATH_D = "M40,190 C 10,150 10,90 45,60 C 80,30 140,30 175,55 C 215,84 215,140 175,168 C 145,190 100,190 78,168 C 60,150 60,128 78,118 C 95,108 118,112 122,130";
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      const pt = pathRef.current.getPointAtLength(len * eased);
      setHeadPos({ x: pt.x, y: pt.y });
    }
  }, [eased]);

  const rx = 20 + Math.sin(t * 0.4) * 12;
  const ry = t * 26;

  const containerStyle = {
    position: "fixed", inset: 0, zIndex: 9999,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: "radial-gradient(ellipse at 50% 75%, #3a1206 0%, #170905 45%, #060302 80%)",
    overflow: "hidden",
    opacity: phase === "out" ? 0 : 1,
    transform: phase === "out" ? "scale(1.06)" : "scale(1)",
    transition: phase === "out" ? "opacity 0.8s ease, transform 0.95s ease" : "none",
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Jost:wght@300;400;500&display=swap');

        @keyframes cubeSpin {
          0%   { transform: rotateX(-24deg) rotateY(0deg); }
          100% { transform: rotateX(-24deg) rotateY(360deg); }
        }
        @keyframes cubeBob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes emberRise {
          0%   { transform: translate(0,0) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translate(var(--drift), -420px) scale(1.1); opacity: 0; }
        }
        @keyframes lavaPulse {
          0%,100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes titleBurn {
          0% { opacity: 0; letter-spacing: 0.4em; filter: blur(12px); }
          100% { opacity: 1; letter-spacing: 0.05em; filter: blur(0); }
        }
        @keyframes flicker {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        @keyframes subFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 0.6; transform: translateY(0); }
        }
        @keyframes headGlow {
          0%,100% { r: 6; opacity: 1; }
          50% { r: 8; opacity: 0.75; }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="crackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3d6" />
            <stop offset="50%" stopColor="#ffb020" />
            <stop offset="100%" stopColor="#ff2b1f" />
          </linearGradient>
          <linearGradient id="serpentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe9b0" />
            <stop offset="45%" stopColor="#ffb020" />
            <stop offset="100%" stopColor="#ff2b1f" />
          </linearGradient>
          <radialGradient id="ringTitle" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fff3d6" />
            <stop offset="100%" stopColor="#ff2b1f" />
          </radialGradient>
        </defs>
      </svg>

      {/* lava pit glow at the base */}
      <div style={{
        position: "absolute", bottom: "8%", left: "50%", width: 520, height: 140,
        transform: "translateX(-50%)", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,110,30,0.55) 0%, rgba(255,40,20,0.25) 45%, transparent 75%)",
        filter: "blur(18px)",
        animation: "lavaPulse 4s ease-in-out infinite",
      }} />

      {/* rising embers */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {EMBERS.map((e) => (
          <div key={e.id} style={{
            position: "absolute", left: `${e.x}%`, bottom: "10%",
            width: e.size, height: e.size, borderRadius: "50%",
            background: e.hue, boxShadow: `0 0 ${e.size * 3}px ${e.hue}`,
            "--drift": `${e.drift}px`,
            animation: `emberRise ${e.dur}s ease-in ${e.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* ── center composition ── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "2.4rem" }}>

        <div style={{ position: "relative", width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* coiling ember serpent — progress reveal */}
          <svg width="260" height="260" viewBox="0 0 220 220" style={{ position: "absolute", top: 0, left: 0 }}>
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d={PATH_D}
              fill="none"
              stroke="url(#serpentGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - eased}
              style={{ filter: "drop-shadow(0 0 8px rgba(255,110,30,0.85))", transition: "stroke-dashoffset 0.1s linear" }}
            />
            {/* serpent head */}
            {eased > 0.02 && (
              <circle cx={headPos.x} cy={headPos.y} r="7" fill="#fff3d6" style={{ animation: "headGlow 1.1s ease-in-out infinite" }} />
            )}
          </svg>

          {/* molten dice-cube, 3D */}
          <div style={{
            position: "relative", width: 108, height: 108,
            perspective: 700,
            animation: "cubeBob 3.4s ease-in-out infinite",
          }}>
            <div style={{
              position: "absolute", width: "100%", height: "100%",
              transformStyle: "preserve-3d",
              animation: "cubeSpin 10s linear infinite",
              left: "50%", top: "50%",
            }}>
              <Face n={pip}                 transform="translate(-50%,-50%) translateZ(54px)" glow={eased} />
              <Face n={7 - pip}              transform="translate(-50%,-50%) rotateY(180deg) translateZ(54px)" glow={eased} />
              <Face n={((pip + 1) % 6) + 1}  transform="translate(-50%,-50%) rotateY(90deg) translateZ(54px)" glow={eased} />
              <Face n={((pip + 4) % 6) + 1}  transform="translate(-50%,-50%) rotateY(-90deg) translateZ(54px)" glow={eased} />
              <Face n={((pip + 2) % 6) + 1}  transform="translate(-50%,-50%) rotateX(90deg) translateZ(54px)" glow={eased} />
              <Face n={((pip + 3) % 6) + 1}  transform="translate(-50%,-50%) rotateX(-90deg) translateZ(54px)" glow={eased} />
            </div>
          </div>

          {/* percentage, offset below cube */}
          <div style={{
            position: "absolute", bottom: -6,
            fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: "1rem",
            color: "#ffdca8", textShadow: "0 0 16px rgba(255,110,30,0.8)",
            letterSpacing: "0.08em",
          }}>
            {Math.round(eased * 100)}%
          </div>
        </div>

        {/* title */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(2.8rem, 8vw, 4.4rem)",
            letterSpacing: "0.05em",
            background: "linear-gradient(90deg, #fff3d6, #ffb020, #ff2b1f, #ffb020, #fff3d6)",
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: "titleBurn 1.2s ease forwards, flicker 3.5s ease-in-out 1.2s infinite",
          }}>
            {TITLE}
          </div>
          <div style={{
            marginTop: "0.5rem",
            fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "0.78rem",
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: "rgba(255,210,160,0.6)",
            opacity: 0,
            animation: "subFade 1s ease 0.7s forwards",
          }}>
            {SUB}
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 28,
        fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "0.65rem",
        color: "rgba(255,200,150,0.22)", letterSpacing: "0.25em", textTransform: "uppercase",
      }}>
        est. 2025 · forged with fire
      </div>
    </div>
  );
}