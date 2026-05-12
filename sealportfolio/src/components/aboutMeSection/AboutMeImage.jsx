import React from 'react';
import AboutVideo from '/video/about.mp4'; // Adjust the path based on your project structure

const AboutMeImage = () => {
  return (
    <div className="relative h-[500px] w-[300px] flex items-center justify-center">
      {/* Video container */}
      <div className="h-[500px] w-[300px] rounded-[100px] overflow-hidden relative z-10 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
        <video
          src={AboutVideo}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover rounded-[100px]"
        />
      </div>

      {/* Decorative background shape */}
      <div className="h-[500px] w-[250px] bg-orange absolute bottom-[-30px] left-[-30px] rounded-bl-[120px] rounded-tr-[120px] rounded-br-[20px] rounded-tl-[20px] -z-10 blur-[1px] shadow-lg" />
    </div>
  );
};

export default AboutMeImage;
