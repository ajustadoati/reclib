import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recommendation, Category, Platform, Language } from "@/types/recommendation";

const STORAGE_KEY = "@recommendation_vault";
const SETTINGS_KEY = "@recommendation_vault_settings";

export interface AppSettings {
  displayName: string;
  defaultCategory: Category;
  sortOrder: "recent" | "alphabetical" | "category";
  language: Language;
}

const DEFAULT_SETTINGS: AppSettings = {
  displayName: "Me",
  defaultCategory: "Movies",
  sortOrder: "recent",
  language: "en",
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getAllRecommendations(): Promise<Recommendation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading recommendations:", error);
    return [];
  }
}

export async function getRecommendationById(id: string): Promise<Recommendation | null> {
  const recommendations = await getAllRecommendations();
  return recommendations.find((r) => r.id === id) || null;
}

export async function saveRecommendation(
  data: Omit<Recommendation, "id" | "createdAt" | "updatedAt">
): Promise<Recommendation> {
  const recommendations = await getAllRecommendations();
  const newRecommendation: Recommendation = {
    ...data,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  recommendations.unshift(newRecommendation);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recommendations));
  return newRecommendation;
}

export async function updateRecommendation(
  id: string,
  data: Partial<Omit<Recommendation, "id" | "createdAt">>
): Promise<Recommendation | null> {
  const recommendations = await getAllRecommendations();
  const index = recommendations.findIndex((r) => r.id === id);
  if (index === -1) return null;
  
  recommendations[index] = {
    ...recommendations[index],
    ...data,
    updatedAt: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recommendations));
  return recommendations[index];
}

export async function deleteRecommendation(id: string): Promise<boolean> {
  const recommendations = await getAllRecommendations();
  const filtered = recommendations.filter((r) => r.id !== id);
  if (filtered.length === recommendations.length) return false;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export async function getRecommendationsByCategory(category: Category): Promise<Recommendation[]> {
  const recommendations = await getAllRecommendations();
  return recommendations.filter((r) => r.category === category);
}

export async function getRecommendationsByPlatform(platform: Platform): Promise<Recommendation[]> {
  const recommendations = await getAllRecommendations();
  return recommendations.filter((r) => r.platforms && r.platforms.includes(platform));
}

export async function searchRecommendations(query: string): Promise<Recommendation[]> {
  const recommendations = await getAllRecommendations();
  const lowerQuery = query.toLowerCase();
  return recommendations.filter(
    (r) =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.notes?.toLowerCase().includes(lowerQuery) ||
      r.category.toLowerCase().includes(lowerQuery) ||
      (r.platforms && r.platforms.some((p) => p.toLowerCase().includes(lowerQuery)))
  );
}

export async function getCategoryCounts(): Promise<Record<Category, number>> {
  const recommendations = await getAllRecommendations();
  const counts: Record<Category, number> = {
    Books: 0,
    Movies: 0,
    Series: 0,
    TV: 0,
    Music: 0,
    Podcasts: 0,
    Other: 0,
  };
  recommendations.forEach((r) => {
    counts[r.category]++;
  });
  return counts;
}

export async function getPlatformCounts(): Promise<Record<Platform, number>> {
  const recommendations = await getAllRecommendations();
  const counts: Record<string, number> = {};
  recommendations.forEach((r) => {
    if (r.platforms) {
      r.platforms.forEach((platform) => {
        counts[platform] = (counts[platform] || 0) + 1;
      });
    }
  });
  return counts as Record<Platform, number>;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error("Error reading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function formatTimeAgo(timestamp: number, language: Language = "en"): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  const justNow = language === "es" ? "Ahora mismo" : "Just now";
  const ago = language === "es" ? "" : " ago";
  
  if (seconds < 60) return justNow;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${ago}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${ago}`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d${ago}`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}${language === "es" ? "s" : "w"}${ago}`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}${language === "es" ? " mes" : "mo"}${ago}`;
  
  const years = Math.floor(days / 365);
  return `${years}${language === "es" ? "a" : "y"}${ago}`;
}
