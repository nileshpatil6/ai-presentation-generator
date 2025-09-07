import { Presentation } from '../types';

// The GoogleGenAI instance will be dynamically imported and initialized
// to prevent browser-environment crashes on initial load.
let ai: any | null = null;

async function getAi() {
  if (!ai) {
    // Dynamically import the library only when needed.
    const { GoogleGenAI } = await import("@google/genai");
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const presentationSchema = {
  type: 'OBJECT',
  properties: {
    main_title: {
      type: 'STRING',
      description: "The main, overarching title for the entire presentation."
    },
    slides: {
      type: 'ARRAY',
      description: "An array of slide objects that make up the presentation.",
      items: {
        type: 'OBJECT',
        properties: {
          title: {
            type: 'STRING',
            description: "The title for this individual slide. For a quote slide, this can be the author of the quote."
          },
          content: {
            type: 'STRING',
            description: "The main body content for the slide. Use markdown for lists (e.g., '- Item 1\\n- Item 2') and emphasis (e.g., '**bold**'). Keep it concise and impactful. For a quote slide, this is the quote itself."
          },
          layout: {
            type: 'STRING',
            enum: ['title_only', 'title_content', 'content_only', 'image_left', 'image_right', 'quote', 'comparison', 'timeline', 'process_steps', 'key_facts', 'case_study', 'examples', 'use_cases', 'benefits', 'challenges'],
            description: "The layout template for the slide. Use diverse layouts: 'comparison' for vs./pros-cons, 'timeline' for chronological events, 'process_steps' for step-by-step guides, 'key_facts' for important statistics, 'case_study' for detailed examples, 'examples' for real-world examples, 'use_cases' for practical applications, 'benefits' for advantages/pros, 'challenges' for problems/obstacles."
          },
          image_prompt: {
            type: 'STRING',
            description: "A descriptive search query for a high-quality, relevant image for this slide. E.g., 'A futuristic cityscape with flying cars'. If no image is needed for the layout, this should be an empty string. It must NOT be null."
          },
          speaker_notes: {
            type: 'STRING',
            description: "Detailed, narrative-style speaker notes for this slide, written as if they are being spoken aloud for a tutorial. This will be used for text-to-speech narration."
          },
          subtitle: {
            type: 'STRING',
            description: "Optional subtitle or secondary heading for the slide to provide additional context."
          },
          keyPoints: {
            type: 'ARRAY',
            description: "Array of key bullet points or takeaways for the slide (3-5 items max).",
            items: { type: 'STRING' }
          },
          examples: {
            type: 'ARRAY', 
            description: "Array of specific examples or case studies related to the slide content (2-3 items max).",
            items: { type: 'STRING' }
          },
          statistics: {
            type: 'STRING',
            description: "Optional relevant statistic, percentage, or numerical fact to highlight on the slide."
          },
        },
        required: ['title', 'content', 'layout', 'image_prompt', 'speaker_notes']
      },
    },
  },
  required: ['main_title', 'slides'],
};


export const generateSlides = async (topic: string): Promise<Presentation> => {
  const prompt = `
    Generate a comprehensive, study-focused presentation on the topic: "${topic}".
    
    **PRESENTATION STRUCTURE (20-40 slides):**
    Create a detailed presentation with 20-40 slides that follows this educational structure:
    
    1. **Introduction Section (3-5 slides):**
       - Title slide
       - Topic overview and importance
       - Learning objectives/key takeaways
       - Historical context or background
    
    2. **Core Content Sections (15-30 slides):**
       - Break the topic into 4-6 main subtopics
       - Each subtopic should have 4-6 slides covering:
         * Definition and explanation
         * Key concepts and principles
         * Real-world examples (use 'examples' layout)
         * Practical use cases and applications (use 'use_cases' layout)
         * Benefits and advantages (use 'benefits' layout)
         * Common challenges and limitations (use 'challenges' layout)
    
    3. **Deep Dive Examples (3-5 slides):**
       - Detailed case studies
       - Step-by-step processes
       - Before/after comparisons
       - Success stories or notable implementations
    
    4. **Interactive Elements (2-4 slides):**
       - Key questions for reflection
       - Quick knowledge checks
       - "Did you know?" interesting facts
       - Myths vs. Reality comparisons
    
    5. **Conclusion Section (3-5 slides):**
       - Summary of key points
       - Future trends and developments
       - Next steps or further learning
       - Final takeaway message
    
    **CONTENT GUIDELINES:**
    - Make each slide educational and informative
    - Include specific examples, statistics, and facts where relevant
    - Use bullet points for complex information
    - Add practical tips and actionable insights
    - Include analogies to make complex concepts easier to understand
    - Incorporate current trends and recent developments
    
    **MANDATORY SLIDE INCLUSION:**
    For every presentation, you MUST include:
    - At least 2-3 'examples' slides with concrete real-world examples
    - At least 2-3 'use_cases' slides showing practical applications
    - At least 1-2 'benefits' slides highlighting advantages and value
    - At least 1-2 'challenges' slides discussing obstacles and limitations
    - These slides should be distributed throughout the presentation, not clustered together
    
    **VISUAL AND LAYOUT INSTRUCTIONS:**
    1. **Diverse Layouts:** Use all available layouts strategically:
       - 'title_only': For section headers and major topic introductions
       - 'title_content': For standard informational slides
       - 'image_left/right': For visual explanations (8-12 slides minimum)
       - 'quote': For expert insights and key principles (2-3 slides)
       - 'comparison': For pros/cons, before/after, or contrasting concepts (MUST use | to separate left and right content clearly)
       - 'timeline': For chronological events or step-by-step processes
       - 'process_steps': For workflows, methodologies, or procedures
       - 'key_facts': For statistics, important numbers, or crucial points
       - 'case_study': For detailed examples with analysis
       - 'examples': For real-world examples and practical demonstrations (MUST include 3-5 concrete examples)
       - 'use_cases': For practical applications and scenarios (MUST include 3-6 use cases)
       - 'benefits': For advantages, positive outcomes, and value propositions
       - 'challenges': For problems, obstacles, limitations, and difficulties
    2. **Enhanced Content Fields:** Utilize the new content fields:
       - 'subtitle': Add context or clarification to slide titles
       - 'keyPoints': 3-5 bullet points for main takeaways
       - 'examples': 2-3 real-world examples or case studies
       - 'statistics': Include relevant numbers, percentages, or data points
    3. **Image Strategy:** Every slide needs 'image_prompt' - detailed descriptions for visual slides, empty string for text-only layouts
    4. **Content Distribution:** CRITICAL - For comparison layouts, always format content as "Left side content | Right side content". For multi-column layouts, ensure balanced content distribution using keyPoints and examples arrays.
    
    **SPEAKER NOTES:**
    Write comprehensive, tutorial-style speaker notes (150-300 words per slide) that:
    - Explain concepts in detail
    - Provide additional context and background
    - Include examples not shown on the slide
    - Offer practical applications
    - Connect to previous and upcoming concepts
    - Use an engaging, educational tone suitable for learning
    
    Return the complete presentation as a JSON object. Aim for 25-35 slides for optimal depth and engagement.
  `;

  try {
    const aiInstance = await getAi();
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: presentationSchema,
      },
    });

    const jsonText = response.text.trim();
    const presentationData = JSON.parse(jsonText) as Presentation;

    // Basic validation
    if (!presentationData.main_title || !Array.isArray(presentationData.slides)) {
        throw new Error("Invalid presentation structure received from API.");
    }

    return presentationData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};

export const fetchImageFromInternet = async (prompt: string, retries = 3, delay = 500): Promise<string> => {
  if (!prompt) {
    throw new Error("Image prompt cannot be empty.");
  }

  try {
    const response = await fetch('https://fastapi-app-147317278405.us-central1.run.app/api/bulk_images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([prompt]),
      mode: 'cors'
    });

    if (!response.ok) {
        if (retries > 0) {
            console.warn(`Image API failed with status: ${response.status}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchImageFromInternet(prompt, retries - 1, delay * 2);
        }
        throw new Error(`Image API failed with status: ${response.status}`);
    }

    const data = await response.json();
    const imageUrls = data[prompt];

    if (imageUrls && imageUrls.length > 0) {
      return imageUrls[0];
    } else {
       if (retries > 0) {
            console.warn(`No images found for prompt: "${prompt}". Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchImageFromInternet(prompt, retries - 1, delay * 2);
        }
      throw new Error("No images found for the prompt.");
    }
  } catch (error) {
    console.error("Error fetching image from internet:", error);
     if (error instanceof Error && retries > 0) {
        console.warn(`Network or other error fetching image. Retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchImageFromInternet(prompt, retries - 1, delay * 2);
    }
    if (error instanceof Error) {
        throw new Error(`Failed to fetch a visual for the slide: ${error.message}`);
    }
    throw new Error("Failed to fetch a visual for the slide.");
  }
};


// --- New Deepgram TTS Integration ---

const DEEPGRAM_API_KEY = '4745f29f4e8841613fb92990f25bdbeac3b9b950';
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/speak?model=aura-asteria-en';

/**
 * NOTE: Exposing API keys on the client-side is a significant security risk.
 * For a production application, this API call should be proxied through a
 * secure backend service that holds the API key as an environment variable.
 * This implementation is for demonstration purposes only.
 */
export const getTextToSpeechAudio = async (text: string, retries = 3, delay = 500): Promise<Blob> => {
  try {
    const response = await fetch(DEEPGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (response.status === 429 && retries > 0) {
        console.warn(`Rate limit hit for TTS audio. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff
        return getTextToSpeechAudio(text, retries - 1, delay * 2);
    }


    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deepgram API Error:', errorBody);
      throw new Error(`Deepgram API failed with status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    if (error instanceof Error && retries > 0 && error.message.includes('Failed to fetch')) {
        console.warn(`Network error fetching TTS audio. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return getTextToSpeechAudio(text, retries - 1, delay * 2);
    }
    console.error("Error fetching TTS audio from Deepgram:", error);
    throw new Error("Failed to generate narration audio.");
  }
};