import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

const prefix = Linking.createURL("/");

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, "reclib://"],
  config: {
    screens: {
      Main: {
        path: "",
      },
      Detail: {
        path: "recommendation/:id",
      },
      ImportShared: {
        path: "shared/:shareId",
      },
      AddRecommendation: {
        path: "add",
      },
      Settings: {
        path: "settings",
      },
      CategoryList: {
        path: "category/:category",
      },
    },
  },
};

export function createShareLink(shareId: string): string {
  return `reclib://shared/${shareId}`;
}

export function createWebShareLink(shareId: string): string {
  try {
    const baseUrl = getApiUrl();
    // Remove port from URL for external sharing (port is only for development)
    const url = new URL(`shared/${shareId}`, baseUrl);
    // In production, use the clean URL without port
    // The port is automatically removed when using standard HTTPS (443)
    if (url.port === "5000") {
      url.port = "";
    }
    return url.href;
  } catch {
    return createShareLink(shareId);
  }
}
