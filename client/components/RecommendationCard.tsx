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
import { PlatformBadge } from "@/components/PlatformBadge";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/lib/i18n";
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
  const { language } = useI18n();
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

  const platforms = recommendation.platforms || [];

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
          <View style={styles.badges}>
            <CategoryBadge category={recommendation.category} size="small" />
            {platforms.slice(0, 2).map((platform) => (
              <PlatformBadge key={platform} platform={platform} size="small" />
            ))}
            {platforms.length > 2 ? (
              <ThemedText style={[styles.morePlatforms, { color: theme.textSecondary }]}>
                +{platforms.length - 2}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText
            style={[styles.timestamp, { color: theme.textTertiary }]}
          >
            {formatTimeAgo(recommendation.createdAt, language)}
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    flex: 1,
    alignItems: "center",
  },
  morePlatforms: {
    ...Typography.caption,
    fontWeight: "500",
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
    marginLeft: Spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#E8E8E6",
  },
});
