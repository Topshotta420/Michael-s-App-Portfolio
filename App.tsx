import React, { useState, useEffect } from 'react';
import type { Plan, Book } from './types';
import { PLANS } from './constants';
import PricingPage from './components/PricingPage';
import StoryCreator from './components/StoryCreator';
import Header from './components/Header';
import Footer from './components/Footer';
import BookDisplay from './components/BookDisplay';

function App() {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [generatedBook, setGeneratedBook] = useState<Book | null>(null);
  const [sharedBook, setSharedBook] = useState<Book | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#book=')) {
        try {
          const encodedBook = window.location.hash.substring(6);
          const decodedBookJson = atob(encodedBook);
          const bookData: Book = JSON.parse(decodedBookJson);
          setSharedBook(bookData);
          // Clear other states to ensure only shared book is shown
          setCurrentPlan(null);
          setGeneratedBook(null);
        } catch (error) {
          console.error("Error decoding book from URL:", error);
          // Clear invalid hash to avoid loops and show the main page.
          window.history.replaceState(null, '', window.location.pathname);
          setSharedBook(null);
        }
      } else {
        setSharedBook(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on initial load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setCurrentPlan(plan);
  };

  const handleCreateNewStory = () => {
    setGeneratedBook(null);
    setCurrentPlan(null);
    if (window.location.hash) {
      window.location.hash = '';
    }
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {sharedBook ? (
            <BookDisplay book={sharedBook} onCreateNew={handleCreateNewStory} isSharedView={true} />
        ) : !currentPlan ? (
          <PricingPage plans={PLANS} onSelectPlan={handleSelectPlan} />
        ) : (
          <StoryCreator 
            plan={currentPlan} 
            generatedBook={generatedBook}
            setGeneratedBook={setGeneratedBook}
            onCreateNew={handleCreateNewStory}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
