
import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { Plan, Book } from '../types';
import { FREE_CHARACTERS_POOL, CHARACTERS, FREE_STORYLINES_POOL, STORYLINES } from '../constants';
import { generateStory, generateImage, editImage } from '../services/geminiService';
import Spinner from './Spinner';
import BookDisplay from './BookDisplay';

interface StoryCreatorProps {
  plan: Plan;
  generatedBook: Book | null;
  setGeneratedBook: (book: Book | null) => void;
  onCreateNew: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // remove the "data:mime/type;base64," prefix
    };
    reader.onerror = (error) => reject(error);
  });

function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ plan, generatedBook, setGeneratedBook, onCreateNew }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ message: '', percentage: 0 });

  // Form state
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [selectedStoryline, setSelectedStoryline] = useState<string>('');
  const [customMoral, setCustomMoral] = useState('');
  const [characterNames, setCharacterNames] = useState('');
  const [placeNames, setPlaceNames] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standard Plan Custom Content State
  const [customCharInput, setCustomCharInput] = useState('');
  const [customChars, setCustomChars] = useState<string[]>([]);
  const [customStorylineInput, setCustomStorylineInput] = useState('');
  const [customStorylines, setCustomStorylines] = useState<string[]>([]);

  const customCharactersCount = useMemo(() => characterNames ? characterNames.split(',').filter(name => name.trim() !== '').length : 0, [characterNames]);
  const totalCharacters = useMemo(() => selectedChars.length + customCharactersCount, [selectedChars, customCharactersCount]);

  const availableChars = useMemo(() => {
    if (plan.name === 'Free') {
        const week = getWeekOfYear(new Date());
        const pool = FREE_CHARACTERS_POOL;
        const startIndex = (week % (pool.length - 4 || 1));
        return pool.slice(startIndex, startIndex + 5);
    }
    return CHARACTERS[plan.name as 'Standard' | 'Premium'] || [];
  }, [plan.name]);

  const availableStorylines = useMemo(() => {
    if (plan.name === 'Free') {
        const week = getWeekOfYear(new Date());
        const pool = FREE_STORYLINES_POOL;
        const startIndex = (week % (pool.length - 4 || 1));
        return pool.slice(startIndex, startIndex + 5);
    }
    return STORYLINES[plan.name as 'Standard' | 'Premium'] || [];
  }, [plan.name]);
  
  const handleCharToggle = (char: string) => {
      if (plan.name === 'Premium') {
        setSelectedChars(prev => {
            if (prev.includes(char)) {
                return prev.filter(c => c !== char); // Always allow removal
            }
            if (prev.length + customCharactersCount < 3) {
                return [...prev, char]; // Add if under limit
            }
            return prev; // Do nothing if at limit
        });
      } else if (plan.name === 'Free') {
          setSelectedChars(prev => prev.includes(char) ? [] : [char]);
      } else {
          setSelectedChars(prev => 
            prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]
          );
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setUploadedImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleAddCustomChar = () => {
    if (customCharInput && customChars.length < 5 && !customChars.includes(customCharInput)) {
        setCustomChars([...customChars, customCharInput]);
        setCustomCharInput('');
    }
  };

  const handleAddCustomStoryline = () => {
    if (customStorylineInput && customStorylines.length < 5 && !customStorylines.includes(customStorylineInput)) {
        setCustomStorylines([...customStorylines, customStorylineInput]);
        setCustomStorylineInput('');
    }
  };

  const constructPrompt = (): string => {
    let pageCount = 4;
    if (plan.name === 'Standard') pageCount = 6;
    if (plan.name === 'Premium') pageCount = 8;
    
    let prompt = `Create a short children's story for a 5-year-old with ${pageCount} pages.`;
    if (selectedChars.length > 0) prompt += ` The main character(s) are: ${selectedChars.join(', ')}.`;
    if (characterNames) prompt += ` Their names are ${characterNames}.`;
    if (selectedStoryline) prompt += ` The story is about: ${selectedStoryline}.`;
    if (placeNames) prompt += ` The story takes place in ${placeNames}.`;
    if (customMoral) prompt += ` The story should be based on this central idea, theme, or moral: ${customMoral}.`;
    prompt += ` Keep the tone light, fun, and positive.`
    return prompt;
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress({ message: 'Crafting your unique story...', percentage: 5 });

    try {
        const storyPrompt = constructPrompt();
        let storyData = await generateStory(storyPrompt);
        
        // After story is generated, we know the number of pages.
        // Total steps: 1 (story) + 1 (cover) + N (pages)
        const totalSteps = 2 + storyData.pages.length;
        let completedSteps = 1; // Story is done

        setProgress({ 
            message: `Generating cover art for "${storyData.title}"...`, 
            percentage: (completedSteps / totalSteps) * 100 
        });
        
        const coverImagePrompt = storyData.cover_illustration_prompt;
        
        if (plan.name === 'Premium' && uploadedImage) {
            const base64Image = await fileToBase64(uploadedImage);
            const editPrompt = `Use the uploaded image ONLY as a reference for the main character's appearance and style. Recreate the character from the image in a whimsical, friendly children's book illustration style. Then, place this character into the scene described in the following prompt, ignoring any background or other elements from the original uploaded image: "${coverImagePrompt}"`;
            storyData.coverImageUrl = await editImage(base64Image, uploadedImage.type, editPrompt);
        } else {
            storyData.coverImageUrl = await generateImage(coverImagePrompt);
        }
        completedSteps++;

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        for (let i = 0; i < storyData.pages.length; i++) {
            // Add a delay to prevent hitting API rate limits
            await delay(2000); // 2 second delay between image generations

            setProgress({ 
                message: `Illustrating page ${i + 1} of ${storyData.pages.length}...`,
                percentage: (completedSteps / totalSteps) * 100
            });
            const page = storyData.pages[i];
            const consistentPrompt = `Create an illustration for this scene: "${page.illustration_prompt}". IMPORTANT: The visual style and character appearance MUST be consistent with the book's cover, which was based on the prompt: "${coverImagePrompt}". Keep the character's design (clothing, features, colors) the same.`;
            page.imageUrl = await generateImage(consistentPrompt);
            completedSteps++;
        }

        setProgress({ message: 'Finishing up...', percentage: 100 });
        setGeneratedBook(storyData);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChars, selectedStoryline, customMoral, characterNames, placeNames, uploadedImage, plan.name, setGeneratedBook]);

  const isSubmitDisabled = !selectedStoryline || totalCharacters === 0 || (plan.name === 'Premium' && totalCharacters > 3);

  if (generatedBook) {
      return <BookDisplay book={generatedBook} onCreateNew={onCreateNew} />;
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <Spinner message={progress.message} percentage={progress.percentage} />
        </div>
      )}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Create Your Story</h1>
        <p className="text-gray-600 mb-6">You are on the <span className="font-semibold text-brand-primary">{plan.name}</span> plan. Let's make some magic!</p>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
              {/* Character Selection */}
              <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-gray-700">1. Choose Your Character(s)</h3>
                    {plan.name === 'Premium' && (
                        <span className={`font-semibold px-3 py-1 text-sm rounded-full ${totalCharacters > 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {totalCharacters} / 3 selected
                        </span>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto flex flex-wrap gap-3 p-2 bg-gray-50 rounded-md border">
                      {availableChars.map(char => {
                          const isDisabled = plan.name === 'Premium' && !selectedChars.includes(char) && totalCharacters >= 3;
                          return (
                            <button 
                                type="button" 
                                key={char} 
                                onClick={() => handleCharToggle(char)} 
                                disabled={isDisabled}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedChars.includes(char) ? 'bg-brand-primary text-white scale-105 shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {char}
                            </button>
                          );
                      })}
                      {customChars.map(char => (
                          <button type="button" key={char} onClick={() => handleCharToggle(char)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 border-dashed border-brand-secondary ${selectedChars.includes(char) ? 'bg-brand-secondary text-white scale-105 shadow-md' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                              {char} ✨
                          </button>
                      ))}
                  </div>
              </div>

              {/* Storyline Selection */}
              <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">2. Pick a Storyline</h3>
                  <div className="max-h-48 overflow-y-auto flex flex-wrap gap-3 p-2 bg-gray-50 rounded-md border">
                      {availableStorylines.map(line => (
                          <button type="button" key={line} onClick={() => setSelectedStoryline(prev => prev === line ? '' : line)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all text-left ${selectedStoryline === line ? 'bg-brand-primary text-white scale-105 shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                              {line}
                          </button>
                      ))}
                      {customStorylines.map(line => (
                          <button type="button" key={line} onClick={() => setSelectedStoryline(line)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all text-left border-2 border-dashed border-brand-secondary ${selectedStoryline === line ? 'bg-brand-secondary text-white scale-105 shadow-md' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                              {line} ✨
                          </button>
                      ))}
                  </div>
              </div>

              {/* Standard Features */}
              {plan.name === 'Standard' && (
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-brand-primary border-dashed space-y-4">
                      <h3 className="text-xl font-bold text-brand-dark">Add Custom Ideas <span className="font-normal text-base text-gray-600">(up to 5 each)</span></h3>
                      <div className="flex gap-2">
                          <input type="text" value={customCharInput} onChange={e => setCustomCharInput(e.target.value)} placeholder="Add a custom character..." className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" disabled={customChars.length >= 5} />
                          <button type="button" onClick={handleAddCustomChar} disabled={customChars.length >= 5 || !customCharInput} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">Add</button>
                      </div>
                      <div className="flex gap-2">
                          <input type="text" value={customStorylineInput} onChange={e => setCustomStorylineInput(e.target.value)} placeholder="Add a custom storyline..." className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" disabled={customStorylines.length >= 5}/>
                          <button type="button" onClick={handleAddCustomStoryline} disabled={customStorylines.length >= 5 || !customStorylineInput} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">Add</button>
                      </div>
                  </div>
              )}

              {/* Premium Features */}
              {plan.name === 'Premium' && (
                  <div className="bg-brand-light p-6 rounded-lg border-2 border-brand-primary border-dashed space-y-4">
                      <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                          Premium Customization
                      </h3>
                      <div>
                          <label htmlFor="story-idea" className="block text-sm font-medium text-gray-700 mb-1">Collaborate with the AI on your story</label>
                           <textarea
                                id="story-idea"
                                value={customMoral}
                                onChange={e => setCustomMoral(e.target.value)}
                                placeholder="Tell the AI about your story idea! You can include a specific plot (e.g., 'a bear loses its favorite hat and goes on an adventure to find it'), a theme ('learning to share toys'), or a moral ('it's okay to be different')."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary min-h-[80px]"
                                rows={3}
                           />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="char-names" className="block text-sm font-medium text-gray-700 mb-1">Character Names (comma-separated)</label>
                              <input type="text" id="char-names" value={characterNames} onChange={e => setCharacterNames(e.target.value)} placeholder="e.g., Barnaby the Bear, Pip" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
                          </div>
                          <div>
                              <label htmlFor="place-names" className="block text-sm font-medium text-gray-700 mb-1">Place Names</label>
                              <input type="text" id="place-names" value={placeNames} onChange={e => setPlaceNames(e.target.value)} placeholder="e.g., The Whispering Woods" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
                          </div>
                      </div>
                      <div>
                          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload a character image (for reference)</label>
                          {!uploadedImagePreview ? (
                              <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-blue-700" />
                          ) : (
                              <div className="mt-2 flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <img src={uploadedImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md shadow-sm"/>
                                  <div className="flex-grow">
                                      <p className="font-semibold text-green-800">Image selected!</p>
                                      <p className="text-sm text-gray-600 truncate max-w-xs">{uploadedImage?.name}</p>
                                  </div>
                                  <button 
                                      type="button" 
                                      onClick={handleRemoveImage}
                                      className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                                      aria-label="Remove uploaded image"
                                  >
                                      Remove
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>

          <div className="mt-8 text-center">
              <button type="submit" className="bg-brand-secondary hover:bg-orange-500 text-white font-bold py-4 px-10 text-xl rounded-full shadow-lg transform hover:scale-105 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled}>
                  Create My Story!
              </button>
              {plan.name === 'Premium' && totalCharacters > 3 && (
                <p className="text-red-600 font-semibold mt-3">You can have a maximum of 3 characters. Please remove some.</p>
              )}
          </div>
        </form>
      </div>
    </>
  );
};

export default StoryCreator;
