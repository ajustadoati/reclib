import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { Recommendation, generateSmartLink, getPlatformName } from "@/types/recommendation";
import { getRecommendationById, formatTimeAgo, deleteRecommendation } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "Detail">;

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { id } = route.params;

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const loadRecommendation = useCallback(async () => {
    const data = await getRecommendationById(id);
    setRecommendation(data);
  }, [id]);

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleEdit}
            style={styles.headerButton}
          >
            <Feather name="edit-2" size={20} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <Feather name="trash-2" size={20} color={theme.error} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, theme, recommendation]);

  const handleEdit = () => {
    if (recommendation) {
      navigation.navigate("AddRecommendation", { editId: recommendation.id });
    }
  };

  const handleDelete = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Delete this recommendation?")) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Delete Recommendation",
        "Are you sure you want to delete this?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete },
        ]
      );
    }
  };

  const performDelete = async () => {
    if (recommendation) {
      await deleteRecommendation(recommendation.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    }
  };

  const handleShare = async () => {
    if (!recommendation) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const smartLink = recommendation.platformUrl || generateSmartLink(recommendation.title, recommendation.category);
    const shareText = `Check out "${recommendation.title}" - ${smartLink}`;

    if (Platform.OS === "web") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: recommendation.title,
            text: shareText,
          });
        } catch (e) {
          console.log("Share cancelled");
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      }
    } else {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(smartLink, {
          dialogTitle: `Share: ${recommendation.title}`,
        });
      }
    }
  };

  const handleOpenLink = async () => {
    if (!recommendation) return;
    const url = recommendation.platformUrl || generateSmartLink(recommendation.title, recommendation.category);
    await Linking.openURL(url);
  };

  if (!recommendation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const platformName = recommendation.platformName || getPlatformName(recommendation.category);
  const platformUrl = recommendation.platformUrl || generateSmartLink(recommendation.title, recommendation.category);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl + 80,
          },
        ]}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          {recommendation.imageUri ? (
            <Image
              source={{ uri: recommendation.imageUri }}
              style={styles.image}
              contentFit="cover"
            />
          ) : null}

          <CategoryBadge category={recommendation.category} />

          <ThemedText style={styles.title}>{recommendation.title}</ThemedText>

          <Pressable onPress={handleOpenLink} style={styles.linkRow}>
            <Feather name="external-link" size={16} color={theme.link} />
            <ThemedText style={[styles.linkText, { color: theme.link }]}>
              Open on {platformName}
            </ThemedText>
          </Pressable>

          {recommendation.notes ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Notes
              </ThemedText>
              <ThemedText style={styles.notes}>{recommendation.notes}</ThemedText>
            </View>
          ) : null}

          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <Feather name="clock" size={14} color={theme.textTertiary} />
              <ThemedText style={[styles.metaText, { color: theme.textTertiary }]}>
                Added {formatTimeAgo(recommendation.createdAt)}
              </ThemedText>
            </View>
            {recommendation.updatedAt !== recommendation.createdAt ? (
              <View style={styles.metaRow}>
                <Feather name="edit-3" size={14} color={theme.textTertiary} />
                <ThemedText style={[styles.metaText, { color: theme.textTertiary }]}>
                  Modified {formatTimeAgo(recommendation.updatedAt)}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <Pressable
        onPress={handleShare}
        style={[
          styles.shareButton,
          { backgroundColor: theme.accent, bottom: insets.bottom + Spacing.xl },
          Shadows.fab,
        ]}
        testID="button-share"
      >
        <Feather name="share" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    backgroundColor: "#E8E8E6",
  },
  title: {
    ...Typography.display,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    paddingVertical: Spacing.sm,
  },
  linkText: {
    ...Typography.body,
    fontWeight: "500",
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  notes: {
    ...Typography.body,
    lineHeight: 26,
  },
  metaSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E6",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  metaText: {
    ...Typography.caption,
    marginLeft: Spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  shareButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
