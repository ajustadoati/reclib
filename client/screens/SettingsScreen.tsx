import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Category, CATEGORIES } from "@/types/recommendation";
import { getSettings, updateSettings, AppSettings, getAllRecommendations } from "@/lib/storage";

type SortOrder = "recent" | "alphabetical" | "category";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "alphabetical", label: "A-Z" },
  { value: "category", label: "By Category" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<AppSettings>({
    displayName: "Me",
    defaultCategory: "Books",
    sortOrder: "recent",
  });
  const [totalCount, setTotalCount] = useState(0);

  const loadSettings = useCallback(async () => {
    const data = await getSettings();
    setSettings(data);
    const recommendations = await getAllRecommendations();
    setTotalCount(recommendations.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleNameChange = async (name: string) => {
    setSettings((prev) => ({ ...prev, displayName: name }));
    await updateSettings({ displayName: name });
  };

  const handleCategoryChange = async (category: Category) => {
    Haptics.selectionAsync();
    setSettings((prev) => ({ ...prev, defaultCategory: category }));
    await updateSettings({ defaultCategory: category });
  };

  const handleSortChange = async (sortOrder: SortOrder) => {
    Haptics.selectionAsync();
    setSettings((prev) => ({ ...prev, sortOrder }));
    await updateSettings({ sortOrder });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.xl, paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Profile
            </ThemedText>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: `${theme.link}20` }]}>
                  <ThemedText style={[styles.avatarText, { color: theme.link }]}>
                    {settings.displayName.slice(0, 2).toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  Display Name
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text },
                  ]}
                  value={settings.displayName}
                  onChangeText={handleNameChange}
                  placeholder="Your name"
                  placeholderTextColor={theme.textTertiary}
                  testID="input-display-name"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Preferences
            </ThemedText>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  Default Category
                </ThemedText>
                <View style={styles.optionsRow}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => handleCategoryChange(cat)}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: settings.defaultCategory === cat ? theme.link : theme.backgroundSecondary,
                          borderColor: settings.defaultCategory === cat ? theme.link : theme.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.optionChipText,
                          { color: settings.defaultCategory === cat ? "#FFFFFF" : theme.text },
                        ]}
                      >
                        {cat}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  Sort Order
                </ThemedText>
                {SORT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSortChange(option.value)}
                    style={styles.radioRow}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: settings.sortOrder === option.value ? theme.link : theme.border },
                      ]}
                    >
                      {settings.sortOrder === option.value ? (
                        <View style={[styles.radioInner, { backgroundColor: theme.link }]} />
                      ) : null}
                    </View>
                    <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              About
            </ThemedText>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>Version</ThemedText>
                <ThemedText style={[styles.aboutValue, { color: theme.textSecondary }]}>
                  1.0.0
                </ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>Total Recommendations</ThemedText>
                <ThemedText style={[styles.aboutValue, { color: theme.textSecondary }]}>
                  {totalCount}
                </ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Pressable style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>Privacy Policy</ThemedText>
                <Feather name="external-link" size={16} color={theme.textTertiary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Pressable style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>Terms of Service</ThemedText>
                <Feather name="external-link" size={16} color={theme.textTertiary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: theme.textTertiary }]}>
              Recommendation Vault
            </ThemedText>
            <ThemedText style={[styles.footerSubtext, { color: theme.textTertiary }]}>
              Your personal curator's notebook
            </ThemedText>
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...Typography.title,
    fontWeight: "700",
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    ...Typography.body,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  optionChipText: {
    ...Typography.small,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    ...Typography.body,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  aboutLabel: {
    ...Typography.body,
  },
  aboutValue: {
    ...Typography.body,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  footerText: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    ...Typography.caption,
  },
});
