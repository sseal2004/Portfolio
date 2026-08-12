import React, { useRef, useState, useEffect } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { motion, useMotionValue, useTransform, useScroll, useMotionValueEvent } from 'framer-motion';
import { FaReact, FaNodeJs } from 'react-icons/fa';
import { SiMongodb, SiLeetcode, SiCodeforces, SiGeeksforgeeks } from 'react-icons/si';
import * as THREE from 'three';
import './timeline-theme.css';

// ────────────────────────────────────────────────────────────
// useIsDarkMode — watches the <html class="dark"> toggle live,
// not just the OS preference at mount time.
// ────────────────────────────────────────────────────────────

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const target = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(target.classList.contains('dark'));
    });
    observer.observe(target, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

// ────────────────────────────────────────────────────────────
// WaveBackground — Three.js lines, each oscillating with classic
// simple-harmonic motion: y = A·sin(ωx + φ + t). Layered lines
// with slightly different amplitude/phase give a "waveform stack"
// feel rather than a single flat sine curve.
// ────────────────────────────────────────────────────────────

const WaveBackground = ({ isDarkMode }) => {
  const canvasRef = useRef(null);
  const mountRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mount = mountRef.current;
    if (!canvas || !mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 42);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    const primary = isDarkMode ? 0x22d3ee : 0x3b82f6;   // cyan / blue
    const secondary = isDarkMode ? 0xa3e635 : 0xf472b6;  // lime / pink

    const LINE_COUNT = 7;
    const POINTS = 140;
    const SPAN = 110;

    const lineMeshes = [];

    for (let i = 0; i < LINE_COUNT; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(POINTS * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? primary : secondary,
        transparent: true,
        opacity: 0.12 + (i / LINE_COUNT) * 0.18,
      });

      const line = new THREE.Line(geometry, material);
      line.position.y = (i - (LINE_COUNT - 1) / 2) * 3.6;
      scene.add(line);

      lineMeshes.push({
        line,
        phase: i * 0.55,              // φ — phase offset per line
        amplitude: 2.2 + i * 0.35,    // A — amplitude grows per line
        frequency: 0.14 + i * 0.01,   // ω — slightly different speed per line
      });
    }

    let frameId;
    let t = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      t += delta * 1.4;

      lineMeshes.forEach(({ line, phase, amplitude, frequency }) => {
        const positions = line.geometry.attributes.position.array;
        for (let p = 0; p < POINTS; p++) {
          const x = (p / (POINTS - 1)) * SPAN - SPAN / 2;
          const y = amplitude * Math.sin(frequency * x + t + phase); // SHM
          positions[p * 3] = x;
          positions[p * 3 + 1] = y;
          positions[p * 3 + 2] = 0;
        }
        line.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      lineMeshes.forEach(({ line }) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div ref={mountRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 dark:opacity-80"
        style={{ filter: 'blur(0.4px)' }}
      />
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// GlowingHeading — text-shadow oscillates on a sine cycle instead
// of a flat pulse, so the glow "breathes" rather than blinking.
// ────────────────────────────────────────────────────────────

const GlowingWord = ({ children, colorLight, colorDark, isDarkMode }) => {
  const color = isDarkMode ? colorDark : colorLight;
  return (
    <motion.span
      className="relative"
      style={{ color }}
      animate={{
        textShadow: [
          `0 0 6px ${color}55, 0 0 14px ${color}33`,
          `0 0 18px ${color}, 0 0 38px ${color}88`,
          `0 0 6px ${color}55, 0 0 14px ${color}33`,
        ],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.span>
  );
};

// ────────────────────────────────────────────────────────────
// CardWrapper — hover glow kept, plus a slow idle SHM pulse on
// the border/shadow so cards feel alive even at rest.
// ────────────────────────────────────────────────────────────

const MAX_ROTATE = 100;
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const cardVariants = {
  hidden: (direction) => ({
    opacity: 0,
    y: direction === 'up' ? -60 : 60,
    rotateZ: direction === 'up' ? 4 : -4,
  }),
  visible: {
    opacity: 1,
    y: 0,
    rotateZ: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const CardWrapper = ({
  children,
  borderColor,
  glowLight = 'rgba(240,169,79,0.45)',
  glowDark = 'rgba(240,169,79,0.5)',
  pulseDelay = 0,
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-50, 50], [MAX_ROTATE, -MAX_ROTATE]);
  const rotateY = useTransform(x, [-50, 50], [-MAX_ROTATE, MAX_ROTATE]);

  const [scrollDirection, setScrollDirection] = useState('down');
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > lastScrollY.current) {
      setScrollDirection('down');
    } else if (latest < lastScrollY.current) {
      setScrollDirection('up');
    }
    lastScrollY.current = latest;
  });

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left - rect.width / 2;
    const yPos = e.clientY - rect.top - rect.height / 2;
    x.set(xPos / 5);
    y.set(yPos / 5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
        cursor: 'url(/cursor-pointer.png), pointer',
        '--glow-light': glowLight,
        '--glow-dark': glowDark,
      }}
      custom={scrollDirection}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-300"
    >
      <motion.div
        animate={{
          boxShadow: [
            `0 0 0px 0px var(--glow-light)`,
            `0 0 30px 2px var(--glow-light)`,
            `0 0 0px 0px var(--glow-light)`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: pulseDelay }}
        className={`relative overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-lg border ${borderColor} rounded-2xl p-6
    shadow-lg transition-shadow duration-300
    hover:shadow-[0_0_25px_var(--glow-light)]
    dark:hover:shadow-[0_0_25px_var(--glow-dark)]`}
      >
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-60 dark:opacity-40"
          style={{ background: 'var(--glow-light)' }}
        />
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-0 dark:opacity-50"
          style={{ background: 'var(--glow-dark)' }}
        />
        <div className="relative">{children}</div>
      </motion.div>
    </motion.div>
  );
};

// ────────────────────────────────────────────────────────────
// Timeline
// ────────────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const iconBaseStyle =
  'transition-transform duration-300 ease-in-out transform hover:scale-110 shadow-md rounded-full';

const getIconStyle = (isDarkMode, theme) => (isDarkMode ? theme.dark : theme.light);

const iconThemes = {
  frontend: {
    light: { background: '#ede9fe', color: '#6d28d9' },
    dark: { background: '#1e1b3a', color: '#c4b5fd', boxShadow: '0 0 14px rgba(196,181,253,0.45)' },
  },
  backend: {
    light: { background: '#ccfbf1', color: '#0f766e' },
    dark: { background: '#0d2b28', color: '#5eead4', boxShadow: '0 0 14px rgba(94,234,212,0.45)' },
  },
  fullstack: {
    light: { background: '#e0e7ff', color: '#4338ca' },
    dark: { background: '#1a1a3d', color: '#a5b4fc', boxShadow: '0 0 14px rgba(165,180,252,0.45)' },
  },
  competitive: {
    light: { background: '#fef9c3', color: '#854d0e' },
    dark: { background: '#132b16', color: '#a3e635', boxShadow: '0 0 16px rgba(163,230,53,0.55)' },
  },
};

const Timeline = ({ isDarkMode }) => {
  return (
    <VerticalTimeline>
      <VerticalTimelineElement
        contentStyle={{ background: 'transparent', boxShadow: 'none', padding: '0' }}
        contentArrowStyle={{ borderRight: '7px solid #fff' }}
        date="December 2023 - May 2024"
        iconStyle={getIconStyle(isDarkMode, iconThemes.frontend)}
        icon={<FaReact size={24} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper
            borderColor="border-purple-500/40"
            glowLight="rgba(124,58,237,0.4)"
            glowDark="rgba(196,181,253,0.5)"
            pulseDelay={0}
          >
            <h3 className="dark:text-cyan text-xl font-bold mb-2 text-darkblue">Frontend Developer</h3>
            <p className="text-yellow-400 mb-4">★★★★★</p>
            <ul className="text-sm dark:text-gray-200 list-disc list-inside space-y-1">
              <li>Built responsive websites using HTML, CSS, JavaScript, and React.</li>
              <li>Used Tailwind CSS, React Router, Axios.</li>
              <li>Component-based architecture and state management.</li>
              <li>Clean UI and improved UX.</li>
              <li>Contributed to open-source projects on GitHub.</li>
            </ul>
            <blockquote className="mt-4 italic text-orange dark:text-fuchsia">
              "Frontend development transformed how I approach problem-solving and user experience design."
            </blockquote>
          </CardWrapper>
        </motion.div>
      </VerticalTimelineElement>

      <VerticalTimelineElement
        contentStyle={{ background: 'transparent', boxShadow: 'none', padding: '0' }}
        contentArrowStyle={{ borderRight: '7px solid #fff' }}
        date="May 2024 - December 2024"
        iconStyle={getIconStyle(isDarkMode, iconThemes.backend)}
        icon={<FaNodeJs size={24} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper
            borderColor="border-teal-400/40"
            glowLight="rgba(15,118,110,0.4)"
            glowDark="rgba(94,234,212,0.5)"
            pulseDelay={0.6}
          >
            <h3 className="dark:text-cyan text-xl font-bold mb-2 text-darkblue">Backend Developer</h3>
            <p className="text-yellow-400 mb-4">★★★★★</p>
            <ul className="text-sm dark:text-gray-200 list-disc list-inside space-y-1">
              <li>Built backend using Node.js and Express.</li>
              <li>Connected MongoDB and Firebase for data storage.</li>
              <li>Built REST APIs and managed routes.</li>
              <li>Deployments via Render and Netlify.</li>
              <li>Structured clean, modular backend logic.</li>
            </ul>
            <blockquote className="mt-4 italic text-rose dark:text-teal-200">
              "Backend development taught me how to think in terms of systems and data flow."
            </blockquote>
          </CardWrapper>
        </motion.div>
      </VerticalTimelineElement>

      <VerticalTimelineElement
        contentStyle={{ background: 'transparent', boxShadow: 'none', padding: '0' }}
        contentArrowStyle={{ borderRight: '7px solid #fff' }}
        date="Feb 2025 - Present"
        iconStyle={getIconStyle(isDarkMode, iconThemes.fullstack)}
        icon={<SiMongodb size={24} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper
            borderColor="border-indigo-500/40"
            glowLight="rgba(67,56,202,0.4)"
            glowDark="rgba(165,180,252,0.5)"
            pulseDelay={1.2}
          >
            <h3 className="dark:text-cyan text-xl font-bold mb-2 text-darkblue">Full Stack Developer</h3>
            <p className="text-yellow-400 mb-4">★★★★★</p>
            <ul className="text-sm dark:text-gray-200 list-disc list-inside space-y-1">
              <li>Developed end-to-end web apps using the MERN stack.</li>
              <li>Integrated APIs and databases like Firebase and MongoDB.</li>
              <li>Used Redux for state and built real-time features with Socket.IO.</li>
              <li>Deployment experience on Vercel, Render, Firebase.</li>
              <li>Practiced secure auth, validation & modern design patterns.</li>
            </ul>
            <blockquote className="mt-4 italic text-darkblue dark:text-indigo">
              "Full-stack development gave me the complete picture of how modern web applications work."
            </blockquote>
          </CardWrapper>
        </motion.div>
      </VerticalTimelineElement>

      <VerticalTimelineElement
        contentStyle={{ background: 'transparent', boxShadow: 'none', padding: '0' }}
        contentArrowStyle={{ borderRight: '7px solid #fff' }}
        date="2026 - Present"
        iconStyle={getIconStyle(isDarkMode, iconThemes.competitive)}
        icon={<SiLeetcode size={22} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper
            borderColor="border-amber-400/40"
            glowLight="rgba(202,138,4,0.4)"
            glowDark="rgba(163,230,53,0.55)"
            pulseDelay={1.8}
          >
            <h3 className="dark:text-lime-300 text-xl font-bold mb-2 text-darkblue">Competitive Programmer</h3>
            <p className="text-yellow-400 mb-4">★★★★★</p>
            <ul className="text-sm dark:text-gray-200 list-disc list-inside space-y-1">
              <li>Sharpening core DSA — arrays, trees, graphs, DP — problem by problem.</li>
              <li>Solving daily on LeetCode and GeeksforGeeks to build pattern recognition.</li>
              <li>Rated participant in Codeforces rounds, chasing consistency over one-off spikes.</li>
              <li>Treating contests as a feedback loop for writing cleaner, faster, more provable code.</li>
            </ul>
            <div className="flex items-center gap-4 mt-4 text-2xl text-darkblue dark:text-lime-300">
              <SiLeetcode title="LeetCode" />
              <SiCodeforces title="Codeforces" />
              <SiGeeksforgeeks title="GeeksforGeeks" />
            </div>
            <blockquote className="mt-4 italic text-amber-700 dark:text-lime-200">
              "Competitive programming is where I go back to first principles — no framework to lean on, just the problem."
            </blockquote>
          </CardWrapper>
        </motion.div>
      </VerticalTimelineElement>
    </VerticalTimeline>
  );
};

// ────────────────────────────────────────────────────────────
// ExperienceMain
// ────────────────────────────────────────────────────────────

const ExperienceMain = () => {
  const isDarkMode = useIsDarkMode();

  return (
    <section
      id="experience"
      className="py-[60px] px-4 relative overflow-hidden
        bg-[#f7f4ee] text-[#1c1a17]
        dark:bg-[#0a0a0d] dark:text-white"
    >
      <WaveBackground isDarkMode={isDarkMode} />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          color: '#00000014',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          color: '#ffffff1a',
        }}
      />

      <div
        className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[65%] h-[460px] pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse at top, rgba(34,211,238,0.16), transparent 70%)' }}
      />
      <div
        className="hidden dark:block absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
      />
      <div
        className="block dark:hidden absolute top-0 left-0 w-[55%] h-[420px] pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(244,114,182,0.16), transparent 70%)' }}
      />
      <div
        className="block dark:hidden absolute top-0 right-0 w-[55%] h-[420px] pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(56,189,248,0.16), transparent 70%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.05) 100%)' }}
      />
      <div
        className="hidden dark:block absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(0,0,0,0.55) 100%)' }}
      />

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-4 relative">
        <span className="inline-block text-xs tracking-[0.3em] uppercase text-rose-500 dark:text-cyan mb-3">
          Experience
        </span>
        <h2 className="text-4xl md:text-5xl font-bold">
          My Development{' '}
          <GlowingWord colorLight="#3b82f6" colorDark="#22d3ee" isDarkMode={isDarkMode}>
            Journey
          </GlowingWord>
        </h2>
        <p className="text-[#4a453d] dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          From frontend enthusiast to full-stack developer — and now sharpening the fundamentals through
          competitive programming, DSA, and daily practice on LeetCode, GeeksforGeeks & Codeforces.
        </p>
      </div>

      {/* Timeline section */}
      <div className="max-w-5xl mx-auto relative">
        <Timeline isDarkMode={isDarkMode} />
      </div>
    </section>
  );
};

export default ExperienceMain;