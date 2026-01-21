import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform as RNPlatform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/lib/i18n";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import {
  Category,
  Platform,
  CATEGORIES,
  PLATFORM_BY_CATEGORY,
  AIRecognitionResult,
  getDefaultPlatform,
  generateSmartLink,
} from "@/types/recommendation";
import {
  saveRecommendation,
  updateRecommendation,
  getRecommendationById,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

import successScanImage from "../assets/images/success-scan.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "AddRecommendation">;

export default function AddRecommendationScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const editId = route.params?.editId;

  const [mode, setMode] = useState<"choose" | "scan" | "manual">("choose");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Books");
  const [platforms, setPlatforms] = useState<Platform[]>([getDefaultPlatform("Books")]);
  const [notes, setNotes] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIRecognitionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      loadExistingRecommendation();
    }
  }, [editId]);

  const loadExistingRecommendation = async () => {
    if (!editId) return;
    const existing = await getRecommendationById(editId);
    if (existing) {
      setTitle(existing.title);
      setCategory(existing.category);
      setPlatforms(existing.platforms || [getDefaultPlatform(existing.category)]);
      setNotes(existing.notes || "");
      setPlatformUrl(existing.platformUrl || "");
      setImageUri(existing.imageUri);
      setMode("manual");
    }
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setPlatforms([getDefaultPlatform(newCategory)]);
  };

  const togglePlatform = (platform: Platform) => {
    Haptics.selectionAsync();
    setPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev;
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleSave = async () => {
    if (!title.trim() || platforms.length === 0) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const data = {
        title: title.trim(),
        category,
        platforms,
        notes: notes.trim() || undefined,
        platformUrl: platformUrl.trim() || generateSmartLink(title.trim(), platforms[0]),
        imageUri,
      };

      if (editId) {
        await updateRecommendation(editId, data);
      } else {
        await saveRecommendation(data);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving recommendation:", error);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: editId ? t("add.edit.title") : t("add.title"),
      headerRight: () =>
        mode !== "choose" ? (
          <Pressable
            onPress={handleSave}
            disabled={!title.trim() || isSaving}
            style={styles.headerButton}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.link} />
            ) : (
              <ThemedText
                style={[
                  styles.saveButton,
                  { color: title.trim() ? theme.link : theme.textTertiary },
                ]}
              >
                {t("common.save")}
              </ThemedText>
            )}
          </Pressable>
        ) : null,
    });
  }, [navigation, mode, title, category, platforms, notes, platformUrl, imageUri, isSaving, theme, editId, t]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setMode("scan");
      processImage(asset.base64 || "", asset.uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      if (RNPlatform.OS === "web") {
        alert("Camera permission is required");
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setMode("scan");
      processImage(asset.base64 || "", asset.uri);
    }
  };

  const processImage = async (base64: string, uri: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${getApiUrl()}api/recognize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (response.ok) {
        const result: AIRecognitionResult = await response.json();
        setAiResult(result);
        setTitle(result.title);
        setCategory(result.category);
        if (result.platform) {
          setPlatforms([result.platform]);
        } else {
          setPlatforms([getDefaultPlatform(result.category)]);
        }
        if (result.platformUrl) {
          setPlatformUrl(result.platformUrl);
        }
      } else {
        setMode("manual");
      }
    } catch (error) {
      console.error("Recognition failed:", error);
      setMode("manual");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseResult = () => {
    setMode("manual");
  };

  const availablePlatforms = PLATFORM_BY_CATEGORY[category] || [];

  const renderChooseMode = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.chooseContainer}>
      <ThemedText style={styles.chooseTitle}>
        {t("add.choose.title")}
      </ThemedText>

      <Pressable
        onPress={handlePickImage}
        style={[styles.optionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        testID="button-scan-image"
      >
        <View style={[styles.optionIcon, { backgroundColor: `${theme.link}15` }]}>
          <Feather name="image" size={28} color={theme.link} />
        </View>
        <View style={styles.optionContent}>
          <ThemedText style={styles.optionTitle}>{t("add.scan.title")}</ThemedText>
          <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
            {t("add.scan.subtitle")}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color={theme.textTertiary} />
      </Pressable>

      <Pressable
        onPress={() => setMode("manual")}
        style={[styles.optionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        testID="button-enter-manually"
      >
        <View style={[styles.optionIcon, { backgroundColor: `${theme.accent}15` }]}>
          <Feather name="edit-3" size={28} color={theme.accent} />
        </View>
        <View style={styles.optionContent}>
          <ThemedText style={styles.optionTitle}>{t("add.manual.title")}</ThemedText>
          <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
            {t("add.manual.subtitle")}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color={theme.textTertiary} />
      </Pressable>

      {RNPlatform.OS !== "web" ? (
        <Pressable
          onPress={handleTakePhoto}
          style={[styles.optionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          testID="button-take-photo"
        >
          <View style={[styles.optionIcon, { backgroundColor: `${theme.success}15` }]}>
            <Feather name="camera" size={28} color={theme.success} />
          </View>
          <View style={styles.optionContent}>
            <ThemedText style={styles.optionTitle}>{t("add.camera.title")}</ThemedText>
            <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
              {t("add.camera.subtitle")}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={theme.textTertiary} />
        </Pressable>
      ) : null}
    </Animated.View>
  );

  const renderScanMode = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.scanContainer}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
      ) : null}

      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
          <ThemedText style={[styles.processingText, { color: theme.textSecondary }]}>
            {t("add.processing")}
          </ThemedText>
        </View>
      ) : aiResult ? (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.resultContainer}>
          <Image source={successScanImage} style={styles.successIcon} contentFit="contain" />
          <ThemedText style={styles.resultTitle}>{t("add.found")}</ThemedText>

          <View style={[styles.resultCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={styles.resultLabel}>{t("add.field.title")}</ThemedText>
            <ThemedText style={styles.resultValue}>{aiResult.title}</ThemedText>

            <ThemedText style={[styles.resultLabel, { marginTop: Spacing.md }]}>{t("add.field.category")}</ThemedText>
            <ThemedText style={styles.resultValue}>{t(`category.${aiResult.category}`)}</ThemedText>

            {aiResult.author ? (
              <>
                <ThemedText style={[styles.resultLabel, { marginTop: Spacing.md }]}>Creator</ThemedText>
                <ThemedText style={styles.resultValue}>{aiResult.author}</ThemedText>
              </>
            ) : null}

            <ThemedText style={[styles.resultLabel, { marginTop: Spacing.md }]}>{t("add.field.platform")}</ThemedText>
            <ThemedText style={[styles.resultValue, { color: theme.link }]}>
              {aiResult.platform || getDefaultPlatform(aiResult.category)}
            </ThemedText>
          </View>

          <Button onPress={handleUseResult} style={styles.useButton}>
            {t("add.useThis")}
          </Button>
        </Animated.View>
      ) : null}
    </Animated.View>
  );

  const renderManualMode = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {imageUri ? (
        <Pressable onPress={handlePickImage}>
          <Image source={{ uri: imageUri }} style={styles.thumbnailImage} contentFit="cover" />
        </Pressable>
      ) : null}

      <View style={styles.formGroup}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {t("add.field.title")} *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("add.field.title.placeholder")}
          placeholderTextColor={theme.textTertiary}
          autoFocus={!editId}
          testID="input-title"
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {t("add.field.category")}
        </ThemedText>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: category === cat ? theme.link : theme.backgroundDefault,
                  borderColor: category === cat ? theme.link : theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryChipText,
                  { color: category === cat ? "#FFFFFF" : theme.text },
                ]}
              >
                {t(`category.${cat}`)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {t("add.field.platform")} ({platforms.length} selected)
        </ThemedText>
        <View style={styles.platformRow}>
          {availablePlatforms.map((plat) => {
            const isSelected = platforms.includes(plat);
            return (
              <Pressable
                key={plat}
                onPress={() => togglePlatform(plat)}
                style={[
                  styles.platformChip,
                  {
                    backgroundColor: isSelected ? theme.link : theme.backgroundDefault,
                    borderColor: isSelected ? theme.link : theme.border,
                  },
                ]}
              >
                {isSelected ? (
                  <Feather name="check" size={14} color="#FFFFFF" style={styles.checkIcon} />
                ) : null}
                <ThemedText
                  style={[
                    styles.platformChipText,
                    { color: isSelected ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {plat}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {t("add.field.notes")}
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t("add.field.notes.placeholder")}
          placeholderTextColor={theme.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="input-notes"
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {t("add.field.url")}
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text },
          ]}
          value={platformUrl}
          onChangeText={setPlatformUrl}
          placeholder="https://..."
          placeholderTextColor={theme.textTertiary}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          testID="input-url"
        />
        <ThemedText style={[styles.hint, { color: theme.textTertiary }]}>
          {t("add.field.url.hint")}
        </ThemedText>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.xl, paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "choose" ? renderChooseMode() : null}
        {mode === "scan" ? renderScanMode() : null}
        {mode === "manual" ? renderManualMode() : null}
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
  headerButton: {
    padding: Spacing.sm,
  },
  saveButton: {
    ...Typography.headline,
  },
  chooseContainer: {
    paddingTop: Spacing["2xl"],
  },
  chooseTitle: {
    ...Typography.title,
    marginBottom: Spacing["2xl"],
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.caption,
  },
  scanContainer: {
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    backgroundColor: "#E8E8E6",
  },
  processingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  processingText: {
    ...Typography.body,
    marginTop: Spacing.lg,
  },
  resultContainer: {
    alignItems: "center",
    width: "100%",
  },
  successIcon: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    ...Typography.title,
    marginBottom: Spacing.xl,
  },
  resultCard: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  resultLabel: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  resultValue: {
    ...Typography.headline,
  },
  useButton: {
    width: "100%",
  },
  thumbnailImage: {
    width: "100%",
    height: 150,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    backgroundColor: "#E8E8E6",
  },
  formGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    ...Typography.body,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  hint: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  categoryChipText: {
    ...Typography.small,
    fontWeight: "500",
  },
  platformRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  platformChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  platformChipText: {
    ...Typography.small,
    fontWeight: "500",
  },
  checkIcon: {
    marginRight: 4,
  },
});
