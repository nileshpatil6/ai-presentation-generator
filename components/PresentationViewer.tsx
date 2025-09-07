import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Presentation, Template } from '../types';
import Slide from './Slide';
import { ArrowLeftIcon, ArrowRightIcon, RestartIcon, SlideshowIcon } from './icons/Icons';
import SpeechControls from './SpeechControls';
import { ProgressBar } from './DesignElements';

interface PresentationViewerProps {
  presentation: Presentation;
  template: Template;
  onStartOver: () => void;
  isStreaming?: boolean;
}

const slideVariants: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? '50%' : '-50%',
    scale: 0.9,
  }),
  visible: {
    opacity: 1,
    x: '0%',
    scale: 1,
    transition: { type: 'spring', stiffness: 40, damping: 15 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? '50%' : '-50%',
    scale: 0.9,
    transition: { type: 'spring', stiffness: 40, damping: 15 },
  }),
};

const PresentationViewer: React.FC<PresentationViewerProps> = ({
  presentation,
  template,
  onStartOver,
  isStreaming = false,
}) => {
  const { slides } = presentation;
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [direction, setDirection] = useState(1);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [shouldPlayAudio, setShouldPlayAudio] = useState(false);

  // Auto-advance to new slides when streaming
  useEffect(() => {
    if (!isStreaming) return;
    if (slides.length === 0) return; // nothing to advance to yet
    // Auto-advance only when a brand new slide was appended (not on initial placeholder scenario)
    const latestSlideIndex = slides.length - 1;
    if (latestSlideIndex > currentSlide) {
      setDirection(1);
      setCurrentSlide(latestSlideIndex);
    }
  }, [slides.length, isStreaming, currentSlide]);

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      setIsAutoplay(false); // Turn off autoplay at the end
    }
  };

  const goToPrevSlide = () => {
    setDirection(-1);
    setCurrentSlide(Math.max(currentSlide - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextSlide();
      else if (e.key === 'ArrowLeft') goToPrevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, slides.length]);
  
  // Effect to trigger audio playback when slide changes in autoplay mode
  useEffect(() => {
    if (isAutoplay) {
      setShouldPlayAudio(true);
    }
  }, [currentSlide, isAutoplay]);

  const toggleAutoplay = () => {
    const newAutoplayState = !isAutoplay;
    setIsAutoplay(newAutoplayState);
    if (newAutoplayState) {
      setShouldPlayAudio(true); // Start playing immediately
    }
  };

  const handleNarrationEnd = () => {
    if (isAutoplay) {
      goToNextSlide();
    }
  };

  return (
    <div className="w-full h-screen max-w-6xl mx-auto flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h1 className={`text-xl md:text-2xl font-bold ${template.style.headingColor} mb-2`}>
            {presentation.main_title}
          </h1>
          <ProgressBar 
            progress={((currentSlide + 1) / slides.length) * 100}
            color={`bg-gradient-to-r ${template.style.accentColor.replace('text-', 'from-')} to-purple-600`}
            className="w-48"
          />
        </div>
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <RestartIcon />
          Start Over
        </button>
      </header>
      
      <div className="flex-grow flex items-center justify-center relative">
        <div className="w-full aspect-video rounded-lg shadow-2xl overflow-hidden relative">
           <AnimatePresence initial={false} custom={direction}>
             <motion.div
               key={currentSlide}
               custom={direction}
               variants={slideVariants}
               initial="hidden"
               animate="visible"
               exit="exit"
               className="absolute w-full h-full"
             >
              <Slide slide={slides[currentSlide]} template={template} />
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
      
      <footer className="flex items-center justify-between mt-6">
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="p-4 rounded-full bg-white shadow-depth disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          <ArrowLeftIcon />
        </button>

        <div className="flex items-center gap-6">
            <button
              onClick={toggleAutoplay}
              className={`p-3 rounded-full transition-all duration-200 shadow-depth hover:scale-105 ${isAutoplay ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-glow' : 'bg-white text-gray-700 hover:shadow-glow'}`}
              aria-label={isAutoplay ? "Disable Autoplay" : "Enable Autoplay"}
            >
              <SlideshowIcon className="h-6 w-6" />
            </button>
            <SpeechControls 
              text={slides[currentSlide]?.speaker_notes || ''} 
              onNarrationEnd={handleNarrationEnd}
              startPlaying={shouldPlayAudio}
              onPlaybackChange={() => setShouldPlayAudio(false)}
            />
            <div className="bg-white rounded-full px-4 py-2 shadow-depth">
              <span className="text-lg font-medium text-gray-700">
                {currentSlide + 1} / {slides.length}
                {isStreaming && (
                  <span className="ml-2 text-sm text-blue-600 animate-pulse">
                    (generating...)
                  </span>
                )}
              </span>
            </div>
        </div>

        <button
          onClick={goToNextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-4 rounded-full bg-white shadow-depth disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          <ArrowRightIcon />
        </button>
      </footer>
    </div>
  );
};

export default PresentationViewer;