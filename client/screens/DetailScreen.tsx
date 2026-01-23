import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Platform as RNPlatform, Linking, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/lib/i18n";
import { createShareLink, createWebShareLink } from "@/lib/linking";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { Recommendation, generateSmartLink, Platform, PLATFORM_URLS } from "@/types/recommendation";
import { getRecommendationById, formatTimeAgo, deleteRecommendation } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "Detail">;

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { id } = route.params;

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const loadRecommendation = useCallback(async () => {
    const data = await getRecommendationById(id);
    setRecommendation(data);
  }, [id]);

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t("detail.title"),
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
  }, [navigation, theme, recommendation, t]);

  const handleEdit = () => {
    if (recommendation) {
      navigation.navigate("AddRecommendation", { editId: recommendation.id });
    }
  };

  const handleDelete = () => {
    if (RNPlatform.OS === "web") {
      if (window.confirm(t("detail.delete.message"))) {
        performDelete();
      }
    } else {
      Alert.alert(
        t("detail.delete.title"),
        t("detail.delete.message"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("common.delete"), style: "destructive", onPress: performDelete },
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

    const deepLink = RNPlatform.OS === "web" 
      ? createWebShareLink(recommendation.id)
      : createShareLink(recommendation.id);
    
    const platforms = recommendation.platforms || [];
    const platformInfo = platforms.length > 0 ? ` (${platforms.join(", ")})` : "";
    const shareText = `${t("share.checkOut")} "${recommendation.title}"${platformInfo}\n\n${t("share.openIn")}: ${deepLink}`;

    if (RNPlatform.OS === "web") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: recommendation.title,
            text: shareText,
            url: deepLink,
          });
        } catch (e) {
          console.log("Share cancelled");
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        alert(t("share.copied"));
      }
    } else {
      try {
        await Share.share({
          message: shareText,
          title: recommendation.title,
        });
      } catch (e) {
        console.log("Share failed:", e);
      }
    }
  };

  const handleOpenPlatform = async (platform: Platform) => {
    if (!recommendation) return;
    const url = PLATFORM_URLS[platform] 
      ? generateSmartLink(recommendation.title, platform)
      : recommendation.platformUrl || "";
    if (url) {
      await Linking.openURL(url);
    }
  };

  const handleCopyLink = async () => {
    if (!recommendation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const deepLink = createShareLink(recommendation.id);
    await Clipboard.setStringAsync(deepLink);
    
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 3000);
  };

  if (!recommendation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const platforms = recommendation.platforms || [];

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

          {platforms.length > 0 ? (
            <View style={styles.platformsSection}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {t("detail.openOn")}
              </ThemedText>
              <View style={styles.platformsList}>
                {platforms.map((platform) => (
                  <Pressable
                    key={platform}
                    onPress={() => handleOpenPlatform(platform)}
                    style={[styles.platformLink, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <Feather name="external-link" size={14} color={theme.link} />
                    <ThemedText style={[styles.platformLinkText, { color: theme.link }]}>
                      {platform}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {recommendation.notes ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {t("detail.notes")}
              </ThemedText>
              <ThemedText style={styles.notes}>{recommendation.notes}</ThemedText>
            </View>
          ) : null}

          <View style={[styles.metaSection, { borderTopColor: theme.border }]}>
            <View style={styles.metaRow}>
              <Feather name="clock" size={14} color={theme.textTertiary} />
              <ThemedText style={[styles.metaText, { color: theme.textTertiary }]}>
                {t("detail.added")} {formatTimeAgo(recommendation.createdAt, language)}
              </ThemedText>
            </View>
            {recommendation.updatedAt !== recommendation.createdAt ? (
              <View style={styles.metaRow}>
                <Feather name="edit-3" size={14} color={theme.textTertiary} />
                <ThemedText style={[styles.metaText, { color: theme.textTertiary }]}>
                  {t("detail.modified")} {formatTimeAgo(recommendation.updatedAt, language)}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={handleCopyLink}
          style={[
            styles.copyButton,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
            Shadows.small,
          ]}
          testID="button-copy-link"
        >
          <Feather name="copy" size={18} color={theme.accent} />
          <ThemedText style={[styles.copyButtonText, { color: theme.accent }]}>
            {t("share.copyLink")}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={[
            styles.shareButton,
            { backgroundColor: theme.accent },
            Shadows.fab,
          ]}
          testID="button-share"
        >
          <Feather name="share" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {showCopiedToast ? (
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={[
            styles.toast, 
            { 
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              top: insets.top + 60,
            }
          ]}
        >
          <Feather name="check-circle" size={18} color={theme.success} />
          <View style={styles.toastContent}>
            <ThemedText style={styles.toastTitle}>{t("share.copied")}</ThemedText>
            <ThemedText style={[styles.toastHint, { color: theme.textSecondary }]}>
              {t("share.copyHint")}
            </ThemedText>
          </View>
        </Animated.View>
      ) : null}
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
    marginBottom: Spacing.lg,
  },
  platformsSection: {
    marginBottom: Spacing["2xl"],
  },
  platformsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  platformLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  platformLinkText: {
    ...Typography.small,
    fontWeight: "500",
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
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  copyButtonText: {
    ...Typography.small,
    fontWeight: "600",
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    ...Typography.small,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  toastHint: {
    ...Typography.caption,
    lineHeight: 18,
  },
});
