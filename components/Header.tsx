
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-brand-dark tracking-tight">
          <span className="text-brand-primary">Magical Story </span>
          <span className="text-brand-secondary">Creator</span> AI
        </h1>
      </div>
    </header>
  );
};

export default Header;