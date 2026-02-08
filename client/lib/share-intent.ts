import { Category, Platform } from "@/types/recommendation";

// Domain to category/platform mapping
const DOMAIN_MAPPINGS: Record<string, { category: Category; platform?: Platform }> = {
  // Streaming - Series/Movies
  "netflix.com": { category: "Series", platform: "Netflix" },
  "hbomax.com": { category: "Series", platform: "HBO Max" },
  "max.com": { category: "Series", platform: "HBO Max" },
  "disneyplus.com": { category: "Series", platform: "Disney+" },
  "primevideo.com": { category: "Series", platform: "Amazon Prime" },
  "amazon.com/gp/video": { category: "Series", platform: "Amazon Prime" },
  "hulu.com": { category: "Series", platform: "Hulu" },
  "paramountplus.com": { category: "Series", platform: "Paramount+" },
  "peacocktv.com": { category: "Series", platform: "Peacock" },
  "tv.apple.com": { category: "Series", platform: "Apple TV+" },

  // Music
  "spotify.com": { category: "Music", platform: "Spotify" },
  "open.spotify.com": { category: "Music", platform: "Spotify" },
  "music.apple.com": { category: "Music", platform: "Apple Music" },
  "soundcloud.com": { category: "Music", platform: "Other" },

  // Podcasts
  "podcasts.apple.com": { category: "Podcasts", platform: "Apple Podcasts" },

  // Video
  "youtube.com": { category: "Links", platform: "YouTube" },
  "youtu.be": { category: "Links", platform: "YouTube" },

  // Books
  "goodreads.com": { category: "Books", platform: "Goodreads" },
  "amazon.com/dp": { category: "Books", platform: "Amazon Books" },
  "amazon.com/gp/product": { category: "Books", platform: "Amazon Books" },
  "books.apple.com": { category: "Books", platform: "Other" },

  // Movies
  "imdb.com": { category: "Movies", platform: "IMDb" },
  "letterboxd.com": { category: "Movies", platform: "Letterboxd" },
  "rottentomatoes.com": { category: "Movies", platform: "Other" },

  // Articles/Links
  "medium.com": { category: "Links", platform: "Medium" },
  "substack.com": { category: "Links", platform: "Substack" },
  "reddit.com": { category: "Links", platform: "Reddit" },
  "twitter.com": { category: "Links", platform: "Twitter" },
  "x.com": { category: "Links", platform: "Twitter" },
};

export interface ShareIntentData {
  url: string;
  title?: string;
  category: Category;
  platform?: Platform;
}

export function detectCategoryFromUrl(url: string): { category: Category; platform?: Platform } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const fullPath = hostname + urlObj.pathname;

    // Check full path first (more specific matches)
    for (const [domain, mapping] of Object.entries(DOMAIN_MAPPINGS)) {
      if (fullPath.includes(domain)) {
        return mapping;
      }
    }

    // Then check hostname only
    for (const [domain, mapping] of Object.entries(DOMAIN_MAPPINGS)) {
      if (hostname.includes(domain) || domain.includes(hostname)) {
        return mapping;
      }
    }
  } catch {
    // Invalid URL
  }

  return { category: "Links" };
}

export function extractTitleFromUrl(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    // Try to extract something meaningful from the path
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    if (pathParts.length > 0) {
      // Get the last meaningful part
      const lastPart = pathParts[pathParts.length - 1];
      // Clean up common URL patterns
      const cleaned = lastPart
        .replace(/[-_]/g, " ")
        .replace(/\.(html|htm|php|asp)$/i, "")
        .replace(/[0-9]+$/, "")
        .trim();

      if (cleaned.length > 2) {
        // Capitalize first letter of each word
        return cleaned
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      }
    }
  } catch {
    // Invalid URL
  }

  return undefined;
}

export function parseSharedContent(text: string): ShareIntentData | null {
  // Try to extract URL from the text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);

  if (matches && matches.length > 0) {
    const url = matches[0];
    const { category, platform } = detectCategoryFromUrl(url);
    const title = extractTitleFromUrl(url);

    return {
      url,
      title,
      category,
      platform,
    };
  }

  // If no URL found, treat as text
  return {
    url: "",
    title: text.substring(0, 100),
    category: "Other",
  };
}
