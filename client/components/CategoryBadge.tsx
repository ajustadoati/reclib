import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, CategoryColors, Typography } from "@/constants/theme";
import { Category } from "@/types/recommendation";

interface CategoryBadgeProps {
  category: Category;
  size?: "small" | "medium";
}

export function CategoryBadge({ category, size = "medium" }: CategoryBadgeProps) {
  const { theme, isDark } = useTheme();
  const categoryColor = CategoryColors[category] || CategoryColors.Other;

  return (
    <View
      style={[
        styles.badge,
        size === "small" && styles.badgeSmall,
        {
          backgroundColor: isDark
            ? `${categoryColor}30`
            : `${categoryColor}15`,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          size === "small" && styles.textSmall,
          { color: categoryColor },
        ]}
      >
        {category}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    ...Typography.label,
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 10,
  },
});
