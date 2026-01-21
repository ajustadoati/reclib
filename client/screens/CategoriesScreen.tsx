import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp } from "react-native-reanimated";

import { CategoryTile } from "@/components/CategoryTile";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Category, CATEGORIES } from "@/types/recommendation";
import { getCategoryCounts } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CategoryData {
  category: Category;
  count: number;
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const loadCategories = useCallback(async () => {
    const counts = await getCategoryCounts();
    const data: CategoryData[] = CATEGORIES.map((category) => ({
      category,
      count: counts[category],
    }));
    setCategoriesData(data);
    setTotalCount(Object.values(counts).reduce((a, b) => a + b, 0));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleCategoryPress = (category: Category) => {
    navigation.navigate("CategoryList", { category });
  };

  const handleAddPress = () => {
    navigation.navigate("AddRecommendation");
  };

  const renderItem = useCallback(
    ({ item, index }: { item: CategoryData; index: number }) => (
      <Animated.View
        entering={FadeInUp.delay(index * 80).duration(400)}
        style={styles.tileWrapper}
      >
        <CategoryTile
          category={item.category}
          count={item.count}
          onPress={() => handleCategoryPress(item.category)}
        />
      </Animated.View>
    ),
    []
  );

  const renderEmptyState = () => {
    if (totalCount === 0) {
      return <EmptyState type="categories" />;
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={categoriesData}
        renderItem={renderItem}
        keyExtractor={(item) => item.category}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl + 80,
          },
          totalCount === 0 && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      <FloatingAddButton
        onPress={handleAddPress}
        bottom={tabBarHeight + Spacing.lg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  tileWrapper: {
    flex: 1,
    maxWidth: "50%",
  },
});
