import React from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search recommendations...",
}: SearchBarProps) {
  const { theme } = useTheme();
  const isFocused = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      isFocused.value ? theme.link : theme.border,
      { duration: 150 }
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name="search"
        size={20}
        color={theme.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        onFocus={() => {
          isFocused.value = true;
        }}
        onBlur={() => {
          isFocused.value = false;
        }}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        testID="input-search"
      />
      {value.length > 0 ? (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Feather name="x" size={18} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    padding: 0,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
