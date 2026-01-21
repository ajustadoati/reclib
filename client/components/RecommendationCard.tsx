import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Recommendation } from "@/types/recommendation";
import { formatTimeAgo } from "@/lib/storage";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RecommendationCard({
  recommendation,
  onPress,
  onLongPress,
}: RecommendationCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(0.9, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
      testID={`card-recommendation-${recommendation.id}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <CategoryBadge category={recommendation.category} size="small" />
          <ThemedText
            style={[styles.timestamp, { color: theme.textTertiary }]}
          >
            {formatTimeAgo(recommendation.createdAt)}
          </ThemedText>
        </View>

        <ThemedText style={styles.title} numberOfLines={2}>
          {recommendation.title}
        </ThemedText>

        {recommendation.notes ? (
          <ThemedText
            style={[styles.notes, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {recommendation.notes}
          </ThemedText>
        ) : null}

        {recommendation.platformName ? (
          <View style={styles.platformRow}>
            <ThemedText
              style={[styles.platform, { color: theme.link }]}
            >
              {recommendation.platformName}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {recommendation.imageUri ? (
        <Image
          source={{ uri: recommendation.imageUri }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  notes: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    ...Typography.caption,
  },
  platformRow: {
    marginTop: Spacing.xs,
  },
  platform: {
    ...Typography.caption,
    fontWeight: "500",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#E8E8E6",
  },
});
