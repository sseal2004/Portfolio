import React from 'react';

import Timeline from './Timeline';
// import BulletBikeScene from './BicycleScene';

const ExperienceMain = () => {
  return (
    <section
      id="experience"
      className="py-[60px] px-4 relative overflow-hidden
        bg-[#f7f4ee] text-[#1c1a17]
        dark:bg-[#0a0a0d] dark:text-white"
    >
      {/* Faint dot-grid texture — barely visible, just enough grain
          so the flat color doesn't look untouched. */}
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

      {/* Dark mode: one cool cyan glow, felt rather than seen. */}
      <div
        className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[65%] h-[460px] pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse at top, rgba(34,211,238,0.16), transparent 70%)' }}
      />
      <div
        className="hidden dark:block absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
      />

      {/* Light mode: split accent — pink upper-left, blue upper-right —
          two quiet washes instead of one flat color. */}
      <div
        className="block dark:hidden absolute top-0 left-0 w-[55%] h-[420px] pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(244,114,182,0.16), transparent 70%)' }}
      />
      <div
        className="block dark:hidden absolute top-0 right-0 w-[55%] h-[420px] pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(56,189,248,0.16), transparent 70%)' }}
      />

      {/* Soft vignette to ground the edges, mostly felt in dark mode */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.05) 100%)',
        }}
      />
      <div
        className="hidden dark:block absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-4 relative">
        <span className="inline-block text-xs tracking-[0.3em] uppercase text-rose-500 dark:text-cyan mb-3">
          Experience
        </span>
        <h2 className="text-4xl md:text-5xl font-bold">
          My Development{' '}
          <span className="bg-gradient-to-r from-pink-500 to-sky-500 dark:from-cyan dark:to-cyan-300 text-transparent bg-clip-text">
            Journey
          </span>
        </h2>
        <p className="text-[#4a453d] dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          From frontend enthusiast to full-stack developer — and now sharpening the fundamentals through
          competitive programming, DSA, and daily practice on LeetCode, GeeksforGeeks & Codeforces.
        </p>
      </div>

      {/* Timeline section */}
      <div className="max-w-5xl mx-auto relative">
        <Timeline />
      </div>
    </section>
  );
};

export default ExperienceMain;