import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#F5EBE0]/90 via-[#E6CCB2]/90 to-[#DDB892]/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center">
        {/* JK Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#7F5539]">
          JK
        </div>
        
        {/* Outer spinner */}
        <div className="w-16 h-16 border-4 border-[#B08968]/20 border-t-[#7F5539] rounded-full animate-spin" />
        
       
             
      
      </div>

      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
};
export default Loader;