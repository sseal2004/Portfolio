import React from 'react';
import ContactMeLeft from './ContactMeLeft';
import ContactMeRight from './ContactMeRight';

const ContactMeMain = () => {
  return (
    <div
      id="contact"
      className="max-w-[1200px] mx-auto items-center justify-center mt-[60px] px-4"
    >
<h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 
        bg-gradient-to-r from-rose via-darkOrange to-orange 
        dark:bg-gradient-to-t dark:from-white dark:via-orange dark:to-white 
        text-transparent bg-clip-text tracking-tight
        animate-fade-in-down">
  Contact Me
</h2>

      <div className="flex flex-col sm:flex-col lg:flex-row justify-between gap-8 sm:gap-12 lg:gap-24 bg-brown p-4 sm:p-6 md:p-8 rounded-2xl border border-orange dark:border-cyan ">
        <ContactMeLeft />
        <ContactMeRight />
      </div>
    </div>
  );
};

export default ContactMeMain;
