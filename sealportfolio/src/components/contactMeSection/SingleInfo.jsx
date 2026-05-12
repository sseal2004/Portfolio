import React from 'react';

const SingleInfo = ({ text, Icon }) => {
  return (
    <div className="flex gap-4 items-center justify-start">
      <Icon className="text-3xl text-cyan-400" />
      <p className="text-lg">{text}</p>
    </div>
  );
};

export default SingleInfo;
