import React from 'react';
import ContactInfo from './ContactInfo';
import ContactSocial from './ContactSocial';

const ContactMeRight = () => {
  return (
    <div className="flex flex-col items-center gap-12">
      <video
        src="/video/Email-vmake.mp4"
        className="max-w-[300px] rounded-xl"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      <ContactInfo />
      <ContactSocial />
    </div>
  );
};

export default ContactMeRight;
