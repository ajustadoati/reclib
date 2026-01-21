import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, CategoryColors } from "@/constants/theme";
import { Category } from "@/types/recommendation";

interface CategoryTileProps {
  category: Category;
  count: number;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<Category, keyof typeof Feather.glyphMap> = {
  Books: "book",
  Movies: "film",
  TV: "tv",
  Music: "music",
  Podcasts: "mic",
  Other: "folder",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryTile({ category, count, onPress }: CategoryTileProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const categoryColor = CategoryColors[category];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(0.85, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tile,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
      testID={`tile-category-${category}`}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? `${categoryColor}30`
              : `${categoryColor}15`,
          },
        ]}
      >
        <Feather
          name={CATEGORY_ICONS[category]}
          size={24}
          color={categoryColor}
        />
      </View>

      <ThemedText style={styles.categoryName}>{category}</ThemedText>

      <ThemedText style={[styles.count, { color: theme.textSecondary }]}>
        {count} saved
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    margin: Spacing.xs,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  categoryName: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  count: {
    ...Typography.caption,
  },
});
