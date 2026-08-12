import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { motion } from 'framer-motion';
import { FaReact, FaNodeJs } from 'react-icons/fa';
import { SiMongodb, SiLeetcode, SiCodeforces, SiGeeksforgeeks } from 'react-icons/si';
import CardWrapper from './CardWrapper';
import './timeline-theme.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Helper for tailwind-based icon hover styling
const iconBaseStyle =
  'transition-transform duration-300 ease-in-out transform hover:scale-110 shadow-md rounded-full';

/**
 * Each timeline stop gets its own "vibe" — a light-mode background/
 * text pair and a completely different dark-mode pair — instead of
 * one shared slate/white icon style for every entry. Passed straight
 * into iconStyle, so no extra CSS classes needed.
 */
const getIconStyle = (isDarkMode, theme) => (isDarkMode ? theme.dark : theme.light);

const iconThemes = {
  frontend: {
    light: { background: '#ede9fe', color: '#6d28d9' }, // violet
    dark: { background: '#1e1b3a', color: '#c4b5fd', boxShadow: '0 0 14px rgba(196,181,253,0.45)' },
  },
  backend: {
    light: { background: '#ccfbf1', color: '#0f766e' }, // teal
    dark: { background: '#0d2b28', color: '#5eead4', boxShadow: '0 0 14px rgba(94,234,212,0.45)' },
  },
  fullstack: {
    light: { background: '#e0e7ff', color: '#4338ca' }, // indigo
    dark: { background: '#1a1a3d', color: '#a5b4fc', boxShadow: '0 0 14px rgba(165,180,252,0.45)' },
  },
  competitive: {
    light: { background: '#fef9c3', color: '#854d0e' }, // amber
    dark: { background: '#132b16', color: '#a3e635', boxShadow: '0 0 16px rgba(163,230,53,0.55)' },
  },
};

const Timeline = () => {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <VerticalTimeline>
      {/* Frontend Developer */}
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

      {/* Backend Developer */}
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

      {/* Full Stack Developer */}
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

      {/* Competitive Programmer — new for 2026 */}
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

export default Timeline;