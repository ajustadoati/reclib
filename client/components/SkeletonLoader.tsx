import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SkeletonLoaderProps {
  count?: number;
}

function SkeletonCard() {
  const { theme } = useTheme();
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmerProgress.value * 0.4,
  }));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.badge,
            { backgroundColor: theme.backgroundSecondary },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.titleLine,
            { backgroundColor: theme.backgroundSecondary },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.subtitleLine,
            { backgroundColor: theme.backgroundSecondary },
            animatedStyle,
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.thumbnail,
          { backgroundColor: theme.backgroundSecondary },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function SkeletonLoader({ count = 3 }: SkeletonLoaderProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
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
  badge: {
    width: 60,
    height: 20,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  titleLine: {
    width: "80%",
    height: 20,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  subtitleLine: {
    width: "60%",
    height: 14,
    borderRadius: BorderRadius.xs,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
});
