import React from 'react';

const links = [
  { link: "Home", section: "home" },
  { link: "About Me", section: "about" },
  { link: "Skills", section: "skills" },
  { link: "My Journey", section: "experience" },
  { link: "Projects", section: "projects" },
  { link: "Certificate", section: "certificate" },

  { link: "Contact Me", section: "contact" },
];

const FooterMain = () => {
  return (
    <footer className="px-4 mt-24">
      {/* Divider Line */}
      <div className="w-full h-[1px] bg-lightGrey" />

      {/* Footer Content */}
      <div className="flex flex-wrap justify-between items-center mt-4 max-w-[1200px] mx-auto">
        <p className="text-3xl text-darkblue dark:text-cyan font-semibold">Soumyadipta Seal</p>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-4 dark:text-lightGrey text-xl mt-2 md:mt-0">
            {links.map((item, index) => (
              <li key={index}>
                <a
                  href={`#${item.section}`}
                  className="hover:text-darkOrange dark:hover:text-orange transition-all duration-500 cursor-pointer hover:scale-110  hover:font-bold"
                >
                  {item.link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Copyright */}
      <p className="max-w-[1200px] mx-auto text-right mt-2 mb-12 text-sm text-darkblue dark:text-orange">
        © 2026 Soumyadipta Seal | All Rights Reserved.
      </p>
    </footer>
  );
};

export default FooterMain;

