import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DetailScreen from "@/screens/DetailScreen";
import AddRecommendationScreen from "@/screens/AddRecommendationScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import CategoryListScreen from "@/screens/CategoryListScreen";
import ImportSharedScreen from "@/screens/ImportSharedScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Category } from "@/types/recommendation";

export type RootStackParamList = {
  Main: undefined;
  Detail: { id: string };
  ImportShared: { shareId: string };
  AddRecommendation: { editId?: string } | undefined;
  Settings: undefined;
  CategoryList: { category: Category };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Details",
        }}
      />
      <Stack.Screen
        name="AddRecommendation"
        component={AddRecommendationScreen}
        options={{
          ...opaqueScreenOptions,
          presentation: "modal",
          headerTitle: "Add Recommendation",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...opaqueScreenOptions,
          presentation: "modal",
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={({ route }) => ({
          headerTitle: route.params.category,
        })}
      />
      <Stack.Screen
        name="ImportShared"
        component={ImportSharedScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Shared Recommendation",
        }}
      />
    </Stack.Navigator>
  );
}
