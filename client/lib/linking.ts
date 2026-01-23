import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

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

export function createShareLink(id: string): string {
  return `reclib://recommendation/${id}`;
}

export function createWebShareLink(id: string): string {
  return createShareLink(id);
}
