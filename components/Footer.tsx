
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Magical Story Creator AI. All rights reserved.</p>
        <p className="text-sm mt-1">Powered by Imagination and Gemini AI</p>
      </div>
    </footer>
  );
};

export default Footer;