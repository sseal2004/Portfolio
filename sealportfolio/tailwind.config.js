import scrollbar from 'tailwind-scrollbar'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      transform: ['hover', 'group-hover'],
  willChange: ['hover', 'group-hover'],
      animation: {
        orangeGlow: 'orangeGlow 2.5s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
        spinSlow: 'spin 3s linear infinite',
      },
      keyframes: {
        orangeGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(255,165,0,0.5)' },
          '50%': { boxShadow: '0 0 60px rgba(255,165,0,0.9)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        brown: "#53423e",
        lightBrown: "#645550",
        darkBrown: "#2c2523",
        black: "#1e1917",
        white: "#f1e1d9",
        cyan: "#15d1e9",
        lightCyan: "#88e5f0",
        darkCyan: "#09afb3",
        orange: "#fb9718",
        lightOrange: "#fac27b",
        darkOrange: "#d84222",
        grey: "#626965",
        lightGrey: "#978580",
        darkGrey: "#3f4441",
        rose: "#f43f5e",
        amber: "#f59e0b",
        purple: "#8b5cf6",
        blue: "#3b82f6",
        darkblue: "#0033cc",
        indigo: "#6366f1",
        fuchsia: "#d946ef",
        emerald: "#10b981",
        violet: "#8b5cf6",
        pink: "#ec4899",
        slate: "#64748b",
        lime: "#84cc16",
        zinc: "#71717a",
      },
      boxShadow: {
        indigoShawdow: "0px 0px 25px 0px rgba(99, 102, 241, 0.6)",
        cyanMediumShawdow: "10px 10px 200px 150px rgba(94,206,220,0.5)",
        fuchsiaMediumShadow: "10px 10px 200px 150px rgba(255, 0, 255, 0.5)",
        orangeMediumShawdow: "10px 10px 200px 150px rgba(240,169,79,0.5)",
        lightPinkGlow: '0 0 100px 40px rgba(255, 182, 193, 0.2)',
        lightYellowGlow: '0 0 100px 40px rgba(255, 255, 153, 0.2)',
        lightBlueGlow: '0 0 100px 40px rgba(173, 216, 230, 0.2)',
        lightOrangeGlow: '0 0 100px 40px rgba(255, 204, 153, 0.2)',
      },
      fontFamily: {
        body: ["Josefin Sans"],
        special: ["Roboto"],
      },
    },
  },
  plugins: [
    scrollbar
  ],
}
