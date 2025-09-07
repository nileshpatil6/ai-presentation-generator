import React, { useState, useCallback, useEffect } from 'react';
import { Presentation, PreloadState } from './types';
import { TEMPLATES } from './constants';
import { generateSlides, fetchImageFromInternet, getTextToSpeechAudio } from './services/geminiService';
import TemplateSelector from './components/TemplateSelector';
import PresentationViewer from './components/PresentationViewer';
import Preloader from './components/Preloader';
import { LoadingIcon, SparklesIcon } from './components/icons/Icons';
import { imageCache, audioCache } from './utils/cache';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  
  const [preloadState, setPreloadState] = useState<PreloadState>({ status: 'idle' });

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your presentation.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPresentation(null);
    setPreloadState({ status: 'idle' });
    imageCache.clear();
    audioCache.clear();

    try {
      const result = await generateSlides(topic);
      setPresentation(result);
      setPreloadState({ status: 'loading', images: { loaded: 0, total: 0 }, audio: { loaded: 0, total: 0 } });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Failed to generate presentation: ${err.message}`
          : 'An unknown error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    if (presentation && preloadState.status === 'loading') {
      const preloadAssets = async () => {
        const { slides } = presentation;
        
        const imagePrompts = slides
            .map(s => s.image_prompt)
            .filter((p): p is string => typeof p === 'string' && p.trim() !== '' && p.trim().toLowerCase() !== 'null');
        const uniqueImagePrompts = [...new Set(imagePrompts)];
        
        const speakerNotes = slides.map(s => s.speaker_notes).filter((n): n is string => !!n);

        setPreloadState(prev => ({
          ...prev,
          status: 'loading',
          images: { loaded: 0, total: uniqueImagePrompts.length },
          audio: { loaded: 0, total: speakerNotes.length }
        }));
        
        // Fetch images in parallel
        const imagePromises = uniqueImagePrompts.map(prompt => 
          fetchImageFromInternet(prompt)
            .then(url => {
              imageCache.set(prompt, url);
              setPreloadState(prev => {
                if (prev.status !== 'loading') return prev;
                return {
                  ...prev,
                  images: {
                    total: prev.images?.total ?? 0,
                    loaded: (prev.images?.loaded ?? 0) + 1,
                  },
                };
              });
            })
            .catch(e => console.error(`Failed to load image for prompt: ${prompt}`, e))
        );
        
        await Promise.all(imagePromises);
        
        // Fetch audio sequentially to avoid rate limiting
        for (const note of speakerNotes) {
            try {
                const blob = await getTextToSpeechAudio(note);
                audioCache.set(note, blob);
                setPreloadState(prev => {
                    if (prev.status !== 'loading') return prev;
                    return {
                        ...prev,
                        audio: {
                            total: prev.audio?.total ?? 0,
                            loaded: (prev.audio?.loaded ?? 0) + 1,
                        },
                    };
                });
            } catch (e) {
                console.error(`Failed to generate audio for note: "${note.substring(0, 30)}..."`, e)
            }
        }

        setPreloadState({ status: 'complete' });
      };

      preloadAssets();
    }
  }, [presentation, preloadState.status]);

  const handleStartOver = () => {
    setPresentation(null);
    setTopic('');
    setError(null);
    setPreloadState({ status: 'idle' });
    imageCache.clear();
    audioCache.clear();
  };
  
  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
  
  const renderContent = () => {
    if (preloadState.status === 'loading') {
        return <Preloader state={preloadState} />;
    }
    
    if (presentation && preloadState.status === 'complete') {
        return (
            <PresentationViewer
              presentation={presentation}
              template={selectedTemplate}
              onStartOver={handleStartOver}
            />
        );
    }

    // Initial form state
    return (
        <div className="w-full max-w-3xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
              <SparklesIcon /> AI Study Presentation Generator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Create comprehensive study presentations with 20-40 slides, including examples, case studies, key facts, and interactive learning elements.
            </p>
          </header>

          <main className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <label htmlFor="topic" className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                1. What topic would you like to study? (Be specific for best results)
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Machine Learning Algorithms for Beginners, Advanced React Design Patterns, Climate Change and Its Global Impact, or Quantum Computing Fundamentals"
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition resize-none"
                disabled={isLoading}
              />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                💡 <strong>Tip:</strong> The AI will create 20-40 comprehensive slides with examples, case studies, and interactive elements perfect for learning!
              </div>
            </div>

            <div className="mb-8">
               <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                2. Select a Theme
              </h2>
              <TemplateSelector
                templates={TEMPLATES}
                selectedTemplateId={selectedTemplateId}
                onSelect={setSelectedTemplateId}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 text-xl"
            >
              {isLoading ? (
                <>
                  <LoadingIcon />
                  Generating Slides...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Generate Presentation
                </>
              )}
            </button>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col items-center justify-center p-4">
      {renderContent()}
    </div>
  );
};

export default App;