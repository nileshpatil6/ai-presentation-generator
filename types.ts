export interface Slide {
  title: string;
  content: string;
  layout: 'title_only' | 'title_content' | 'content_only' | 'image_left' | 'image_right' | 'quote' | 'comparison' | 'timeline' | 'process_steps' | 'key_facts' | 'case_study' | 'examples' | 'use_cases' | 'benefits' | 'challenges';
  image_prompt?: string;
  speaker_notes?: string;
  subtitle?: string;
  keyPoints?: string[];
  examples?: string[];
  statistics?: string;
}

export interface Presentation {
  main_title: string;
  slides: Slide[];
}

export interface Template {
  id: string;
  name: string;
  style: {
    backgroundClasses: string;
    textColor: string;
    headingColor: string;
    accentColor: string;
    secondaryAccentColor?: string;
    fontFamily: string;
    preview: {
      bg: string;
      accent: string;
      text: string;
    };
  };
}

export type PreloadState =
  | { status: 'idle' | 'complete' }
  | {
      status: 'loading';
      images?: { loaded: number; total: number };
      audio?: { loaded: number; total: number };
    };

export type StreamingState = 
  | { status: 'idle' }
  | { status: 'generating'; currentSlide: number; totalExpected?: number }
  | { status: 'complete' }
  | { status: 'error'; message: string };

export interface PartialPresentation {
  main_title?: string;
  slides: Slide[];
  isComplete: boolean;
}
