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
import { useI18n } from "@/lib/i18n";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Category, CATEGORIES, Language } from "@/types/recommendation";
import { getSettings, updateSettings, AppSettings, getAllRecommendations } from "@/lib/storage";

type SortOrder = "recent" | "alphabetical" | "category";

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const [settings, setSettings] = useState<AppSettings>({
    displayName: "Me",
    defaultCategory: "Books",
    sortOrder: "recent",
    language: "en",
  });
  const [totalCount, setTotalCount] = useState(0);

  const SORT_OPTIONS: { value: SortOrder; labelKey: string }[] = [
    { value: "recent", labelKey: "settings.sort.recent" },
    { value: "alphabetical", labelKey: "settings.sort.alphabetical" },
    { value: "category", labelKey: "settings.sort.category" },
  ];

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

  const handleLanguageChange = async (lang: Language) => {
    Haptics.selectionAsync();
    setLanguage(lang);
    setSettings((prev) => ({ ...prev, language: lang }));
    await updateSettings({ language: lang });
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
              {t("settings.profile")}
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
                  {t("settings.displayName")}
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
              {t("settings.preferences")}
            </ThemedText>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  {t("settings.language")}
                </ThemedText>
                <View style={styles.languageRow}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => handleLanguageChange(option.value)}
                      style={[
                        styles.languageOption,
                        {
                          backgroundColor: language === option.value ? theme.link : theme.backgroundSecondary,
                          borderColor: language === option.value ? theme.link : theme.border,
                        },
                      ]}
                      testID={`button-language-${option.value}`}
                    >
                      <ThemedText style={styles.languageFlag}>{option.flag}</ThemedText>
                      <ThemedText
                        style={[
                          styles.languageLabel,
                          { color: language === option.value ? "#FFFFFF" : theme.text },
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  {t("settings.defaultCategory")}
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
                        {t(`category.${cat}`)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  {t("settings.sortOrder")}
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
                    <ThemedText style={styles.radioLabel}>{t(option.labelKey)}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t("settings.about")}
            </ThemedText>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>{t("settings.version")}</ThemedText>
                <ThemedText style={[styles.aboutValue, { color: theme.textSecondary }]}>
                  1.0.0
                </ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>{t("settings.total")}</ThemedText>
                <ThemedText style={[styles.aboutValue, { color: theme.textSecondary }]}>
                  {totalCount}
                </ThemedText>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Pressable style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>{t("settings.privacy")}</ThemedText>
                <Feather name="external-link" size={16} color={theme.textTertiary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Pressable style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>{t("settings.terms")}</ThemedText>
                <Feather name="external-link" size={16} color={theme.textTertiary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: theme.textTertiary }]}>
              {t("settings.footer")}
            </ThemedText>
            <ThemedText style={[styles.footerSubtext, { color: theme.textTertiary }]}>
              {t("settings.footerSub")}
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
  languageRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  languageOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageLabel: {
    ...Typography.body,
    fontWeight: "600",
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
