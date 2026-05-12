import React from 'react';
import { GoArrowDownRight } from "react-icons/go";

const NavbarBtn = () => {
  return (
    <a
      href="/Soumyadipta_seal_cv.pdf" // Replace with actual resume link
      target="_blank"
      rel="noopener noreferrer"
     
    >
      <button className="px-6 py-2 rounded-full text-lg font-bold text-white border border-transparent bg-gradient-to-r from-indigo via-purple to-fuchsia shadow-lg shadow-indigo/50 hover:shadow-fuchsia/60 hover:border-violet hover:scale-110 hover:brightness-110 transition-all duration-500 ease-in-out flex items-center ">

      Resume<GoArrowDownRight size={16} />
      </button>
    </a>

  );
};

export default NavbarBtn;
