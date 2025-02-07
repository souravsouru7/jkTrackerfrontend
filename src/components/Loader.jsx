import React from 'react';

export const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F5539]"></div>
    </div>
  );
};

export default Loader; 