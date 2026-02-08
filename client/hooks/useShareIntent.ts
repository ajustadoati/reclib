import { useEffect, useCallback } from "react";
import { useShareIntentContext } from "expo-share-intent";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { parseSharedContent, ShareIntentData } from "@/lib/share-intent";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useShareIntent() {
  const navigation = useNavigation<NavigationProp>();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  const handleShareIntent = useCallback(() => {
    if (!hasShareIntent || !shareIntent) return;

    let sharedData: ShareIntentData | null = null;

    // Handle web URL
    if (shareIntent.webUrl) {
      sharedData = parseSharedContent(shareIntent.webUrl);
    }
    // Handle text content
    else if (shareIntent.text) {
      sharedData = parseSharedContent(shareIntent.text);
    }

    if (sharedData) {
      // Navigate to AddRecommendation with pre-filled data
      navigation.navigate("AddRecommendation", {
        sharedData: {
          url: sharedData.url,
          title: sharedData.title,
          category: sharedData.category,
          platform: sharedData.platform,
        },
      });
    }

    // Reset the share intent after handling
    resetShareIntent();
  }, [hasShareIntent, shareIntent, navigation, resetShareIntent]);

  useEffect(() => {
    handleShareIntent();
  }, [handleShareIntent]);

  return { hasShareIntent, shareIntent };
}
