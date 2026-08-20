import React, { useState } from 'react';
import { RiSendPlaneFill } from "react-icons/ri";

const ContactForm = () => {

  const[name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const[success,setSucess]=useState('')
  const [sending, setSending] = useState(false);

const handleName =(e)=>{
  setName(e.target.value);
}
const handleEmail =(e)=>{
  setEmail(e.target.value);
}
const handleMessage =(e)=>{
  setMessage(e.target.value);
}

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    setSucess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error('Request failed');

      setName('');
      setEmail('');
      setMessage('');
      setSucess('Message Sent Successfully.');
      alert('Your message has been sent successfully!');
    } catch (error) {
      console.log(error);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-[95%]  md:w-[700px] mx-auto p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
      <p className='text-cyan'>{success}</p>
      <form className="flex flex-col gap-5" onSubmit={sendMessage}>
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
  disabled={sending}
  className="mt-2 py-3 flex items-center justify-center gap-2 rounded-lg h-12 bg-gradient-to-r from-pink via-rose to-orange text-white text-xl hover:scale-105 hover:shadow-md hover:brightness-110 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100"
>
          {sending ? 'Sending...' : 'Send Message'} <RiSendPlaneFill className="text-base sm:text-lg" />
        </button>
      </form>
    </div>
  );
};

export default ContactForm;