import React from 'react';
import { motion } from 'framer-motion';

// Floating geometric shapes for modern design
export const FloatingShapes: React.FC<{ templateId: string }> = ({ templateId }) => {
  const getShapeColor = (templateId: string) => {
    switch (templateId) {
      case 'galactic-midnight':
        return 'from-cyan-400/20 to-fuchsia-500/20';
      case 'serene-forest':
        return 'from-emerald-400/20 to-teal-500/20';
      case 'crimson-dawn':
        return 'from-rose-400/20 to-orange-500/20';
      case 'academic-blue':
        return 'from-blue-400/20 to-indigo-500/20';
      case 'modern-education':
        return 'from-purple-400/20 to-pink-500/20';
      case 'tech-presentation':
        return 'from-emerald-400/20 to-teal-500/20';
      case 'warm-study':
        return 'from-amber-400/20 to-orange-500/20';
      default:
        return 'from-blue-400/20 to-purple-500/20';
    }
  };

  const shapeColor = getShapeColor(templateId);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large background blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className={`absolute -top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br ${shapeColor} shape-blob shape-float`}
        style={{ animationDelay: '0s' }}
      />
      
      {/* Medium circular shape */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className={`absolute -bottom-1/4 -left-1/4 w-72 h-72 bg-gradient-to-tr ${shapeColor} shape-circle pulse-glow`}
        style={{ animationDelay: '1s' }}
      />
      
      {/* Small accent shapes */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className={`absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-bl ${shapeColor} shape-organic shape-float`}
        style={{ animationDelay: '2s' }}
      />
      
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 pattern-dots opacity-50" />
    </div>
  );
};

// Modern decorative line element
export const DecorativeLine: React.FC<{ color?: string; className?: string }> = ({ 
  color = 'bg-gradient-to-r from-blue-500 to-purple-600', 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-1 ${color} rounded-full ${className}`}
    />
  );
};

// Geometric accent for titles
export const TitleAccent: React.FC<{ color: string; side?: 'left' | 'right' }> = ({ 
  color, 
  side = 'left' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`absolute ${side === 'left' ? '-left-6' : '-right-6'} top-1/2 transform -translate-y-1/2`}
    >
      <div className={`w-4 h-4 ${color} shape-circle`} />
      <div className={`w-2 h-2 ${color} shape-circle absolute -bottom-2 ${side === 'left' ? '-right-1' : '-left-1'}`} />
    </motion.div>
  );
};

// Modern card container with glass effect
export const ModernCard: React.FC<{ 
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'modern' | 'gradient';
  glowColor?: string;
}> = ({ 
  children, 
  className = '',
  variant = 'modern',
  glowColor = 'shadow-glow'
}) => {
  const getCardClass = () => {
    switch (variant) {
      case 'glass':
        return 'card-glass';
      case 'gradient':
        return 'border-gradient';
      default:
        return 'card-modern';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${getCardClass()} ${glowColor} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Gradient mesh background
export const GradientMesh: React.FC<{ variant?: 'mesh' | 'aurora' }> = ({ variant = 'mesh' }) => {
  return (
    <div className={`absolute inset-0 ${variant === 'mesh' ? 'gradient-mesh' : 'gradient-aurora'} pointer-events-none`} />
  );
};

// Icon with modern styling
export const ModernIcon: React.FC<{ 
  icon: string; 
  color?: string; 
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}> = ({ 
  icon, 
  color = 'bg-gradient-to-br from-blue-500 to-purple-600', 
  size = 'md',
  animated = true
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : {}}
      animate={animated ? { scale: 1, rotate: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`${sizeClasses[size]} ${color} shape-circle flex items-center justify-center text-white font-bold shadow-depth`}
    >
      {icon}
    </motion.div>
  );
};

// Progress indicator with modern design
export const ProgressBar: React.FC<{ 
  progress: number; 
  color?: string;
  className?: string;
}> = ({ 
  progress, 
  color = 'bg-gradient-to-r from-blue-500 to-purple-600',
  className = ''
}) => {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  );
};