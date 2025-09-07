import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Presentation, Template } from '../types';
import Slide from './Slide';
import { ArrowLeftIcon, ArrowRightIcon, RestartIcon, SlideshowIcon } from './icons/Icons';
import SpeechControls from './SpeechControls';

interface PresentationViewerProps {
  presentation: Presentation;
  template: Template;
  onStartOver: () => void;
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
}) => {
  const { slides } = presentation;
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [direction, setDirection] = useState(1);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [shouldPlayAudio, setShouldPlayAudio] = useState(false);

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
        <h1 className={`text-xl md:text-2xl font-bold ${template.style.headingColor}`}>
          {presentation.main_title}
        </h1>
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
      
      <footer className="flex items-center justify-between mt-4">
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <ArrowLeftIcon />
        </button>

        <div className="flex items-center gap-4">
            <button
              onClick={toggleAutoplay}
              className={`p-2 rounded-full transition ${isAutoplay ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
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
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {currentSlide + 1} / {slides.length}
            </span>
        </div>

        <button
          onClick={goToNextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <ArrowRightIcon />
        </button>
      </footer>
    </div>
  );
};

export default PresentationViewer;