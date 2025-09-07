import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Slide as SlideType, Template } from '../types';
import { SpinnerIcon } from './icons/Icons';
import { imageCache } from '../utils/cache';
import { FloatingShapes, DecorativeLine, TitleAccent, ModernCard, GradientMesh, ModernIcon } from './DesignElements';

// Starfield Particle Component for 'Galactic Midnight' theme
const Particles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: { x: number; y: number; radius: number; vx: number; vy: number }[];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            particles = [];
            for (let i = 0; i < 100; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5,
                    vx: Math.random() * 0.2 - 0.1,
                    vy: Math.random() * 0.2 - 0.1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
                if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        resize();
        animate();

        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-50 z-0" />;
};


const AnimatedText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const characters = Array.from(text);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.015, delayChildren: 0.1 },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(5px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { 
        type: 'spring', 
        damping: 15, 
        stiffness: 300,
        filter: { type: 'tween', duration: 0.3 }
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      aria-label={text}
      style={{ display: 'flex', flexWrap: 'wrap' }} // Use flexbox for word wrapping
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={charVariants}
          style={{ whiteSpace: 'pre' }} // Preserve spaces
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};


const ContentRenderer: React.FC<{ content: string, className: string }> = ({ content, className }) => {
  const renderWithInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return null;
    
    // Handle bold (**text**), italic (*text*), and inline code (`code`)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.filter(part => part).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.substring(2, part.length - 2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={index} className="italic">{part.substring(1, part.length - 1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">{part.substring(1, part.length - 1)}</code>;
      }
      return part;
    });
  };

  const elements = content.split('\n').map((line, i) => {
    const trimmedLine = line.trim();
    
    // Handle headers (# ## ###)
    if (trimmedLine.startsWith('### ')) {
      return <h3 key={i} className="text-sm md:text-base font-bold mb-1 mt-2 break-words">{renderWithInlineFormatting(trimmedLine.substring(4))}</h3>;
    }
    if (trimmedLine.startsWith('## ')) {
      return <h2 key={i} className="text-base md:text-lg font-bold mb-2 mt-3 break-words">{renderWithInlineFormatting(trimmedLine.substring(3))}</h2>;
    }
    if (trimmedLine.startsWith('# ')) {
      return <h1 key={i} className="text-lg md:text-xl font-bold mb-2 mt-3 break-words">{renderWithInlineFormatting(trimmedLine.substring(2))}</h1>;
    }
    
    // Handle numbered lists (1. 2. 3.)
    if (/^\d+\.\s/.test(trimmedLine)) {
      const content = trimmedLine.replace(/^\d+\.\s/, '');
      return <li key={i} className="mb-1 leading-snug break-words" data-list-type="ordered">{renderWithInlineFormatting(content)}</li>;
    }
    
    // Handle bullet lists (- * +)
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('+ ')) {
      const content = trimmedLine.substring(2);
      return <li key={i} className="mb-1 leading-snug break-words" data-list-type="unordered">{renderWithInlineFormatting(content)}</li>;
    }
    
    // Handle blockquotes (>)
    if (trimmedLine.startsWith('> ')) {
      return <blockquote key={i} className="border-l-3 border-gray-400 pl-3 italic mb-2 text-gray-600 dark:text-gray-400 break-words text-sm">{renderWithInlineFormatting(trimmedLine.substring(2))}</blockquote>;
    }
    
    // Handle horizontal rules (---)
    if (trimmedLine === '---' || trimmedLine === '***') {
      return <hr key={i} className="my-2 border-gray-300 dark:border-gray-600" />;
    }
    
    // Handle empty lines
    if (trimmedLine === '') {
      return null;
    }
    
    // Regular paragraphs
    return <p key={i} className="mb-2 leading-snug break-words">{renderWithInlineFormatting(line)}</p>;
  }).filter(Boolean);

  const groupedElements: React.ReactNode[] = [];
  let currentOrderedItems: React.ReactElement[] = [];
  let currentUnorderedItems: React.ReactElement[] = [];

  elements.forEach((element) => {
    if (React.isValidElement(element) && element.type === 'li') {
      const listType = element.props['data-list-type'];
      
      if (listType === 'ordered') {
        // Close any open unordered list
        if (currentUnorderedItems.length > 0) {
          groupedElements.push(<ul key={`ul-${groupedElements.length}`} className="list-disc list-inside pl-3 space-y-1 mb-2 break-words">{currentUnorderedItems}</ul>);
          currentUnorderedItems = [];
        }
        currentOrderedItems.push(element);
      } else {
        // Close any open ordered list
        if (currentOrderedItems.length > 0) {
          groupedElements.push(<ol key={`ol-${groupedElements.length}`} className="list-decimal list-inside pl-3 space-y-1 mb-2 break-words">{currentOrderedItems}</ol>);
          currentOrderedItems = [];
        }
        currentUnorderedItems.push(element);
      }
    } else {
      // Close any open lists
      if (currentOrderedItems.length > 0) {
        groupedElements.push(<ol key={`ol-${groupedElements.length}`} className="list-decimal list-inside pl-3 space-y-1 mb-2 break-words">{currentOrderedItems}</ol>);
        currentOrderedItems = [];
      }
      if (currentUnorderedItems.length > 0) {
        groupedElements.push(<ul key={`ul-${groupedElements.length}`} className="list-disc list-inside pl-3 space-y-1 mb-2 break-words">{currentUnorderedItems}</ul>);
        currentUnorderedItems = [];
      }
      groupedElements.push(element);
    }
  });

  // Close any remaining open lists
  if (currentOrderedItems.length > 0) {
    groupedElements.push(<ol key={`ol-${groupedElements.length}`} className="list-decimal list-inside pl-3 space-y-1 mb-2 break-words">{currentOrderedItems}</ol>);
  }
  if (currentUnorderedItems.length > 0) {
    groupedElements.push(<ul key={`ul-${groupedElements.length}`} className="list-disc list-inside pl-3 space-y-1 mb-2 break-words">{currentUnorderedItems}</ul>);
  }

  const lineVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: 'spring', stiffness: 100, damping: 15 },
    }),
  };

  return (
    <div className={`${className} overflow-hidden`}>
      <div className="max-h-full overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {groupedElements.map((el, i) => (
          <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={lineVariants}>
            {el}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const GeneratedImage: React.FC<{ prompt: string }> = ({ prompt }) => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [imageUrl, setImageUrl] = useState<string | null>(imageCache.get(prompt) || null);
    const [isLoading, setIsLoading] = useState(!imageUrl);
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchImageWithRetry = async (retries = 3) => {
        if (!prompt || imageUrl) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('https://fastapi-app-147317278405.us-central1.run.app/api/bulk_images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([prompt]),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const urls = data[prompt];

            if (urls && urls.length > 0) {
                const url = urls[0];
                imageCache.set(prompt, url);
                setImageUrl(url);
                setError(null);
            } else {
                throw new Error('No images returned');
            }
        } catch (err) {
            console.error('Image fetch error:', err);
            if (retries > 0) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    fetchImageWithRetry(retries - 1);
                }, 1000 * (4 - retries)); // Exponential backoff
            } else {
                setError('Failed to load image');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!imageUrl && prompt) {
            fetchImageWithRetry(3);
        }
    }, [prompt, retryCount]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = -1 * ((x - rect.width / 2) / rect.width) * 5;
        const rotateX = ((y - rect.height / 2) / rect.height) * 5;
        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    if (isLoading) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 p-4 text-center rounded-lg border border-blue-200 dark:border-blue-700">
                <SpinnerIcon className="w-8 h-8 mb-2" />
                <p className="text-sm">Loading image...</p>
                {retryCount > 0 && <p className="text-xs opacity-70">Retry {retryCount}/3</p>}
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 p-4 text-center rounded-lg border border-gray-300 dark:border-gray-600">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm font-medium mb-1">Visual Content</p>
                <p className="text-xs opacity-70">Image placeholder for: {prompt.slice(0, 40)}...</p>
                {retryCount < 3 && (
                    <button 
                        onClick={() => setRetryCount(prev => prev + 1)}
                        className="mt-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    return (
        <div 
            className="w-full h-full flex items-center justify-center p-2"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: '1000px' }}
        >
             <motion.div 
                className="bg-white dark:bg-slate-100 p-2 pb-6 rounded-lg shadow-xl w-full h-full max-w-full max-h-full"
                initial={{ rotate: 5, scale: 0.95, opacity: 0 }}
                animate={{ rotate: 1, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                style={{ rotateX: rotate.x, rotateY: rotate.y, transformStyle: "preserve-3d" }}
              >
                <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded">
                    <img 
                        src={imageUrl} 
                        alt={prompt} 
                        className="w-full h-full object-cover"
                        onError={() => setError('Failed to load image')}
                    />
                </div>
            </motion.div>
        </div>
    );
};


const NoImagePlaceholder: React.FC = () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 p-4 text-center rounded-lg border border-gray-300 dark:border-gray-600">
        <div className="text-6xl mb-3">🖼️</div>
        <p className="text-sm font-medium">Visual Content</p>
        <p className="text-xs opacity-70 mt-1">No image specified for this slide</p>
    </div>
);


interface SlideProps {
  slide: SlideType;
  template: Template;
}

const Slide: React.FC<SlideProps> = ({ slide, template }) => {
  const { style, id } = template;
  const { title, content, layout, image_prompt, subtitle, keyPoints, examples, statistics } = slide;

  const baseClasses = `w-full h-full flex p-8 md:p-12 ${style.backgroundClasses} ${style.fontFamily} relative overflow-hidden`;
  const titleClasses = `font-bold ${style.headingColor} text-readable-strong`;
  const contentClasses = `prose dark:prose-invert max-w-none ${style.textColor} text-readable`;
  const accentBg = style.accentColor.replace('text-','bg-');
  const secondaryAccentBg = style.secondaryAccentColor?.replace('text-', 'bg-');


  const renderLayout = () => {
    switch (layout) {
      case 'title_only':
        return (
          <div className="flex flex-col justify-center items-center text-center w-full z-10 relative">
            <FloatingShapes templateId={id} />
            <GradientMesh variant="mesh" />
            
            {/* Modern geometric accents */}
            <motion.div 
                className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${style.accentColor.replace('text-', '')} opacity-20 shape-blob`}
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 0.2, scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 1.5, ease: 'easeOut' }}
            />
            <motion.div 
                className={`absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr ${style.accentColor.replace('text-', '')} opacity-15 shape-circle`}
                initial={{ opacity: 0, scale: 0.3, rotate: 45 }}
                animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 1.2, ease: 'easeOut' }}
            />
            
            <div className="relative z-10">
              <div className="relative">
                <AnimatedText text={title} className={`${titleClasses} text-4xl md:text-6xl lg:text-7xl font-black tracking-tight break-words text-center relative`} />
                <TitleAccent color={accentBg} side="left" />
              </div>
              
              <DecorativeLine 
                color={`bg-gradient-to-r ${style.accentColor.replace('text-', 'from-')} to-purple-600`}
                className="w-32 mx-auto my-8"
              />
              
              {content && (
                <ModernCard className="max-w-4xl mx-auto p-6 mt-8" variant="glass">
                  <AnimatedText text={content} className={`${contentClasses} text-xl md:text-2xl opacity-90`} />
                </ModernCard>
              )}
            </div>
          </div>
        );
      case 'title_content':
        return (
          <div className="flex flex-col justify-center items-start w-full z-10 max-w-7xl mx-auto relative">
            <GradientMesh variant="aurora" />
            
            {/* Subtle decorative shapes */}
            <motion.div 
                className={`absolute top-0 right-0 w-24 h-24 ${accentBg} opacity-10 shape-organic`}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
            />
            
            <div className="w-full mb-10 relative z-10">
              <div className="relative">
                <AnimatedText text={title} className={`${titleClasses} text-3xl md:text-4xl lg:text-5xl font-extrabold break-words`} />
                <TitleAccent color={accentBg} side="left" />
              </div>
              <DecorativeLine 
                color={`bg-gradient-to-r ${style.accentColor.replace('text-', 'from-')} via-purple-500 to-pink-500`}
                className="w-1/3 mt-4"
              />
            </div>
            
            <ModernCard className="w-full flex-1 min-h-0" variant="modern" glowColor="shadow-soft">
              <div className="p-6 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto max-h-[60vh]">
                  <ContentRenderer content={content} className={`${contentClasses} text-lg md:text-xl w-full`} />
                </div>
              </div>
            </ModernCard>
          </div>
        );
      case 'content_only':
         return (
          <div className="flex flex-col justify-center items-center w-full h-full z-10">
             <div className="bg-readable rounded-lg p-6 max-w-5xl max-h-[80vh] overflow-y-auto">
               <ContentRenderer content={content} className={`${contentClasses} text-xl md:text-2xl w-full text-center`} />
             </div>
          </div>
        );
      case 'image_left':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center w-full h-full z-10 max-w-7xl mx-auto">
                <div className="w-full h-64 md:h-80 lg:h-96 order-first">
                  {image_prompt ? <GeneratedImage prompt={image_prompt} /> : <NoImagePlaceholder />}
                </div>
                <div className="flex flex-col justify-center h-full min-h-0 px-2 md:px-4">
                    <div className="bg-readable rounded-lg p-4 md:p-6 flex flex-col h-full min-h-0">
                      <AnimatedText text={title} className={`${titleClasses} text-xl md:text-2xl lg:text-3xl font-bold mb-3 break-words`} />
                      {subtitle && <p className={`${contentClasses} text-sm md:text-base mb-3 opacity-80`}>{subtitle}</p>}
                      <div className="flex-1 overflow-y-auto max-h-[50vh]">
                          <ContentRenderer content={content} className={`${contentClasses} text-sm md:text-base leading-relaxed`} />
                      </div>
                    </div>
                </div>
            </div>
        );
      case 'image_right':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center w-full h-full z-10 max-w-7xl mx-auto">
                <div className="flex flex-col justify-center h-full min-h-0 px-2 md:px-4 order-last md:order-first">
                    <div className="bg-readable rounded-lg p-4 md:p-6 flex flex-col h-full min-h-0">
                      <AnimatedText text={title} className={`${titleClasses} text-xl md:text-2xl lg:text-3xl font-bold mb-3 break-words`} />
                      {subtitle && <p className={`${contentClasses} text-sm md:text-base mb-3 opacity-80`}>{subtitle}</p>}
                      <div className="flex-1 overflow-y-auto max-h-[50vh]">
                          <ContentRenderer content={content} className={`${contentClasses} text-sm md:text-base leading-relaxed`} />
                      </div>
                    </div>
                </div>
                <div className="w-full h-64 md:h-80 lg:h-96 order-first md:order-last">
                  {image_prompt ? <GeneratedImage prompt={image_prompt} /> : <NoImagePlaceholder />}
                </div>
            </div>
        );
       case 'quote':
        return (
          <div className="flex flex-col justify-center items-center text-center w-full relative z-10 max-w-6xl mx-auto h-full px-8">
             <motion.span 
               initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
               animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
               transition={{ delay: 0.2, type: 'spring', stiffness: 50 }}
               className={`absolute top-4 left-4 text-6xl md:text-8xl ${style.accentColor} font-serif select-none`}>"</motion.span>
             <div className="flex-1 flex flex-col justify-center">
               <div className="bg-readable rounded-lg p-6 md:p-8">
                 <AnimatedText text={content} className={`${contentClasses} text-2xl md:text-3xl lg:text-4xl font-serif italic max-w-4xl leading-relaxed break-words`} />
                 {title && <div className={`${style.textColor} text-lg md:text-xl mt-6 not-italic font-medium opacity-90`}><AnimatedText text={`- ${title}`} /></div>}
               </div>
             </div>
             <motion.span 
              initial={{ opacity: 0, scale: 0.2, rotate: 90 }}
              animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 50 }}
              className={`absolute bottom-4 right-4 text-6xl md:text-8xl ${style.accentColor} font-serif select-none`}>"</motion.span>
          </div>
        );
      case 'comparison':
        const comparisonParts = content.includes('|') ? content.split('|') : [content, keyPoints?.join('\n') || examples?.join('\n') || 'Alternative perspective or contrasting view'];
        const leftContent = comparisonParts[0]?.trim() || 'Primary perspective';
        const rightContent = comparisonParts[1]?.trim() || 'Alternative perspective';
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-4">
              <AnimatedText text={title} className={`${titleClasses} text-xl md:text-2xl lg:text-3xl font-bold text-center break-words`} />
              {subtitle && <p className={`${contentClasses} text-sm md:text-base text-center mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 max-h-[70vh]">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
                className={`p-3 md:p-4 rounded-xl bg-white border-2 border-green-300 overflow-hidden flex flex-col shadow-lg min-h-0`}
              >
                <h3 className={`text-green-800 text-readable-strong font-bold text-base mb-2`}>Pros / Benefits</h3>
                <div className="flex-1 overflow-y-auto max-h-[50vh]">
                  <ContentRenderer content={leftContent} className={`text-gray-900 text-readable max-w-none text-xs md:text-sm leading-relaxed`} />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.5 }}
                className={`p-3 md:p-4 rounded-xl bg-white border-2 border-red-300 overflow-hidden flex flex-col shadow-lg min-h-0`}
              >
                <h3 className={`text-red-800 text-readable-strong font-bold text-base mb-2`}>Cons / Challenges</h3>
                <div className="flex-1 overflow-y-auto max-h-[50vh]">
                  <ContentRenderer content={rightContent} className={`text-gray-900 text-readable max-w-none text-xs md:text-sm leading-relaxed`} />
                </div>
              </motion.div>
            </div>
          </div>
        );
      case 'timeline':
        const timelineItems = keyPoints || content.split('\n').filter(line => line.trim()) || ['Timeline item 1', 'Timeline item 2', 'Timeline item 3'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-8">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold text-center break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg text-center mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 relative overflow-auto">
              <div className={`absolute left-6 top-0 bottom-0 w-1 ${accentBg} rounded-full`}></div>
              <div className="space-y-6">
                {timelineItems.slice(0, 6).map((point, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative flex items-start pl-16"
                  >
                    <div className={`absolute left-2 w-8 h-8 ${accentBg} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <ContentRenderer content={typeof point === 'string' ? point : point.toString()} className={`text-gray-900 text-readable text-sm md:text-base leading-relaxed prose prose-sm max-w-none`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'process_steps':
        const processSteps = keyPoints || content.split('\n').filter(line => line.trim()) || ['Step 1', 'Step 2', 'Step 3'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-6">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold text-center break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg text-center mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {processSteps.slice(0, 6).map((step, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`p-4 md:p-6 rounded-xl bg-white border-2 border-blue-300 flex flex-col h-full shadow-lg`}
                  >
                    <div className={`w-8 h-8 ${accentBg} rounded-full flex items-center justify-center mb-3 flex-shrink-0`}>
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <ContentRenderer content={typeof step === 'string' ? step : step.toString()} className={`text-gray-900 text-readable prose prose-sm max-w-none text-xs md:text-sm leading-relaxed`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'key_facts':
        const facts = keyPoints || content.split('\n').filter(line => line.trim()) || ['Key fact 1', 'Key fact 2'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 text-center mb-6">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold break-words`} />
              {statistics && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-4xl md:text-6xl lg:text-7xl font-black ${style.accentColor} text-center my-4`}
                >
                  {statistics}
                </motion.div>
              )}
              {subtitle && <p className={`${contentClasses} text-base md:text-lg opacity-80 mb-4`}>{subtitle}</p>}
            </div>
            <div className="flex-1 overflow-auto">
              <div className="bg-readable rounded-lg p-4 mb-6">
                <ContentRenderer content={content} className={`text-gray-900 text-readable prose prose-lg max-w-none text-lg md:text-xl text-center leading-relaxed`} />
              </div>
              {facts && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
                  {facts.slice(0, 9).map((fact, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`p-3 md:p-4 rounded-lg bg-white border-2 border-amber-300 text-center h-full flex items-center justify-center shadow-lg`}
                    >
                      <span className={`text-gray-900 text-readable text-xs md:text-sm font-medium break-words`}>{fact}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'case_study':
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-4">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold text-center break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg text-center mt-2 opacity-80 italic`}>{subtitle}</p>}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-0">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 md:p-6 rounded-xl bg-white border-2 border-purple-300 overflow-hidden flex flex-col shadow-lg`}
              >
                <h3 className={`text-purple-800 text-readable-strong font-bold text-lg mb-3 flex-shrink-0`}>Overview</h3>
                <div className="flex-1 overflow-auto">
                  <ContentRenderer content={content} className={`text-gray-900 text-readable prose prose-sm max-w-none text-sm md:text-base leading-relaxed`} />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 overflow-auto"
              >
                {examples && examples.length > 0 && (
                  <div className={`p-3 md:p-4 rounded-lg bg-white border-2 border-teal-300 shadow-md`}>
                    <h4 className={`text-teal-800 text-readable-strong font-bold text-base mb-2`}>Key Examples</h4>
                    <ul className="space-y-1">
                      {examples.slice(0, 4).map((example, index) => (
                        <li key={index} className={`text-gray-900 text-readable text-xs md:text-sm break-words`}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {keyPoints && keyPoints.length > 0 && (
                  <div className={`p-3 md:p-4 rounded-lg bg-white border-2 border-rose-300 shadow-md`}>
                    <h4 className={`text-rose-800 text-readable-strong font-bold text-base mb-2`}>Key Takeaways</h4>
                    <ul className="space-y-1">
                      {keyPoints.slice(0, 5).map((point, index) => (
                        <li key={index} className={`text-gray-900 text-readable text-xs md:text-sm break-words`}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        );
      case 'examples':
        const exampleItems = examples || keyPoints || content.split('\n').filter(line => line.trim()) || ['Example 1', 'Example 2', 'Example 3'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-6 text-center">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 overflow-auto">
              {content && (
                <div className="bg-readable rounded-lg p-4 mb-6">
                  <ContentRenderer content={content} className={`text-gray-900 text-readable prose prose-lg max-w-none text-base md:text-lg leading-relaxed`} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exampleItems.slice(0, 6).map((example, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative overflow-hidden"
                  >
                    <ModernCard className="p-5 md:p-6 h-full flex flex-col" variant="glass" glowColor="shadow-depth">
                      <div className="flex items-center mb-4">
                        <ModernIcon 
                          icon="💡" 
                          color="bg-gradient-to-br from-indigo-500 to-purple-600" 
                          size="md"
                        />
                        <div className="ml-3 flex-1">
                          <h3 className="text-indigo-800 text-readable-strong font-bold text-sm">Example {index + 1}</h3>
                          <DecorativeLine color="bg-gradient-to-r from-indigo-400 to-purple-500" className="w-12 h-0.5 mt-1" />
                        </div>
                      </div>
                      
                      {/* Subtle shape accent */}
                      <div className={`absolute -top-2 -right-2 w-8 h-8 ${accentBg} opacity-10 shape-circle`} />
                      
                      <div className="flex-1 relative z-10">
                        <ContentRenderer content={typeof example === 'string' ? example : example.toString()} className={`text-gray-900 text-readable prose prose-sm max-w-none text-xs md:text-sm leading-relaxed`} />
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'use_cases':
        const useCaseItems = examples || keyPoints || content.split('\n').filter(line => line.trim()) || ['Use case 1', 'Use case 2', 'Use case 3'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-6 text-center">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 overflow-auto">
              {content && (
                <div className="bg-readable rounded-lg p-4 mb-6">
                  <ContentRenderer content={content} className={`text-gray-900 text-readable prose prose-lg max-w-none text-base md:text-lg leading-relaxed`} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {useCaseItems.slice(0, 6).map((useCase, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative overflow-hidden"
                  >
                    <ModernCard className="p-6 md:p-7 h-full" variant="modern" glowColor="shadow-depth">
                      <div className="flex items-center mb-5">
                        <ModernIcon 
                          icon="🎯" 
                          color="bg-gradient-to-br from-emerald-500 to-teal-600" 
                          size="lg"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="text-emerald-800 text-readable-strong font-bold text-base">Use Case {index + 1}</h3>
                          <DecorativeLine color="bg-gradient-to-r from-emerald-400 to-teal-500" className="w-16 h-0.5 mt-2" />
                        </div>
                      </div>
                      
                      {/* Modern geometric accent */}
                      <div className={`absolute -bottom-3 -right-3 w-12 h-12 ${accentBg} opacity-10 shape-blob`} />
                      
                      <div className="relative z-10">
                        <ContentRenderer content={typeof useCase === 'string' ? useCase : useCase.toString()} className={`text-gray-900 text-readable prose prose-sm max-w-none text-sm md:text-base leading-relaxed`} />
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'benefits':
        const benefitItems = keyPoints || examples || content.split('\n').filter(line => line.trim()) || ['Benefit 1', 'Benefit 2', 'Benefit 3'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-6 text-center">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 overflow-auto">
              {content && (
                <div className="bg-readable rounded-lg p-4 mb-6">
                  <ContentRenderer content={content} className={`text-gray-900 text-readable prose prose-lg max-w-none text-base md:text-lg leading-relaxed`} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefitItems.slice(0, 6).map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-4 md:p-5 rounded-xl bg-white border-2 border-green-400 shadow-lg flex items-start"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <ContentRenderer content={typeof benefit === 'string' ? benefit : benefit.toString()} className={`text-gray-900 text-readable prose prose-sm max-w-none text-xs md:text-sm leading-relaxed`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'challenges':
        const challengeItems = keyPoints || examples || content.split('\n').filter(line => line.trim()) || ['Challenge 1', 'Challenge 2', 'Challenge 3'];
        
        return (
          <div className="flex flex-col justify-center w-full z-10 max-w-6xl mx-auto h-full">
            <div className="flex-shrink-0 mb-6 text-center">
              <AnimatedText text={title} className={`${titleClasses} text-2xl md:text-3xl lg:text-4xl font-bold break-words`} />
              {subtitle && <p className={`${contentClasses} text-base md:text-lg mt-2 opacity-80`}>{subtitle}</p>}
            </div>
            <div className="flex-1 overflow-auto">
              {content && (
                <div className="bg-readable rounded-lg p-4 mb-6">
                  <ContentRenderer content={content} className={`text-gray-900 text-readable prose prose-lg max-w-none text-base md:text-lg leading-relaxed`} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challengeItems.slice(0, 6).map((challenge, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-4 md:p-5 rounded-xl bg-white border-2 border-orange-400 shadow-lg flex items-start"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">⚠️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <ContentRenderer content={typeof challenge === 'string' ? challenge : challenge.toString()} className={`text-gray-900 text-readable prose prose-sm max-w-none text-xs md:text-sm leading-relaxed`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full z-10">
            <h2 className={titleClasses}>{title}</h2>
            <p className={contentClasses}>{content}</p>
          </div>
        );
    }
  };

  return <div className={baseClasses}>
      {id === 'galactic-midnight' && <Particles />}
      {renderLayout()}
    </div>;
};

export default Slide;