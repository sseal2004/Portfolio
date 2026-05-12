import React from 'react'
import SingleContactSocial from './SingleContactSocial'
import { FiGithub, FiLink } from 'react-icons/fi'
import { FiLinkedin } from 'react-icons/fi'
import { FaInstagram } from 'react-icons/fa'

const ContactSocial = () => {
  return (
    <div className='flex gap-4'>
        <SingleContactSocial link='https://www.linkedin.com/in/soumyadipta-seal-a6633a290/' Icons={FiLinkedin} />
                <SingleContactSocial link='https://github.com/sseal2004' Icons={FiGithub} />
                        <SingleContactSocial link='https://www.instagram.com/its_me_soumyadipta_/' Icons={FaInstagram} />


    </div>
  )
}

export default ContactSocial