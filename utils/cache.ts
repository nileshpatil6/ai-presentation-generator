// In-memory cache for assets to avoid re-fetching during the session.

/**
 * Cache for storing pre-fetched image URLs.
 * Key: image_prompt (string)
 * Value: image URL (string)
 */
export const imageCache = new Map<string, string>();

/**
 * Cache for storing pre-generated text-to-speech audio.
 * Key: speaker_notes (string)
 * Value: Audio Blob
 */
export const audioCache = new Map<string, Blob>();
