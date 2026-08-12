import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useScroll, useMotionValueEvent } from 'framer-motion';

const MAX_ROTATE = 100;
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// How far / how tilted the card starts from, per scroll direction.
// Scrolling down → card rises in from below.
// Scrolling up (reverse) → card drops in from above, tilted the opposite way.
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

/**
 * CardWrapper
 * ---------------------------------------------------------------
 * glowLight / glowDark let each timeline entry carry its own accent
 * color instead of every card sharing one fuchsia/orange hover glow.
 * They're passed in as raw rgba() strings and wired up as CSS custom
 * properties, so the actual Tailwind classes stay static strings
 * (`shadow-[0_0_25px_var(--glow-light)]`) and remain JIT-safe — only
 * the variable's *value* changes per instance, not the class name.
 */
const CardWrapper = ({
  children,
  borderColor,
  glowLight = 'rgba(240,169,79,0.45)',
  glowDark = 'rgba(240,169,79,0.5)',
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-50, 50], [MAX_ROTATE, -MAX_ROTATE]);
  const rotateY = useTransform(x, [-50, 50], [-MAX_ROTATE, MAX_ROTATE]);

  // Track scroll direction so the entrance animation can reverse itself.
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
      <div
        className={`relative overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-lg border ${borderColor} rounded-2xl p-6
    shadow-lg transition-shadow duration-300
    hover:shadow-[0_0_25px_var(--glow-light)]
    dark:hover:shadow-[0_0_25px_var(--glow-dark)]`}
      >
        {/* faint corner highlight, tinted by the card's own accent */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-60 dark:opacity-40"
          style={{ background: 'var(--glow-light)' }}
        />
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-0 dark:opacity-50"
          style={{ background: 'var(--glow-dark)' }}
        />

        <div className="relative">{children}</div>
      </div>
    </motion.div>
  );
};

export default CardWrapper;