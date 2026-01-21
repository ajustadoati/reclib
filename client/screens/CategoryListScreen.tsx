import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { RecommendationCard } from "@/components/RecommendationCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Recommendation } from "@/types/recommendation";
import { getRecommendationsByCategory, deleteRecommendation } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "CategoryList">;

export default function CategoryListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category } = route.params;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    const data = await getRecommendationsByCategory(category);
    setRecommendations(data);
    setIsLoading(false);
  }, [category]);

  useFocusEffect(
    useCallback(() => {
      loadRecommendations();
    }, [loadRecommendations])
  );

  const handleCardPress = (recommendation: Recommendation) => {
    navigation.navigate("Detail", { id: recommendation.id });
  };

  const handleCardLongPress = async (recommendation: Recommendation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteRecommendation(recommendation.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadRecommendations();
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
      return <SkeletonLoader count={3} />;
    }
    return <EmptyState type="category" categoryName={category} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          recommendations.length === 0 && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
});
