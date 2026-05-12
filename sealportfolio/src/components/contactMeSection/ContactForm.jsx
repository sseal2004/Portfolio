import React, { useState } from 'react';
import { RiSendPlaneFill } from "react-icons/ri";
import { useRef } from 'react';
import emailjs from '@emailjs/browser'

const ContactForm = () => {

  const[name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const[success,setSucess]=useState('')

const handleName =(e)=>{
  setName(e.target.value);
}
const handleEmail =(e)=>{
  setEmail(e.target.value);
}
const handleMessage =(e)=>{
  setMessage(e.target.value);
}


  const form = useRef();

  const sendEmail = (e) => {
  e.preventDefault();

 emailjs.sendForm(
  import.meta.env.VITE_YOUR_SERVICE_ID,
  import.meta.env.VITE_YOUR_TEMPLATE_ID,
  e.target,
  import.meta.env.VITE_YOUR_PUBLIC_KEY
)


  .then((result) => {
    
    setName('');
    setEmail('');
    setMessage('');
    setSucess('Message Sent Successfully.')
    console.log(result.text);
    alert('Your message has been sent successfully!');

  }, (error) => {
    console.log(error.text);
    alert('Failed to send message.');
  });
};
  return (
    <div className="w-[95%]  md:w-[700px] mx-auto p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
      <p className='text-cyan'>{success}</p>
      <form className="flex flex-col gap-5" ref={form} onSubmit={sendEmail}>
        <input
          name='from_name'
          type="text"
          placeholder="Your Name"
          required
          className="h-12 px-4 rounded-lg bg-white/90 text-darkblue placeholder-blue focus:outline-none focus:ring-2 focus:ring-rose transition duration-200"
          value={name}
          onChange={handleName}
        />
        <input
          name='from_email'
          type="email"
          placeholder="Your Email"
          required
          className="h-12 px-4 rounded-lg bg-white/90 text-darkblue placeholder-blue focus:outline-none focus:ring-2 focus:ring-rose transition duration-200"
          value={email}
          onChange={handleEmail}
        />
        <textarea
          name='message'
          placeholder="Your Message"
          rows="6"
          required
          className="px-4 py-3 rounded-lg bg-white/90 text-darkblue placeholder-blue focus:outline-none focus:ring-2 focus:ring-rose transition duration-200 resize-none"
          value={message}
          onChange={handleMessage}
        />
        <button
  type="submit"
  className="mt-2 py-3 flex items-center justify-center gap-2 rounded-lg h-12 bg-gradient-to-r from-pink via-rose to-orange text-white text-xl hover:scale-105 hover:shadow-md hover:brightness-110 transition-all duration-300"
>
          Send Message <RiSendPlaneFill className="text-base sm:text-lg" />
        </button>
      </form>
    </div>
  );
};

export default ContactForm;



