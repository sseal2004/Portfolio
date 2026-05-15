import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '../framerMotion/variant'
import CetificateText from './CertificateText'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const certificates = [
  { title: 'Euphoria Genx', date: 'Date: February 12 2025', image: '/image/certificates/internship.jpg' },
  { title: 'Internal Hackthon SIH 2025', date: 'Date: September 24 2025', image: '/image/certificates/sihImage.jpg' },
  { title: 'Hack-O-NiT 2024', date: 'Date: May 15 2024', image: '/image/certificates/hackonit.jpg' },
  { title: 'Paper Published 2025', date: 'Date: October 14 2025', image: '/image/certificates/ciacon.jpg' },
  { title: 'Prodigy Internship', date: 'Date: 31st February 2025', image: '/image/certificates/prodigyIntern.jpg' },
  { title: 'Programming in Java', date: 'Date: October 25 2025', image: '/image/certificates/npteljava.jpg' },
  { title: 'Object Oriented Programming', date: 'Date: February 12 2025', image: '/image/certificates/oops.jpg' },
  { title: 'PostMan Api', date: 'Date: June 28 2024', image: '/image/certificates/postMan.jpg' },
  { title: 'Compitative Programming', date: 'Date: June 28 2024', image: '/image/certificates/hackerrank.png' },
  { title: 'IIT kharagpur Unstop', date: 'Date: May 10 2023', image: '/image/certificates/unstop.jpg' },
  { title: 'AI-ML Virtual Internship', date: 'Date: September 15 2025', image: '/image/certificates/aimleduskill.jpg' },
]

const SLIDE_INTERVAL = 3000
const PER_VIEW = 3

const CertificateMain = () => {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)
  const maxIndex = certificates.length - PER_VIEW

  const goTo = useCallback((idx) => {
    setCurrent(Math.max(0, Math.min(idx, maxIndex)))
  }, [maxIndex])

  const prev = () => { goTo(current - 1); resetTimer() }
  const next = () => { goTo(current < maxIndex ? current + 1 : 0); resetTimer() }

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCurrent(c => (c < maxIndex ? c + 1 : 0))
    }, SLIDE_INTERVAL)
  }, [maxIndex])

  const stopTimer = () => { clearInterval(timerRef.current) }
  const resetTimer = () => { stopTimer(); startTimer() }

  useEffect(() => {
    if (!paused) startTimer()
    else stopTimer()
    return stopTimer
  }, [paused, startTimer])

  return (
    <div id="certificate" className="max-w-[1200px] mx-auto px-4">

      <motion.div
        variants={fadeIn('up', 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
      >
        <CetificateText />
      </motion.div>

      <div className="mt-12 border-2 border-black dark:border-white/60 p-5 md:p-6 rounded-sm">

        {/* Slider viewport */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left arrow — fixed: solid bg, always visible border + icon */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute -left-4 md:-left-5 top-1/2 -translate-y-1/2 z-10
              w-9 h-9 rounded-full flex items-center justify-center
              bg-orange border dark:bg-violet border-black/20 text-black dark:text-black 
              dark:bg-zinc-800 dark:border-white/30 
              hover:border-orange hover:text-orange
              dark:hover:border-orange dark:hover:text-orange
              transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${current * (100 / PER_VIEW)}%)` }}
            >
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="min-w-[100%] sm:min-w-[50%] lg:min-w-[33.333%] px-2"
                >
                  <motion.div
                    variants={fadeIn('up', 0.05 * index)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.1 }}
                  >
                    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-white/90 overflow-hidden flex flex-col h-full">
                      <div className="relative overflow-hidden aspect-[4/3] bg-black/30">
                        <img
                          src={cert.image}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/50">
                          <span className="text-sm text-orange font-medium">{cert.date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow — fixed: solid bg, always visible border + icon */}
          <button
            onClick={next}
            aria-label="Next"
            className="absolute -right-4 md:-right-5 top-1/2 -translate-y-1/2 z-10
              w-9 h-9 rounded-full flex items-center justify-center
              bg-orange dark:bg-violet border border-black/20 text-black
              dark:bg-zinc-800 dark:border-white/30 dark:text-black
              hover:border-orange hover:text-orange
              dark:hover:border-orange dark:hover:text-orange
              transition-all duration-200 hover:scale-110"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots */}
<div className="flex justify-center gap-2 mt-5">
  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
    <button
      key={i}
      aria-label={`Go to slide ${i + 1}`}
      onClick={() => { goTo(i); resetTimer() }}
      className={`rounded-full transition-all duration-300 border-none cursor-pointer ${
        i === current
          ? 'w-5 h-2 bg-orange'
          : 'w-2 h-2 bg-blue hover:bg-blue-500 dark:bg-gray-500 dark:hover:bg-gray-400'
      }`}
    />
  ))}
</div>

        {/* Progress bar */}
        <div className="mt-3 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue dark:bg-orange rounded-full transition-all duration-300"
            style={{ width: `${Math.round((current / maxIndex) * 100)}%` }}
          />
        </div>

        {/* Counter — black on light, gray on dark, slightly larger + bolder */}
        <p className="text-center text-xs font-semibold mt-2 tabular-nums text-black dark:text-gray-400">
          {current + 1}
          <span className="font-normal opacity-50"> / {maxIndex + 1}</span>
        </p>

      </div>
    </div>
  )
}

export default CertificateMain