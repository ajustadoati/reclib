import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

import emptyLibraryImage from "../assets/images/empty-library.png";
import emptyCategoriesImage from "../assets/images/empty-categories.png";

type EmptyStateType = "library" | "categories" | "search" | "category";

interface EmptyStateProps {
  type: EmptyStateType;
  categoryName?: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, { title: string; subtitle: string }> = {
  library: {
    title: "No recommendations yet",
    subtitle: "Tap + to save your first",
  },
  categories: {
    title: "Nothing saved yet",
    subtitle: "Start adding recommendations to see them organized here",
  },
  search: {
    title: "No results found",
    subtitle: "Try a different search term",
  },
  category: {
    title: "No items in this category",
    subtitle: "Add recommendations to see them here",
  },
};

export function EmptyState({ type, categoryName }: EmptyStateProps) {
  const { theme } = useTheme();
  const config = EMPTY_STATE_CONFIG[type];
  
  const imageSource = type === "library" || type === "search" || type === "category"
    ? emptyLibraryImage
    : emptyCategoriesImage;

  const title = type === "category" && categoryName
    ? `No ${categoryName} yet`
    : config.title;

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={styles.image}
        contentFit="contain"
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        {config.subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: Spacing["2xl"],
    opacity: 0.9,
  },
  title: {
    ...Typography.title,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
  },
});
