import AsyncStorage from "@react-native-async-storage/async-storage";

const AI_USAGE_KEY = "@reclib_ai_usage";
const AI_SCAN_LIMIT = 3;

interface AIUsage {
  scanCount: number;
  firstScanDate: string | null;
}

async function getUsage(): Promise<AIUsage> {
  try {
    const data = await AsyncStorage.getItem(AI_USAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading AI usage:", error);
  }
  return { scanCount: 0, firstScanDate: null };
}

async function saveUsage(usage: AIUsage): Promise<void> {
  try {
    await AsyncStorage.setItem(AI_USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error("Error saving AI usage:", error);
  }
}

export async function getRemainingScanCount(): Promise<number> {
  const usage = await getUsage();
  return Math.max(0, AI_SCAN_LIMIT - usage.scanCount);
}

export async function canUseScan(): Promise<boolean> {
  const remaining = await getRemainingScanCount();
  return remaining > 0;
}

export async function incrementScanCount(): Promise<number> {
  const usage = await getUsage();
  usage.scanCount += 1;
  if (!usage.firstScanDate) {
    usage.firstScanDate = new Date().toISOString();
  }
  await saveUsage(usage);
  return Math.max(0, AI_SCAN_LIMIT - usage.scanCount);
}

export function getScanLimit(): number {
  return AI_SCAN_LIMIT;
}
