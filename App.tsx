import React, { useState, useCallback, useEffect } from 'react';
import { Presentation, PreloadState, StreamingState, PartialPresentation, Slide } from './types';
import { TEMPLATES } from './constants';
import { generateSlides, generateSlidesStream, fetchImageFromInternet, getTextToSpeechAudio } from './services/geminiService';
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
  const [partialPresentation, setPartialPresentation] = useState<PartialPresentation | null>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>({ status: 'idle' });
  
  const [preloadState, setPreloadState] = useState<PreloadState>({ status: 'idle' });

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your presentation.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPresentation(null);
    setPartialPresentation(null);
    setPreloadState({ status: 'idle' });
    setStreamingState({ status: 'generating', currentSlide: 0 });
    imageCache.clear();
    audioCache.clear();

    try {
      let slideCount = 0;
      
      // Handle slide completion callback for real-time image and audio preloading
      const handleSlideComplete = async (slide: Slide, slideIndex: number) => {
        slideCount = slideIndex + 1;
        setStreamingState({ status: 'generating', currentSlide: slideCount });
        
        // Start preloading image and audio for this slide immediately
        if (slide.image_prompt && slide.image_prompt.trim() !== '' && slide.image_prompt.toLowerCase() !== 'null') {
          fetchImageFromInternet(slide.image_prompt)
            .then(url => imageCache.set(slide.image_prompt!, url))
            .catch(e => console.error(`Failed to preload image for slide ${slideIndex}:`, e));
        }
        
        if (slide.speaker_notes) {
          getTextToSpeechAudio(slide.speaker_notes)
            .then(blob => audioCache.set(slide.speaker_notes!, blob))
            .catch(e => console.error(`Failed to preload audio for slide ${slideIndex}:`, e));
        }
      };
      
      // Use streaming to generate and display slides as they complete
      for await (const partialPres of generateSlidesStream(topic, handleSlideComplete)) {
        setPartialPresentation(partialPres);
        
        if (partialPres.isComplete && partialPres.main_title) {
          // Convert to full presentation when complete
          const finalPresentation: Presentation = {
            main_title: partialPres.main_title,
            slides: partialPres.slides
          };
          
          setPresentation(finalPresentation);
          setStreamingState({ status: 'complete' });
          setPreloadState({ status: 'loading', images: { loaded: 0, total: 0 }, audio: { loaded: 0, total: 0 } });
          break;
        }
      }
    } catch (err) {
      console.error(err);
      
      // If we have partial content, use it instead of erroring out
      if (partialPresentation && partialPresentation.slides.length > 0) {
        console.warn('Stream failed but using partial presentation with', partialPresentation.slides.length, 'slides');
        const finalPresentation: Presentation = {
          main_title: partialPresentation.main_title || 'Presentation (Partial)',
          slides: partialPresentation.slides
        };
        setPresentation(finalPresentation);
        setStreamingState({ status: 'complete' });
        setPreloadState({ status: 'loading', images: { loaded: 0, total: 0 }, audio: { loaded: 0, total: 0 } });
      } else {
        setError(
          err instanceof Error
            ? `Failed to generate presentation: ${err.message}`
            : 'An unknown error occurred.'
        );
        setStreamingState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      }
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
        const imagePromises = uniqueImagePrompts.map((prompt: string) => 
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
    setPartialPresentation(null);
    setTopic('');
    setError(null);
    setPreloadState({ status: 'idle' });
    setStreamingState({ status: 'idle' });
    imageCache.clear();
    audioCache.clear();
  };
  
  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
  
  const renderContent = () => {
    // Show streaming presentation viewer as soon as we have any partial data (even 0 slides after title)
    if (partialPresentation) {
      const tempPresentation: Presentation = {
        main_title: partialPresentation.main_title || 'Generating...',
        // Ensure at least one placeholder slide exists so viewer layout renders
        slides: partialPresentation.slides.length > 0 ? partialPresentation.slides : [{
          title: 'Preparing first slide...',
          content: 'AI is assembling your first slide content. This will appear momentarily.',
          layout: 'title_content',
          image_prompt: '',
          speaker_notes: 'The system is generating detailed speaker notes. They will display once ready.'
        }]
      } as Presentation;

      return (
        <div className="w-full">
          <div className="text-center mb-4">
            {!partialPresentation.isComplete && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <LoadingIcon />
                <span>
                  {partialPresentation.slides.length === 0
                    ? 'Initializing stream...'
                    : `Live generating: ${partialPresentation.slides.length} slide${partialPresentation.slides.length>1?'s':''}`}
                </span>
              </div>
            )}
          </div>
          <PresentationViewer
            presentation={tempPresentation}
            template={selectedTemplate}
            onStartOver={handleStartOver}
            isStreaming={!partialPresentation.isComplete}
          />
        </div>
      );
    }
    
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