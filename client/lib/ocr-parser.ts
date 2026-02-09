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
  const cleanedLines = lines.map(l => cleanText(l)).filter(l => l.length > 0);

  if (cleanedLines.length === 0) return undefined;

  // Filter out non-title lines (credits, subtitles, etc.)
  const validLines = cleanedLines.filter(l =>
    l.length >= 2 && l.length <= 100 && !isCommonNonTitle(l)
  );

  // Strategy 1: Try to combine consecutive short lines that might form a title
  // This is common for book covers where title spans multiple lines
  // (e.g., "La plaça" + "del Diamant" = "La plaça del Diamant")
  for (let i = 0; i < Math.min(cleanedLines.length - 1, 5); i++) {
    const current = cleanedLines[i];
    const next = cleanedLines[i + 1];

    // Skip if either line is a non-title
    if (isCommonNonTitle(current) || isCommonNonTitle(next)) continue;

    // If current line is short and next line starts with lowercase or "del/de/the/of"
    // they likely form a single title
    if (current.length >= 2 && current.length <= 25 &&
        next.length >= 2 && next.length <= 25) {
      const nextLower = next.toLowerCase();
      const startsWithConnector = /^(del|de|the|of|and|y|i|e|a|en|in|un|una|el|la|los|las)\s/i.test(next);
      const startsLowercase = next[0] === next[0].toLowerCase() && /^[a-záéíóúàèìòùñç]/i.test(next);

      if (startsWithConnector || startsLowercase) {
        const combined = `${current} ${next}`;
        if (combined.length <= 80 && !isCommonNonTitle(combined)) {
          return combined;
        }
      }
    }
  }

  // Strategy 2: Look for multi-word lines in positions 2-5 (often title after author)
  for (let i = 1; i < Math.min(validLines.length, 5); i++) {
    const line = validLines[i];
    const wordCount = line.split(/\s+/).length;
    if (wordCount >= 2 && line.length >= 5) {
      return line;
    }
  }

  // Strategy 3: Find the longest valid line (but not too long - likely a description)
  const sortedByLength = [...validLines]
    .filter(l => l.length <= 60) // Exclude very long lines (descriptions)
    .sort((a, b) => b.length - a.length);

  if (sortedByLength.length > 0) {
    return sortedByLength[0];
  }

  // Strategy 4: Just take the first valid line
  if (validLines.length > 0) {
    return validLines[0];
  }

  // Last resort: return any cleaned line
  if (cleanedLines.length > 0) {
    return cleanedLines[0];
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
    // Credits and subtitle patterns
    /^(amb|con|with|by|de|por)\s+/i, // "Amb un postfaci de...", "Con prólogo de..."
    /\b(postfaci|prólogo|prologue|prefaci|preface|introducció|introduction)\b/i,
    /\b(estudi|study|ensayo|essay)\s+(de|by|of)\b/i,
    /\b(traducci|translat|edici|edit)\b/i,
    /^(club|editor|editorial|publisher)/i,
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
