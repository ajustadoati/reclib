import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textTertiary: "#A0A0A0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B6B6B",
    tabIconSelected: "#2D5F5D",
    link: "#2D5F5D",
    accent: "#D97757",
    backgroundRoot: "#FAFAF8",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F5F5F3",
    backgroundTertiary: "#EEEEEC",
    border: "#E8E8E6",
    error: "#C84141",
    success: "#2D5F5D",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    textTertiary: "#6B7075",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#5BA8A5",
    link: "#5BA8A5",
    accent: "#E08B6D",
    backgroundRoot: "#1A1C1E",
    backgroundDefault: "#242628",
    backgroundSecondary: "#2E3032",
    backgroundTertiary: "#38393B",
    border: "#3A3C3E",
    error: "#E05555",
    success: "#5BA8A5",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },
  headline: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Inter_400Regular",
    sansMedium: "Inter_500Medium",
    sansSemiBold: "Inter_600SemiBold",
    sansBold: "Inter_700Bold",
  },
  android: {
    sans: "Inter_400Regular",
    sansMedium: "Inter_500Medium",
    sansSemiBold: "Inter_600SemiBold",
    sansBold: "Inter_700Bold",
  },
  default: {
    sans: "Inter_400Regular",
    sansMedium: "Inter_500Medium",
    sansSemiBold: "Inter_600SemiBold",
    sansBold: "Inter_700Bold",
  },
  web: {
    sans: "Inter_400Regular, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    sansMedium: "Inter_500Medium, system-ui, sans-serif",
    sansSemiBold: "Inter_600SemiBold, system-ui, sans-serif",
    sansBold: "Inter_700Bold, system-ui, sans-serif",
  },
});

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
};

export const CategoryColors: Record<string, string> = {
  Books: "#2D5F5D",
  Movies: "#D97757",
  Series: "#8B5CF6",
  TV: "#7B68C9",
  Music: "#E85D75",
  Podcasts: "#4A90A4",
  Links: "#3B82F6",
  Kids: "#F59E0B",
  Other: "#6B6B6B",
};
