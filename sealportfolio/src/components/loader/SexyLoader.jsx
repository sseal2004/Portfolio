import { useEffect, useState, useRef } from "react";

const ORBS = [
  { size: 320, x: "72%", y: "10%", color: "#6366f1", blur: 90, opacity: 0.13, dur: 18 },
  { size: 260, x: "-5%", y: "55%", color: "#06b6d4", blur: 80, opacity: 0.11, dur: 23 },
  { size: 200, x: "55%", y: "68%", color: "#8b5cf6", blur: 70, opacity: 0.10, dur: 15 },
  { size: 150, x: "20%", y: "5%",  color: "#22d3ee", blur: 60, opacity: 0.08, dur: 20 },
];

const DOTS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.sin(i * 2.3) * 50 + 50,
  y: Math.cos(i * 1.7) * 50 + 50,
  size: 1.5 + (i % 3) * 1,
  delay: (i * 0.11) % 4,
  dur: 3 + (i % 5),
}));

const HELIX_POINTS = 28;

export default function PortfolioLoader({ onComplete }) {
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("in");   // "in" | "run" | "out"
  const [lettersDone, setLettersDone] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const LABEL = "Loading portfolio";
  const LETTERS = LABEL.split("");

  useEffect(() => {
    const t = setTimeout(() => setLettersDone(true), LETTERS.length * 60 + 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let frame;
    const loop = (ts) => {
      setTick(ts);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "run") return;
    const start = performance.now();
    const dur = 2200;
    const animate = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else {
        setPhase("out");
        setTimeout(() => onComplete?.(), 700);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (lettersDone && phase === "in") {
      setTimeout(() => setPhase("run"), 200);
    }
  }, [lettersDone, phase]);

  const t = tick / 1000;
  const easedProgress = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  const containerStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#080a10",
    overflow: "hidden",
    opacity: phase === "out" ? 0 : 1,
    transition: phase === "out" ? "opacity 0.6s ease" : "none",
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono&display=swap');

        @keyframes floatOrb {
          0%,100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-28px) scale(1.04); }
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.4); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.92); opacity: 0.5; }
          50% { transform: scale(1.06); opacity: 0.15; }
          100% { transform: scale(0.92); opacity: 0.5; }
        }
        @keyframes letterDrop {
          0% { opacity: 0; transform: translateY(-14px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes statusBlink {
          0%,49% { opacity: 1; }
          50%,100% { opacity: 0; }
        }
        @keyframes countUp {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        @keyframes glitch1 {
          0%,94%,100% { clip-path: none; transform: none; }
          95% { clip-path: inset(30% 0 40% 0); transform: translate(-3px,0); }
          97% { clip-path: inset(60% 0 10% 0); transform: translate(3px,0); }
        }
        @keyframes glitch2 {
          0%,96%,100% { clip-path: none; transform: none; opacity: 0; }
          97% { clip-path: inset(20% 0 60% 0); transform: translate(4px,0); opacity: 0.7; }
          99% { clip-path: inset(70% 0 5% 0); transform: translate(-4px,0); opacity: 0.7; }
        }
      `}</style>

      {/* ── Ambient orbs ── */}
      {ORBS.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.size,
          height: o.size,
          left: o.x,
          top: o.y,
          borderRadius: "50%",
          background: o.color,
          opacity: o.opacity,
          filter: `blur(${o.blur}px)`,
          animation: `floatOrb ${o.dur}s ease-in-out ${i * 3.1}s infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Star field ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {DOTS.map((d) => (
          <div key={d.id} style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#fff",
            animation: `twinkle ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* ── Scanline ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0.03,
      }}>
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          height: "120px",
          background: "linear-gradient(to bottom, transparent, rgba(99,102,241,0.8), transparent)",
          animation: "scanline 5s linear infinite",
        }} />
      </div>

      {/* ── Grid overlay ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* ── Center composition ── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" }}>

        {/* Helix + rings */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* Pulse rings */}
          {[1, 0.7, 0.45].map((scale, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 160 * scale,
              height: 160 * scale,
              borderRadius: "50%",
              border: `1px solid rgba(99,102,241,${0.35 - i * 0.1})`,
              animation: `pulseRing ${2 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
            }} />
          ))}

          {/* DNA helix via SVG */}
          <svg width="90" height="160" viewBox="0 0 90 160" style={{ position: "absolute" }}>
            {Array.from({ length: HELIX_POINTS }, (_, i) => {
              const progress_i = i / (HELIX_POINTS - 1);
              const angle1 = progress_i * Math.PI * 3.5 + t * 1.4;
              const angle2 = angle1 + Math.PI;
              const x1 = 45 + Math.cos(angle1) * 28;
              const x2 = 45 + Math.cos(angle2) * 28;
              const y = 8 + progress_i * 144;
              const z1 = Math.sin(angle1);
              const z2 = Math.sin(angle2);
              const r1 = Math.round(4 + Math.abs(z1) * 2.5);
              const r2 = Math.round(4 + Math.abs(z2) * 2.5);
              const op1 = 0.35 + Math.abs(z1) * 0.65;
              const op2 = 0.35 + Math.abs(z2) * 0.65;
              const isConnector = i % 4 === 0;
              return (
                <g key={i}>
                  {isConnector && (
                    <line
                      x1={x1} y1={y} x2={x2} y2={y}
                      stroke="rgba(99,102,241,0.3)"
                      strokeWidth="0.8"
                    />
                  )}
                  <circle cx={x1} cy={y} r={r1} fill={`rgba(99,102,241,${op1.toFixed(2)})`} />
                  <circle cx={x2} cy={y} r={r2} fill={`rgba(6,182,212,${op2.toFixed(2)})`} />
                </g>
              );
            })}
          </svg>

          {/* Center glyph */}
          <div style={{
            position: "absolute",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Space Mono', monospace",
            fontSize: "13px",
            color: "rgba(99,102,241,0.9)",
            letterSpacing: "0.05em",
          }}>
            {phase === "run" || phase === "out"
              ? `${Math.round(easedProgress * 100)}%`
              : "init"}
          </div>
        </div>

        {/* ── Glitch title ── */}
        <div style={{ position: "relative", lineHeight: 1 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "-0.02em",
            animation: "glitch1 7s ease-in-out infinite",
          }}>
            Portfolio
          </div>
          <div style={{
            position: "absolute",
            inset: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            fontWeight: 600,
            color: "#6366f1",
            letterSpacing: "-0.02em",
            animation: "glitch2 7s ease-in-out infinite",
          }}>
            Portfolio
          </div>
        </div>

        {/* ── Animated letters ── */}
        <div style={{
          display: "flex",
          gap: "1px",
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(99,102,241,0.7)",
        }}>
          {LETTERS.map((char, i) => (
            <span key={i} style={{
              display: "inline-block",
              opacity: 0,
              animation: `letterDrop 0.4s ease forwards`,
              animationDelay: `${i * 60}ms`,
            }}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
          <span style={{
            display: "inline-block",
            width: "8px",
            animation: "statusBlink 1s step-end infinite",
            marginLeft: "2px",
          }}>
            _
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            height: "2px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${easedProgress * 100}%`,
              background: "linear-gradient(90deg, #6366f1, #06b6d4)",
              borderRadius: "2px",
              transition: "width 0.05s linear",
            }} />
            {/* Shimmer on bar */}
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${easedProgress * 100}%`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              backgroundSize: "80px 100%",
              backgroundRepeat: "no-repeat",
              backgroundPositionX: `${(t % 2) / 2 * 100}%`,
              borderRadius: "2px",
            }} />
          </div>

          {/* Status line */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'Space Mono', monospace",
            fontSize: "9px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.1em",
          }}>
            <span>{
              progress < 0.25 ? "// init modules" :
              progress < 0.5  ? "// fetch assets" :
              progress < 0.75 ? "// build canvas" :
              progress < 0.95 ? "// finalize" :
                                "// done"
            }</span>
            <span>{Math.round(easedProgress * 100)}.00%</span>
          </div>
        </div>

        {/* ── Corner badges ── */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["sys", "net", "gpu"].map((label, i) => {
            const val = Math.round(30 + Math.sin(t * (1.2 + i * 0.4) + i) * 20 + 20);
            return (
              <div key={label} style={{
                padding: "5px 10px",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "4px",
                background: "rgba(99,102,241,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "8px",
                  color: "rgba(255,255,255,0.2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "12px",
                  color: i === 0 ? "rgba(99,102,241,0.8)" : i === 1 ? "rgba(6,182,212,0.8)" : "rgba(139,92,246,0.8)",
                  fontWeight: 600,
                }}>
                  {val}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Corner decorations ── */}
      {[
        { top: 24, left: 24 },
        { top: 24, right: 24 },
        { bottom: 24, left: 24 },
        { bottom: 24, right: 24 },
      ].map((pos, i) => {
        const borders = {
          borderTop: i < 2 ? "1px solid rgba(99,102,241,0.35)" : "none",
          borderBottom: i >= 2 ? "1px solid rgba(99,102,241,0.35)" : "none",
          borderLeft: i % 2 === 0 ? "1px solid rgba(99,102,241,0.35)" : "none",
          borderRight: i % 2 !== 0 ? "1px solid rgba(99,102,241,0.35)" : "none",
        };
        return (
          <div key={i} style={{
            position: "absolute",
            ...pos,
            width: 22, height: 22,
            ...borders,
          }} />
        );
      })}

      {/* ── Bottom version ── */}
      <div style={{
        position: "absolute",
        bottom: 28,
        fontFamily: "'Space Mono', monospace",
        fontSize: "9px",
        color: "rgba(255,255,255,0.12)",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}>
        v2025 · crafted with intent
      </div>
    </div>
  );
}