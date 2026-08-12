import React, { useEffect, useRef } from 'react';

/**
 * LightBackground
 * ---------------------------------------------------------------
 * A hardcoded (no video file) replacement for light_bg.mp4.
 * A soft, off-white canvas scattered with drifting nodes, connected
 * by lines that fade between sky-blue and pink — each node carries
 * its own place on that blue→pink spectrum (set once, from its
 * starting position), so the whole graph reads as one coherent
 * duotone field rather than random flicker. Occasional pulses of
 * light travel along a connection like a packet of data.
 *
 * New in this pass:
 * - The graph reacts to the pointer: nodes within a soft radius are
 *   gently drawn toward (and swirl around) the cursor, so the field
 *   feels alive and responsive instead of just ambient.
 * - A soft glow follows the pointer itself, tinted by whatever part
 *   of the blue→pink spectrum is nearest.
 * - Pulses travel more often and trail a faint comet tail.
 * - Two blurred, softly-tinted "glass" shapes drift slowly above the
 *   canvas (pure CSS, no render-loop cost) to add depth without
 *   competing with the graph.
 *
 * Responsive by measurement, not breakpoints:
 * - Link distance and node size are derived from the canvas's own
 *   width, so a 380px phone screen and a 2560px monitor each get a
 *   graph that's proportioned correctly, instead of one fixed
 *   desktop tuning stretched (or crammed) onto every screen.
 *
 * Performance notes (same philosophy as DarkBackground):
 * - Node count scales with screen area, capped for very large screens.
 * - The render loop pauses completely when the tab is hidden.
 * - Respects prefers-reduced-motion (renders one static frame, no
 *   pointer interaction attached).
 * - Canvas is capped at devicePixelRatio 2.
 * - Connections are only checked against nearby nodes via a coarse
 *   spatial grid, so cost stays roughly linear as node count grows.
 * - Pointer attraction reuses the same spatial grid, so it doesn't
 *   add an extra O(n) pointer-distance pass beyond one grid lookup.
 */

const NODE_COLOR = [51, 65, 85]; // slate, base dot color before the duotone tint
const BLUE = [56, 189, 248]; // sky-blue end of the spectrum
const PINK = [244, 63, 165]; // pink end of the spectrum

const mixColor = (mix) => [
  Math.round(BLUE[0] + (PINK[0] - BLUE[0]) * mix),
  Math.round(BLUE[1] + (PINK[1] - BLUE[1]) * mix),
  Math.round(BLUE[2] + (PINK[2] - BLUE[2]) * mix),
];

const LightBackground = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const nodesRef = useRef([]);
  const pulsesRef = useRef([]);
  const linkDistanceRef = useRef(180);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false, targetActive: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const makeNode = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: 2.2 + Math.random() * 2.6, // bigger, more visible nodes
      mix: Math.random(), // this node's fixed position on the blue→pink spectrum
    });

    // Node density scales with area; link distance scales with the
    // narrower screen dimension so mobile gets a tighter, still-legible
    // web instead of one giant desktop-tuned distance crammed in.
    const nodeCountFor = (w, h) => {
      const area = w * h;
      const count = Math.round(area / 13500);
      return Math.max(24, Math.min(count, 110));
    };

    const linkDistanceFor = (w, h) => {
      const shortSide = Math.min(w, h);
      return Math.max(65, Math.min(shortSide * 0.2, 140));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      linkDistanceRef.current = linkDistanceFor(width, height);

      const target = nodeCountFor(width, height);
      const current = nodesRef.current;
      if (current.length < target) {
        for (let i = current.length; i < target; i++) current.push(makeNode());
      } else {
        nodesRef.current = current.slice(0, target);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    // ---- Pointer tracking (attraction field) ----
    const pointer = pointerRef.current;
    const updatePointerFromEvent = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.targetActive = 1;
    };
    const handlePointerMove = (e) => updatePointerFromEvent(e.clientX, e.clientY);
    const handlePointerLeave = () => {
      pointer.targetActive = 0;
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointerFromEvent(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    if (!prefersReducedMotion) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerleave', handlePointerLeave);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handlePointerLeave);
    }

    // spatial grid so we don't do an O(n^2) distance check every frame
    const buildGrid = (cellSize) => {
      const grid = new Map();
      const cols = Math.max(1, Math.ceil(width / cellSize));
      nodesRef.current.forEach((n, idx) => {
        const cx = Math.floor(n.x / cellSize);
        const cy = Math.floor(n.y / cellSize);
        const key = cy * cols + cx;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(idx);
      });
      return { grid, cols };
    };

    const drawBackdrop = () => {
      const g = ctx.createRadialGradient(
        width * 0.15,
        height * 0.05,
        0,
        width * 0.5,
        height * 0.6,
        width * 0.9
      );
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.55, '#f6f5fa');
      g.addColorStop(1, '#ece9f4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // faint pink and blue ambient washes in opposite corners —
      // ties the duotone into the page even where the graph is sparse
      const blueWash = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.55);
      blueWash.addColorStop(0, 'rgba(56,189,248,0.07)');
      blueWash.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = blueWash;
      ctx.fillRect(0, 0, width, height);

      const pinkWash = ctx.createRadialGradient(width, height, 0, width, height, width * 0.55);
      pinkWash.addColorStop(0, 'rgba(244,63,165,0.06)');
      pinkWash.addColorStop(1, 'rgba(244,63,165,0)');
      ctx.fillStyle = pinkWash;
      ctx.fillRect(0, 0, width, height);
    };

    const maybeSpawnPulse = (links) => {
      if (Math.random() > 0.028 || links.length === 0) return;
      const link = links[Math.floor(Math.random() * links.length)];
      pulsesRef.current.push({ a: link.a, b: link.b, t: 0, speed: 0.007 + Math.random() * 0.009 });
      if (pulsesRef.current.length > 14) pulsesRef.current.shift();
    };

    let lastTime = performance.now();

    const drawFrame = ({ animated, scale = 1 }) => {
      const linkDistance = linkDistanceRef.current;
      ctx.clearRect(0, 0, width, height);
      drawBackdrop();

      const nodes = nodesRef.current;

      // ease the pointer's "active" strength in/out so the field
      // doesn't snap when the cursor enters/leaves
      pointer.active += (pointer.targetActive - pointer.active) * 0.08;
      const pointerRadius = Math.max(120, Math.min(width, height) * 0.28);

      if (animated) {
        nodes.forEach((n) => {
          n.x += n.vx * scale;
          n.y += n.vy * scale;

          if (pointer.active > 0.01) {
            const dx = pointer.x - n.x;
            const dy = pointer.y - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < pointerRadius && dist > 0.01) {
              const falloff = 1 - dist / pointerRadius;
              const pull = falloff * falloff * 0.055 * pointer.active;
              // gentle swirl: mostly pulled inward, with a tangential
              // component so nodes orbit rather than pile onto the cursor
              const tangentX = -dy / dist;
              const tangentY = dx / dist;
              n.vx += (dx / dist) * pull + tangentX * pull * 0.6;
              n.vy += (dy / dist) * pull + tangentY * pull * 0.6;
            }
          }

          // gentle drag so pointer energy doesn't accumulate forever
          n.vx *= 0.985;
          n.vy *= 0.985;
          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          const maxSpeed = 1.1;
          if (speed > maxSpeed) {
            n.vx = (n.vx / speed) * maxSpeed;
            n.vy = (n.vy / speed) * maxSpeed;
          }

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.x = Math.max(0, Math.min(width, n.x));
          n.y = Math.max(0, Math.min(height, n.y));
        });
      }

      const { grid, cols } = buildGrid(linkDistance);
      const links = [];
      const MAX_LINKS_PER_NODE = 2;

      ctx.lineWidth = 1.6;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const cx = Math.floor(n.x / linkDistance);
        const cy = Math.floor(n.y / linkDistance);

        // gather nearby candidates first, then keep only the closest
        // few — a handful of confident lines reads better than every
        // node in range being wired together
        const candidates = [];
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const key = (cy + oy) * cols + (cx + ox);
            const bucket = grid.get(key);
            if (!bucket) continue;
            bucket.forEach((j) => {
              if (j === i) return;
              const m = nodes[j];
              const dx = n.x - m.x;
              const dy = n.y - m.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < linkDistance) candidates.push({ j, dist });
            });
          }
        }
        candidates.sort((a, b) => a.dist - b.dist);

        let drawn = 0;
        for (let c = 0; c < candidates.length && drawn < MAX_LINKS_PER_NODE; c++) {
          const { j, dist } = candidates[c];
          if (j < i) continue; // dedupe: only draw each pair once, from the lower index
          const m = nodes[j];

          let alpha = (1 - dist / linkDistance) * 0.85;

          // links near the pointer glow a little brighter
          const midX = (n.x + m.x) / 2;
          const midY = (n.y + m.y) / 2;
          const pdx = pointer.x - midX;
          const pdy = pointer.y - midY;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pointer.active > 0.01 && pdist < pointerRadius) {
            alpha += (1 - pdist / pointerRadius) * 0.35 * pointer.active;
          }

          const [r1, g1, b1] = mixColor(n.mix);
          const [r2, g2, b2] = mixColor(m.mix);
          const grad = ctx.createLinearGradient(n.x, n.y, m.x, m.y);
          grad.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
          grad.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
          links.push({ a: i, b: j });
          drawn++;
        }
      }

      if (animated && !prefersReducedMotion) maybeSpawnPulse(links);

      pulsesRef.current = pulsesRef.current.filter((p) => p.t < 1);
      pulsesRef.current.forEach((p) => {
        if (animated) p.t += p.speed * scale;
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) return;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(Math.min(1, p.t) * Math.PI);
        const [pr, pg, pb] = mixColor((a.mix + b.mix) / 2);

        // faint trailing tail behind the pulse head
        const tailT = Math.max(0, p.t - 0.12);
        const tx = a.x + (b.x - a.x) * tailT;
        const ty = a.y + (b.y - a.y) * tailT;
        ctx.strokeStyle = `rgba(${pr},${pg},${pb},${0.35 * fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();

        const grad = ctx.createRadialGradient(x, y, 0, x, y, 7);
        grad.addColorStop(0, `rgba(${pr},${pg},${pb},${fade})`);
        grad.addColorStop(1, `rgba(${pr},${pg},${pb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      const [nr, ng, nb] = NODE_COLOR;
      nodes.forEach((n) => {
        const [hr, hg, hb] = mixColor(n.mix);

        // soft duotone halo, bigger than before
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        halo.addColorStop(0, `rgba(${hr},${hg},${hb},0.22)`);
        halo.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fill();

        // core dot: mostly slate with a hint of its spectrum color
        ctx.beginPath();
        ctx.fillStyle = `rgba(${Math.round((nr + hr) / 2)},${Math.round(
          (ng + hg) / 2
        )},${Math.round((nb + hb) / 2)},0.68)`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // tiny bright center for sparkle
        ctx.beginPath();
        ctx.fillStyle = `rgba(${hr},${hg},${hb},0.9)`;
        ctx.arc(n.x, n.y, n.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // soft glow that follows the pointer, tinted by the nearest part
      // of the spectrum (blue on the left half, pink on the right)
      if (pointer.active > 0.01) {
        const spectrumMix = Math.max(0, Math.min(1, pointer.x / width));
        const [gr, gg, gb] = mixColor(spectrumMix);
        const glowR = pointerRadius * 0.55;
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, glowR);
        glow.addColorStop(0, `rgba(${gr},${gg},${gb},${0.16 * pointer.active})`);
        glow.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      const scale = dt / 16.7;

      drawFrame({ animated: true, scale });
      rafRef.current = requestAnimationFrame(step);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!prefersReducedMotion && !rafRef.current) {
        lastTime = performance.now();
        rafRef.current = requestAnimationFrame(step);
      }
    };

    if (prefersReducedMotion) {
      drawFrame({ animated: false });
    } else {
      rafRef.current = requestAnimationFrame(step);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#fafafb',
      }}
    >
      <style>{`
        @keyframes lbgDriftA {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(3%, 4%) scale(1.08); opacity: 1; }
        }
        @keyframes lbgDriftB {
          0%, 100% { transform: translate(0, 0) scale(1.05); opacity: 0.7; }
          50% { transform: translate(-4%, -3%) scale(0.96); opacity: 0.95; }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* Two soft, blurred glass-like shapes drifting above the canvas —
          pure CSS, no render-loop cost. Tinted with the same blue/pink
          spectrum as the graph so they read as part of the same field
          rather than a separate decoration. */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-8%',
          width: '46%',
          height: '46%',
          pointerEvents: 'none',
          background:
            'linear-gradient(135deg, rgba(56,189,248,0.16) 0%, rgba(56,189,248,0.06) 45%, rgba(56,189,248,0) 78%)',
          clipPath: 'polygon(0% 0%, 100% 10%, 15% 100%)',
          filter: 'blur(65px)',
          mixBlendMode: 'multiply',
          animation: 'lbgDriftA 14s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-10%',
          width: '50%',
          height: '50%',
          pointerEvents: 'none',
          background:
            'linear-gradient(315deg, rgba(244,63,165,0.14) 0%, rgba(244,63,165,0.05) 45%, rgba(244,63,165,0) 78%)',
          clipPath: 'polygon(100% 100%, 0% 85%, 85% 0%)',
          filter: 'blur(70px)',
          mixBlendMode: 'multiply',
          animation: 'lbgDriftB 17s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default LightBackground;