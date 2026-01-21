import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/lib/i18n";
import { Spacing, Typography } from "@/constants/theme";

import emptyLibraryImage from "../assets/images/empty-library.png";
import emptyCategoriesImage from "../assets/images/empty-categories.png";

type EmptyStateType = "library" | "categories" | "search" | "category";

interface EmptyStateProps {
  type: EmptyStateType;
  categoryName?: string;
}

export function EmptyState({ type, categoryName }: EmptyStateProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const getConfig = () => {
    switch (type) {
      case "library":
        return {
          title: t("library.empty.title"),
          subtitle: t("library.empty.subtitle"),
        };
      case "categories":
        return {
          title: t("categories.empty.title"),
          subtitle: t("categories.empty.subtitle"),
        };
      case "search":
        return {
          title: t("library.search.empty"),
          subtitle: "",
        };
      case "category":
        return {
          title: categoryName ? `${t("library.empty.title")}` : t("library.empty.title"),
          subtitle: t("library.empty.subtitle"),
        };
      default:
        return {
          title: t("library.empty.title"),
          subtitle: t("library.empty.subtitle"),
        };
    }
  };

  const config = getConfig();
  
  const imageSource = type === "library" || type === "search" || type === "category"
    ? emptyLibraryImage
    : emptyCategoriesImage;

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={styles.image}
        contentFit="contain"
      />
      <ThemedText style={styles.title}>{config.title}</ThemedText>
      {config.subtitle ? (
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {config.subtitle}
        </ThemedText>
      ) : null}
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
