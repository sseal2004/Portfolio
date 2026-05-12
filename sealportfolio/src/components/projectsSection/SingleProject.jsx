import React from 'react';
import { BiSolidRightTopArrowCircle } from 'react-icons/bi';

const SingleProject = ({ name, year, align, image, link }) => {
  const isLeftAligned = align === 'left';

  return (
    <div className="w-full space-y-6 py-6 px-2 sm:px-4">
      {/* Text and Link Row */}
      <div
        className={`flex flex-col sm:flex-col-reverse md:flex-row items-center gap-4 justify-between 
        ${isLeftAligned ? 'md:flex-row' : 'md:flex-row-reverse'}`}
      >
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
          <h2 className="text-2xl sm:text-3xl text-orange font-bold">{name}</h2>
          <h3
            className={`text-lg sm:text-xl font-light font-special ${
              isLeftAligned ? 'md:text-right' : 'md:text-left'
            }`}
          >
            {year}
          </h3>
        </div>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base sm:text-lg flex items-center gap-2 text-cyan hover:text-orange transition-all duration-300"
        >
          View <BiSolidRightTopArrowCircle size={22} />
        </a>
      </div>

      {/* Image Section */}
      <div className="w-full max-w-[100%] sm:max-w-[90%] md:max-w-[400px] mx-auto rounded-xl overflow-hidden transform transition-all duration-500 relative border border-white">
        <div className="w-full h-full bg-cyan opacity-50 absolute top-0 left-0 hover:opacity-0 transition-all duration-500 hidden md:block"></div>
        <img
          src={image}
          alt="Project"
          className="w-full h-[200px] sm:h-[250px] md:h-[220px] object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default SingleProject;

