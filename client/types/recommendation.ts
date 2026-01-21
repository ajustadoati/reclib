export type Category = "Books" | "Movies" | "TV" | "Music" | "Podcasts" | "Other";

export interface Recommendation {
  id: string;
  title: string;
  category: Category;
  notes?: string;
  platformUrl?: string;
  platformName?: string;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIRecognitionResult {
  title: string;
  category: Category;
  author?: string;
  platformUrl?: string;
  platformName?: string;
  confidence: number;
}

export const CATEGORIES: Category[] = ["Books", "Movies", "TV", "Music", "Podcasts", "Other"];

export const PLATFORM_SUGGESTIONS: Record<Category, { name: string; baseUrl: string }[]> = {
  Books: [
    { name: "Goodreads", baseUrl: "https://www.goodreads.com/search?q=" },
    { name: "Amazon", baseUrl: "https://www.amazon.com/s?k=" },
  ],
  Movies: [
    { name: "IMDb", baseUrl: "https://www.imdb.com/find?q=" },
    { name: "Letterboxd", baseUrl: "https://letterboxd.com/search/" },
  ],
  TV: [
    { name: "IMDb", baseUrl: "https://www.imdb.com/find?q=" },
    { name: "TV Time", baseUrl: "https://www.tvtime.com/search?q=" },
  ],
  Music: [
    { name: "Spotify", baseUrl: "https://open.spotify.com/search/" },
    { name: "Apple Music", baseUrl: "https://music.apple.com/search?term=" },
  ],
  Podcasts: [
    { name: "Spotify", baseUrl: "https://open.spotify.com/search/" },
    { name: "Apple Podcasts", baseUrl: "https://podcasts.apple.com/search?term=" },
  ],
  Other: [
    { name: "Google", baseUrl: "https://www.google.com/search?q=" },
  ],
};

export function generateSmartLink(title: string, category: Category): string {
  const platforms = PLATFORM_SUGGESTIONS[category];
  const defaultPlatform = platforms[0];
  const encodedTitle = encodeURIComponent(title);
  return `${defaultPlatform.baseUrl}${encodedTitle}`;
}

export function getPlatformName(category: Category): string {
  return PLATFORM_SUGGESTIONS[category][0].name;
}
