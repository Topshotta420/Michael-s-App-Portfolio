import React from 'react';
import type { Plan } from '../types';

interface PricingPageProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
}

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3.25a.75.75 0 01.75.75v1.255a.25.25 0 00.25.25h1.255a.75.75 0 010 1.5H11a.25.25 0 00-.25.25v1.255a.75.75 0 01-1.5 0V7.255A.25.25 0 009 7H7.745a.75.75 0 010-1.5H9a.25.25 0 00.25-.25V4A.75.75 0 0110 3.25zM5.22 5.22a.75.75 0 011.06 0L7.5 6.44l1.22-1.22a.75.75 0 011.06 1.06L8.56 7.5l1.22 1.22a.75.75 0 11-1.06 1.06L7.5 8.56l-1.22 1.22a.75.75 0 01-1.06-1.06L6.44 7.5 5.22 6.28a.75.75 0 010-1.06zM14.78 14.78a.75.75 0 01-1.06 0L12.5 13.56l-1.22 1.22a.75.75 0 11-1.06-1.06l1.22-1.22-1.22-1.22a.75.75 0 011.06-1.06l1.22 1.22 1.22-1.22a.75.75 0 011.06 1.06L13.56 12.5l1.22 1.22a.75.75 0 010 1.06z" clipRule="evenodd" />
    </svg>
);

const PricingCard: React.FC<{ plan: Plan; onSelect: () => void }> = ({ plan, onSelect }) => {
    const isPopular = plan.isPopular;
    return (
        <div className={`relative flex flex-col p-8 bg-white rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isPopular ? 'border-4 border-brand-secondary bg-gradient-to-br from-yellow-50 to-orange-100' : 'border border-gray-200'}`}>
            {isPopular && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center z-10">
                    <span className="bg-brand-secondary text-white text-sm font-bold px-4 py-2 rounded-full uppercase shadow-lg tracking-wider">Most Popular</span>
                </div>
            )}
            <h3 className="text-2xl font-bold text-center text-gray-800 mt-4">{plan.name}</h3>
            <p className="mt-2 text-center text-gray-500">
                <span className="text-5xl font-extrabold text-brand-dark">{plan.price}</span>
                <span className="text-base font-medium">{plan.priceDetails}</span>
            </p>
            <ul className="mt-8 space-y-4 flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <SparkleIcon />
                        <span className="text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={onSelect}
                className={`w-full mt-8 py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-300 transform ${isPopular ? 'bg-brand-secondary hover:bg-orange-500 text-white shadow-lg hover:shadow-xl' : 'bg-brand-primary hover:bg-blue-700 text-white shadow-md hover:shadow-lg'} hover:-translate-y-1`}
            >
                {plan.cta}
            </button>
        </div>
    );
};

const PricingPage: React.FC<PricingPageProps> = ({ plans, onSelectPlan }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">Choose Your Adventure!</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">First, select the plan you'd like to use for this session. You can start a new story to change plans at any time.</p>
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} onSelect={() => onSelectPlan(plan)} />
        ))}
      </div>
    </div>
  );
};

export default PricingPage;