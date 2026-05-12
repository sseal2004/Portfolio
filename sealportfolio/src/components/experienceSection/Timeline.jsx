import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { motion } from 'framer-motion';
import { FaReact, FaNodeJs } from 'react-icons/fa';
import { SiMongodb } from 'react-icons/si';
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

// Dark/Light mode icon style
const getIconStyle = (isDarkMode) => ({
  background: isDarkMode ? '#0f172a' : '#e2e8f0',
  color: isDarkMode ? '#ffffff' : '#1e293b',
});

const Timeline = () => {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <VerticalTimeline>
      {/* Frontend Developer */}
      <VerticalTimelineElement
        contentStyle={{ background: 'transparent', boxShadow: 'none', padding: '0' }}
        contentArrowStyle={{ borderRight: '7px solid #fff' }}
        date="December 2023 - May 2024"
        iconStyle={{ ...getIconStyle(isDarkMode) }}
        icon={<FaReact size={24} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper borderColor="border-purple-500/40">
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
        iconStyle={{ ...getIconStyle(isDarkMode) }}
        icon={<FaNodeJs size={24} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper borderColor="border-teal-400/40">
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
        iconStyle={{ ...getIconStyle(isDarkMode) }}
        icon={<SiMongodb size={24} className={iconBaseStyle} />}
      >
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
          <CardWrapper borderColor="border-indigo-500/40">
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
    </VerticalTimeline>
  );
};

export default Timeline;



