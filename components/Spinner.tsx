import React from 'react';

interface SpinnerProps {
    message?: string;
    percentage?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ message = 'Loading...', percentage = 0 }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg mx-auto border border-gray-200">
            <div className="text-7xl mb-4" role="img" aria-label="Magical Sparkles">
                <span className="animate-pulse inline-block">✨</span>
            </div>
            
            <h2 className="mt-4 text-2xl font-bold text-brand-dark">{message}</h2>
            <p className="text-gray-600 mt-2 mb-6">Please be patient, the magic is in progress!</p>
            
            <div className="w-full bg-brand-light rounded-full h-4 shadow-inner">
                <div 
                    className="bg-gradient-to-r from-yellow-400 to-brand-secondary h-4 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Loading progress: ${Math.round(percentage)}%`}
                ></div>
            </div>
        </div>
    );
};

export default Spinner;