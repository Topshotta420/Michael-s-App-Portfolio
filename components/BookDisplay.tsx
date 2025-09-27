import React, { useState, useEffect } from 'react';
import type { Book } from '../types';

interface BookDisplayProps {
    book: Book;
    onCreateNew: () => void;
    isSharedView?: boolean;
}

const ReadAloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);


const BookDisplay: React.FC<BookDisplayProps> = ({ book, onCreateNew, isSharedView = false }) => {
    const [speakingPage, setSpeakingPage] = useState<number | null>(null);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const handleReadAloud = (text: string, pageNumber: number) => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text-to-speech.");
            return;
        }
        
        if (speakingPage === pageNumber) {
            window.speechSynthesis.cancel();
            setSpeakingPage(null);
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setSpeakingPage(null);
        };
        utterance.onerror = () => {
            setSpeakingPage(null);
            console.error("Speech synthesis error occurred.");
        };

        window.speechSynthesis.speak(utterance);
        setSpeakingPage(pageNumber);
    };

    const handleShare = () => {
        try {
            const bookJson = JSON.stringify(book);
            const encodedBook = btoa(bookJson);
            const shareUrl = `${window.location.origin}${window.location.pathname}#book=${encodedBook}`;
            
            navigator.clipboard.writeText(shareUrl).then(() => {
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 3000); // Hide message after 3 seconds
            }, (err) => {
                console.error('Could not copy text: ', err);
                alert("Failed to copy link.");
            });
        } catch (error) {
            console.error("Failed to create share link:", error);
            alert("Could not create a shareable link.");
        }
    };

    useEffect(() => {
        // Cleanup function to stop speech synthesis when component unmounts
        return () => {
            if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);


    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-5xl mx-auto animate-fade-in">
             {isSharedView && (
                <div className="mb-6 text-center bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg">
                    You are viewing a shared story. <button onClick={onCreateNew} className="font-bold underline hover:text-blue-600">Click here</button> to create your own!
                </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark text-center mb-6">{book.title}</h1>

            {/* Book Cover */}
            <div className="mb-12 p-4 border-4 border-brand-secondary rounded-lg bg-yellow-50">
                <h2 className="text-2xl font-bold text-center text-brand-secondary mb-4">Your Storybook Cover</h2>
                 {book.coverImageUrl ? (
                    <img
                        src={`data:image/png;base64,${book.coverImageUrl}`}
                        alt="Book Cover"
                        className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                    />
                ) : (
                    <div className="w-full max-w-md h-96 mx-auto rounded-lg shadow-2xl bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">Illustration not available</p>
                    </div>
                )}
            </div>

            {/* Book Pages */}
            <div className="space-y-10">
                {book.pages.sort((a, b) => a.page_number - b.page_number).map((page, index) => (
                    <div key={index} className="grid md:grid-cols-2 gap-6 items-center p-4 border-b-2 border-dashed border-gray-200 last:border-b-0">
                        <div className={`md:order-${index % 2 === 0 ? '1' : '2'}`}>
                            {page.imageUrl ? (
                                <img
                                    src={`data:image/png;base64,${page.imageUrl}`}
                                    alt={`Illustration for page ${page.page_number}`}
                                    className="rounded-lg shadow-xl w-full"
                                />
                             ) : (
                                <div className="w-full h-80 rounded-lg shadow-xl bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-500">Illustration not available</p>
                                </div>
                            )}
                        </div>
                        <div className={`md:order-${index % 2 === 0 ? '2' : '1'} p-4 flex flex-col justify-between h-full`}>
                            <p className="text-gray-700 text-lg leading-relaxed flex-grow">{page.text}</p>
                            <div className="flex justify-between items-center mt-4">
                                <button 
                                    onClick={() => handleReadAloud(page.text, page.page_number)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-brand-primary bg-brand-light rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                                    aria-label={`Read page ${page.page_number} aloud`}
                                >
                                    <ReadAloudIcon />
                                    <span>{speakingPage === page.page_number ? 'Stop' : 'Read Aloud'}</span>
                                </button>
                                <span className="font-bold text-gray-400">- {page.page_number} -</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={onCreateNew}
                    className="bg-brand-primary hover:bg-blue-700 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform"
                >
                    {isSharedView ? 'Create Your Own Story' : 'Create Another Story'}
                </button>
                {!isSharedView && (
                     <div className="relative">
                        <button 
                            onClick={handleShare}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <ShareIcon />
                            Share Book
                        </button>
                        {isLinkCopied && (
                            <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm rounded py-1 px-3 animate-fade-in">
                                Link copied to clipboard!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookDisplay;
