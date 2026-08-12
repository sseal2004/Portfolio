import React, { useState, useEffect } from 'react';
import NavbarLogo from './NavbarLogo';
import NavbarLinks from './NavbarLinks';
import NavbarBtn from './NavbarBtn';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import DarkBackground from './DarkBackground';
import LightBackground from './LightBackground';

const NavbarMain = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Every reload starts in dark mode, full stop — no localStorage check on init.
  // Light only exists as a live, in-session choice: it resets back to dark
  // the moment the page is reloaded.
  const [darkMode, setDarkMode] = useState(true);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
      {/* Background — hardcoded (no video) so it never lags.
          IMPORTANT: only the active background is mounted. Both
          DarkBackground and LightBackground run a real animation
          loop (WebGL/canvas), and their internal pause logic only
          checks document.hidden (tab-level visibility) — it has no
          way to know it's been hidden via a CSS "display: none"
          wrapper. Keeping both mounted and toggling them with
          Tailwind's dark: classes meant the inactive one kept
          rendering full-tilt off-screen, forever, eating the main
          thread and making the toggle itself feel laggy/stuck.
          Conditionally rendering here means the one that's swapped
          out actually unmounts, so its useEffect cleanup runs
          (cancelAnimationFrame + dispose) and it truly goes idle. */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        {darkMode ? <DarkBackground /> : <LightBackground />}
      </div>

      {/* Navbar */}
      <nav className="w-full fixed top-4 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-4">
        <div className="my-2 sm:my-3">
          <div
            className="w-full max-w-[95%] mx-auto flex flex-nowrap items-center justify-between 
  px-4 sm:px-6 lg:px-8 py-3 sm:py-4 
  rounded-full border border-orange dark:border-cyan
  backdrop-blur-lg 
  shadow-[0_0_25px_rgba(75,0,130,0.4)] 
  dark:shadow-[0_0_30px_rgba(255,165,0,0.5)] 
  dark:animate-[orangeGlow_2.5s_ease-in-out_infinite]"
          >
            {/* Logo */}
            <div className="min-w-0">
              <NavbarLogo />
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center justify-center gap-2 sm:gap-4 xl:gap-6 whitespace-nowrap text-sm sm:text-base">
              <NavbarLinks />
            </div>

            {/* Desktop Button */}
            <div className="hidden lg:flex whitespace-nowrap text-sm sm:text-base">
              <NavbarBtn />
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 sm:gap-3 mt-2 lg:mt-0">
              {/* Hamburger */}
              <div className="relative flex items-center justify-center px-1 sm:px-2 py-2 sm:py-3 gap-2">
                <div className="lg:hidden absolute inset-0 rounded-full border-[2px] sm:border-[3px] border-orange animate-spin-slow z-0 pointer-events-none"></div>
                <button
                  className="lg:hidden sm:block flex items-center justify-center text-xl sm:text-2xl p-2 sm:p-3 
  border-[2px] border-orange rounded-full 
  bg-white/10 dark:bg-black/10 
  backdrop-blur-md 
  text-black dark:text-white 
  hover:scale-105 transition-transform relative z-10"
                  onClick={toggleMenu}
                >
                  <GiHamburgerMenu />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="relative flex items-center justify-center px-1 sm:px-2 py-2 sm:py-3">
                <div className="absolute inset-0 rounded-full border-[2px] sm:border-[3px] border-orange animate-spin-slow z-0"></div>
                <button
                  className="relative z-10 flex items-center justify-center text-xl sm:text-2xl p-2 sm:p-3 
                    bg-white/60 dark:bg-black 
                    border-[2px] border-orange rounded-full 
                    text-black dark:text-white 
                    hover:scale-105 transition-transform"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? <MdDarkMode /> : <MdLightMode />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            className="mt-2 lg:hidden flex flex-col items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 
  bg-white/30 dark:bg-black/80 
  border border-orange-400 rounded-xl 
  backdrop-blur-xl 
  shadow-[0_0_25px_rgba(75,0,130,0.4)]
  dark:shadow-[0_0_25px_rgba(255,165,0,0.5)] 
  dark:animate-[orangeGlow_2.5s_ease-in-out_infinite] 
  text-sm sm:text-base text-black dark:text-white"
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <NavbarLinks />
              <NavbarBtn />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavbarMain;