import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Platform } from "@/types/recommendation";

interface PlatformBadgeProps {
  platform: Platform;
  size?: "small" | "medium";
}

const PLATFORM_COLORS: Record<Platform, string> = {
  "Netflix": "#E50914",
  "HBO Max": "#B022CB",
  "Apple TV+": "#000000",
  "Disney+": "#113CCF",
  "Amazon Prime": "#00A8E1",
  "Hulu": "#1CE783",
  "Paramount+": "#0064FF",
  "Peacock": "#000000",
  "Spotify": "#1DB954",
  "Apple Music": "#FA243C",
  "YouTube": "#FF0000",
  "Goodreads": "#553B08",
  "Amazon Books": "#FF9900",
  "Apple Podcasts": "#9933CC",
  "IMDb": "#F5C518",
  "Letterboxd": "#00D735",
  "Other": "#6B6B6B",
};

export function PlatformBadge({ platform, size = "medium" }: PlatformBadgeProps) {
  const { theme, isDark } = useTheme();
  const platformColor = PLATFORM_COLORS[platform] || PLATFORM_COLORS.Other;

  return (
    <View
      style={[
        styles.badge,
        size === "small" && styles.badgeSmall,
        {
          backgroundColor: isDark
            ? `${platformColor}40`
            : `${platformColor}15`,
          borderColor: `${platformColor}30`,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          size === "small" && styles.textSmall,
          { color: isDark ? "#FFFFFF" : platformColor },
        ]}
      >
        {platform}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  badgeSmall: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
  },
  text: {
    ...Typography.label,
    fontWeight: "500",
  },
  textSmall: {
    fontSize: 10,
  },
});
