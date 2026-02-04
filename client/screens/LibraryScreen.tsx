import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { RecommendationCard } from "@/components/RecommendationCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Recommendation } from "@/types/recommendation";
import { getAllRecommendations, searchRecommendations, deleteRecommendation, getSettings } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const loadRecommendations = useCallback(async () => {
    const data = await getAllRecommendations();
    const settings = await getSettings();

    // Apply sorting based on settings
    const sortedData = [...data].sort((a, b) => {
      switch (settings.sortOrder) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "category":
          const catCompare = a.category.localeCompare(b.category);
          if (catCompare !== 0) return catCompare;
          return b.createdAt - a.createdAt; // Within same category, sort by recent
        case "recent":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    setRecommendations(sortedData);
    setFilteredRecommendations(sortedData);
    setIsLoading(false);
  }, []);

  const handleToggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) {
        // Closing search - clear query
        setSearchQuery("");
        loadRecommendations();
      }
      return !prev;
    });
  }, [loadRecommendations]);

  useFocusEffect(
    useCallback(() => {
      loadRecommendations();
    }, [loadRecommendations])
  );

  // Update header with search toggle
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={handleToggleSearch}
            style={styles.headerButton}
          >
            <Feather name={showSearch ? "x" : "search"} size={22} color={theme.text} />
          </Pressable>
        ),
      });
    }, [navigation, showSearch, theme.text, handleToggleSearch])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecommendations();
    setIsRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredRecommendations(recommendations);
    } else {
      const results = await searchRecommendations(query);
      setFilteredRecommendations(results);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredRecommendations(recommendations);
  };

  const handleCardPress = (recommendation: Recommendation) => {
    navigation.navigate("Detail", { id: recommendation.id });
  };

  const handleCardLongPress = async (recommendation: Recommendation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteRecommendation(recommendation.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadRecommendations();
  };

  const handleAddPress = () => {
    navigation.navigate("AddRecommendation");
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Recommendation; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <RecommendationCard
          recommendation={item}
          onPress={() => handleCardPress(item)}
          onLongPress={() => handleCardLongPress(item)}
        />
      </Animated.View>
    ),
    []
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return <SkeletonLoader count={4} />;
    }
    return <EmptyState type={searchQuery ? "search" : "library"} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredRecommendations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl + 80,
          },
          filteredRecommendations.length === 0 && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.link}
          />
        }
        ListHeaderComponent={
          showSearch ? (
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearch}
                onClear={handleClearSearch}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FloatingAddButton
        onPress={handleAddPress}
        bottom={tabBarHeight + Spacing.lg}
      />
    </View>
  );
}

export function LibraryHeaderLeft() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate("Settings")}
      style={styles.headerButton}
    >
      <Feather name="settings" size={22} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
