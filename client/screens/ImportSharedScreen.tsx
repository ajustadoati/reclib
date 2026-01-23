import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/lib/i18n";
import { getApiUrl } from "@/lib/query-client";
import { saveRecommendation } from "@/lib/storage";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Category, Platform as RecommendationPlatform } from "@/types/recommendation";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "ImportShared">;

interface SharedRecommendation {
  title: string;
  category: Category;
  platforms: RecommendationPlatform[];
  notes: string | null;
  platformUrl: string | null;
  imageBase64: string | null;
  sharedAt: number;
}

export default function ImportSharedScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { shareId } = route.params;

  const [shared, setShared] = useState<SharedRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t("import.title"),
    });
  }, [navigation, t]);

  useEffect(() => {
    fetchSharedRecommendation();
  }, [shareId]);

  const fetchSharedRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/share/${shareId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(t("import.notFound"));
        } else {
          setError(t("import.error"));
        }
        return;
      }
      
      const data = await response.json();
      setShared(data);
    } catch (err) {
      console.error("Failed to fetch shared recommendation:", err);
      setError(t("import.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!shared) return;
    
    setImporting(true);
    try {
      await saveRecommendation({
        title: shared.title,
        category: shared.category,
        platforms: shared.platforms,
        notes: shared.notes || undefined,
        platformUrl: shared.platformUrl || undefined,
        imageUri: shared.imageBase64 ? `data:image/jpeg;base64,${shared.imageBase64}` : undefined,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (Platform.OS === "web") {
        alert(t("import.success"));
      } else {
        Alert.alert(t("import.success"), t("import.successMessage"));
      }
      
      navigation.navigate("Main");
    } catch (err) {
      console.error("Failed to import recommendation:", err);
      if (Platform.OS === "web") {
        alert(t("import.importError"));
      } else {
        Alert.alert(t("common.error"), t("import.importError"));
      }
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText>{t("common.loading")}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            {error}
          </ThemedText>
          <Button
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{ marginTop: Spacing.lg }}
          >
            {t("common.goBack")}
          </Button>
        </View>
      </ThemedView>
    );
  }

  if (!shared) return null;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl + 100,
          },
        ]}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Feather name="share-2" size={14} color="#FFFFFF" />
            <ThemedText style={styles.badgeText}>
              {t("import.sharedWithYou")}
            </ThemedText>
          </View>

          {shared.imageBase64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${shared.imageBase64}` }}
              style={styles.image}
              contentFit="cover"
            />
          ) : null}

          <CategoryBadge category={shared.category} />

          <ThemedText style={styles.title}>{shared.title}</ThemedText>

          {shared.platforms && shared.platforms.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {t("detail.platforms")}
              </ThemedText>
              <View style={styles.platformsList}>
                {shared.platforms.map((platform) => (
                  <View
                    key={platform}
                    style={[styles.platformTag, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <ThemedText style={styles.platformTagText}>
                      {platform}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {shared.notes ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {t("detail.notes")}
              </ThemedText>
              <ThemedText style={styles.notes}>{shared.notes}</ThemedText>
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg, backgroundColor: theme.backgroundRoot }]}>
        <Button
          onPress={handleImport}
          disabled={importing}
          style={styles.importButton}
        >
          {importing ? t("import.importing") : t("import.addToLibrary")}
        </Button>
      </View>
    </ThemedView>
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
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  badgeText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  platformsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  platformTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  platformTagText: {
    ...Typography.small,
  },
  notes: {
    ...Typography.body,
    lineHeight: 26,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  importButton: {
    width: "100%",
  },
});
