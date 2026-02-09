import { Category, Platform } from "@/types/recommendation";

// Keywords that suggest specific categories
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Books: [
    "book", "novel", "author", "isbn", "pages", "chapter", "edition",
    "hardcover", "paperback", "bestseller", "goodreads", "kindle",
    "publisher", "editor", "editorial", "club",
    "libro", "novela", "autor", "páginas", "capítulo", "edición",
    "editorial", "postfaci", "pròleg", "prologue"
  ],
  Movies: [
    "movie", "film", "director", "starring", "runtime", "cinema",
    "imdb", "rotten tomatoes", "letterboxd", "theatrical",
    "película", "cine", "director", "duración"
  ],
  Series: [
    "series", "season", "episode", "tv show", "streaming",
    "netflix", "hbo", "disney+", "amazon prime", "hulu",
    "serie", "temporada", "episodio"
  ],
  TV: [
    "tv", "television", "channel", "broadcast", "live",
    "televisión", "canal", "programa"
  ],
  Music: [
    "song", "album", "artist", "spotify", "apple music", "track",
    "playlist", "lyrics", "band", "singer",
    "canción", "álbum", "artista", "música"
  ],
  Podcasts: [
    "podcast", "episode", "host", "listen", "apple podcasts",
    "spotify", "anchor", "podimo"
  ],
  Links: [
    "article", "blog", "post", "read", "medium", "substack",
    "artículo", "leer", "publicación"
  ],
  Kids: [
    "kids", "children", "animated", "cartoon", "family",
    "niños", "infantil", "animado", "familia"
  ],
  Other: []
};

// Platform detection patterns
const PLATFORM_PATTERNS: { pattern: RegExp; platform: Platform; category: Category }[] = [
  { pattern: /netflix/i, platform: "Netflix", category: "Series" },
  { pattern: /hbo\s*(max)?/i, platform: "HBO Max", category: "Series" },
  { pattern: /disney\s*\+?/i, platform: "Disney+", category: "Series" },
  { pattern: /amazon\s*prime|prime\s*video/i, platform: "Amazon Prime", category: "Series" },
  { pattern: /hulu/i, platform: "Hulu", category: "Series" },
  { pattern: /paramount\s*\+?/i, platform: "Paramount+", category: "Series" },
  { pattern: /apple\s*tv\s*\+?/i, platform: "Apple TV+", category: "Series" },
  { pattern: /spotify/i, platform: "Spotify", category: "Music" },
  { pattern: /apple\s*music/i, platform: "Apple Music", category: "Music" },
  { pattern: /youtube/i, platform: "YouTube", category: "Links" },
  { pattern: /goodreads/i, platform: "Goodreads", category: "Books" },
  { pattern: /imdb/i, platform: "IMDb", category: "Movies" },
  { pattern: /letterboxd/i, platform: "Letterboxd", category: "Movies" },
  { pattern: /apple\s*podcasts?/i, platform: "Apple Podcasts", category: "Podcasts" },
  { pattern: /medium\.com|medium/i, platform: "Medium", category: "Links" },
  { pattern: /substack/i, platform: "Substack", category: "Links" },
];

export interface OCRParseResult {
  title?: string;
  category?: Category;
  platform?: Platform;
  confidence: number; // 0-1, how confident we are in the result
  rawText: string;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    // Allow common Latin characters with accents (Spanish, Catalan, French, Portuguese, Italian, etc.)
    .replace(/[^\w\s\-àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ:.,!?'"()&@#$%0-9]/g, '')
    .trim();
}

function extractPotentialTitle(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // First pass: look for good title candidates in first 5 lines
  for (const line of lines.slice(0, 5)) {
    const cleaned = cleanText(line);
    // Skip very short or very long text, and common non-titles
    if (cleaned.length >= 2 && cleaned.length <= 100 && !isCommonNonTitle(cleaned)) {
      return cleaned;
    }
  }

  // Second pass: if nothing found, just take the first non-empty line
  for (const line of lines) {
    const cleaned = cleanText(line);
    if (cleaned.length >= 2) {
      return cleaned;
    }
  }

  // Last resort: return the longest word from the text
  const words = text.split(/\s+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    return words.reduce((a, b) => a.length >= b.length ? a : b);
  }

  return undefined;
}

function isCommonNonTitle(text: string): boolean {
  const nonTitlePatterns = [
    /^(watch|play|listen|read|download|share|subscribe|follow)/i,
    /^(click|tap|swipe|open|close|back|next|previous)/i,
    /^(loading|buffering|connecting|error|warning)/i,
    /^\d+:\d+/, // timestamps
    /^(episode|season|chapter|part)\s*\d+$/i,
    /^www\.|https?:\/\//i,
  ];

  return nonTitlePatterns.some(p => p.test(text));
}

function detectCategory(text: string): { category: Category; confidence: number } | undefined {
  const lowerText = text.toLowerCase();
  let bestMatch: { category: Category; count: number } | undefined;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    // Use word boundary matching to avoid false positives (e.g., "postfaci" matching "post")
    const matchCount = keywords.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lowerText);
    }).length;
    if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.count)) {
      bestMatch = { category, count: matchCount };
    }
  }

  if (bestMatch) {
    // Confidence based on number of keyword matches
    const confidence = Math.min(0.9, 0.3 + (bestMatch.count * 0.15));
    return { category: bestMatch.category, confidence };
  }

  return undefined;
}

function detectPlatform(text: string): { platform: Platform; category: Category } | undefined {
  for (const { pattern, platform, category } of PLATFORM_PATTERNS) {
    if (pattern.test(text)) {
      return { platform, category };
    }
  }
  return undefined;
}

export function parseOCRResult(text: string): OCRParseResult {
  const rawText = text;

  if (!text || text.trim().length < 5) {
    return { confidence: 0, rawText };
  }

  let confidence = 0;
  let title: string | undefined;
  let category: Category | undefined;
  let platform: Platform | undefined;

  // Try to detect platform first (most reliable)
  const platformResult = detectPlatform(text);
  if (platformResult) {
    platform = platformResult.platform;
    category = platformResult.category;
    confidence += 0.4;
  }

  // Try to detect category from keywords
  const categoryResult = detectCategory(text);
  if (categoryResult) {
    if (!category) {
      category = categoryResult.category;
    }
    confidence += categoryResult.confidence * 0.3;
  }

  // Try to extract title
  title = extractPotentialTitle(text);
  if (title) {
    confidence += 0.3;
  }

  // Normalize confidence to 0-1
  confidence = Math.min(1, confidence);

  return {
    title,
    category,
    platform,
    confidence,
    rawText,
  };
}

// Threshold for considering OCR result good enough (skip AI)
export const OCR_CONFIDENCE_THRESHOLD = 0.5;

export function isOCRResultSufficient(result: OCRParseResult): boolean {
  // We need at least a title and reasonable confidence
  return Boolean(result.title) && result.confidence >= OCR_CONFIDENCE_THRESHOLD;
}
