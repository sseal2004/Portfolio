import React from 'react';
import HeroPic from './HeroPic';
import HeroText from './HeroText';

const HeroMain = () => {
  return (
    <div className="pt-32 pb-16">
      <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto justify-between items-center px-4 text-center md:text-left gap-10 md:gap-[170px]">
        <div className="w-full md:w-1/2 md:-translate-x-4">
          <HeroText />
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <HeroPic />
        </div>
      </div>
    </div>
  );
};

export default HeroMain;
