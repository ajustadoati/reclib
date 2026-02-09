import { Platform } from "react-native";

// Wrapper for react-native-text-recognition that handles web gracefully
// The native module only works on iOS/Android

let TextRecognitionModule: { recognize: (uri: string) => Promise<string[]> } | null = null;

if (Platform.OS !== "web") {
  try {
    // Dynamic require to avoid bundling issues on web
    TextRecognitionModule = require("react-native-text-recognition").default;
  } catch (e) {
    console.warn("TextRecognition module not available:", e);
  }
}

export async function recognizeText(uri: string): Promise<string[]> {
  if (!TextRecognitionModule) {
    console.log("[OCR] TextRecognition not available on this platform");
    return [];
  }

  try {
    // react-native-text-recognition expects a file path without file:// prefix
    const filePath = uri.startsWith("file://") ? uri.replace("file://", "") : uri;
    return await TextRecognitionModule.recognize(filePath);
  } catch (error) {
    console.error("[OCR] Recognition error:", error);
    return [];
  }
}

export function isOCRAvailable(): boolean {
  return TextRecognitionModule !== null;
}
