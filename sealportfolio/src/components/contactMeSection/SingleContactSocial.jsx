import React from 'react'

const SingleContactSocial = ({Icons,link}) => {
  return (
    <div className="text-2xl h-12 w-12 border border-orange text-orange rounded-full p-3 flex items-center justify-center">
        <a href={link} className='cursor-pointer'>
            <Icons />
        </a>
    </div>
  )
}

export default SingleContactSocial