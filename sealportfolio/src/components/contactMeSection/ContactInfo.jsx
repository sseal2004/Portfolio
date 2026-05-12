import React from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { FiPhone } from 'react-icons/fi';
import { IoLocationOutline } from 'react-icons/io5';
import SingleInfo from './SingleInfo';

const ContactInfo = () => {
  return (
    <div className="flex flex-col gap-4 text-white">
      <SingleInfo text="s.seal.a.b.c@gmail.com" Icon={HiOutlineMail} />
      <SingleInfo text="+91 7687967008" Icon={FiPhone} />
      <SingleInfo text="Kolkata, West Bengal" Icon={IoLocationOutline} />
    </div>
  );
};

export default ContactInfo;
