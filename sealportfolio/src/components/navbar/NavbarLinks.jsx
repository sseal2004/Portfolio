import React from 'react';
import {Link} from 'react-scroll'

const links = [
  { link: "Home", section: "home" },
  { link: "About Me", section: "about" },
  { link: "Skills", section: "skills" },
  { link: "My Journey", section: "experience" },
  { link: "Projects", section: "project" },
  { link: "Contact Me", section: "contact" },
];

const NavbarLinks = () => {
  return (
    <ul className="flex flex-col lg:flex-row items-center gap-4 font-semibold tracking-wide">
      {links.map(({ link, section }, index) => (
        <li
          key={index}
          className="group relative transition-all duration-300 ease-in-out hover:scale-105"
        >
          <Link
          to={section}
          smooth={true}
          spy={true}
          duration={500}
          offset={-130}
            className="px-3 py-1 inline-block transition-all duration-300 
              text-darkblue dark:text-white 
              group-hover:text-orange dark:group-hover:text-fuchsia cursor-pointer"
          >
            {link}
         <span
    className="absolute left-0 bottom-0 h-[2px] w-0 
      bg-gradient-to-r 
      from-purple via-pink to-red-500 
      dark:from-indigo dark:via-purple dark:to-fuchsia 
      rounded-full 
      transition-all duration-500 
      group-hover:w-full 
      group-hover:scale-x-100 
      origin-left"
  ></span>

          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavbarLinks;
