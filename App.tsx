//import "setimmediate";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./api/firebase";
import { View } from "react-native";
import { User } from "firebase/auth";
import { initializeRateLimiter } from "./api/RateLimiter";

// Import screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MealPlanScreen from "./screens/MealPlanScreen";
import ShoppingListScreen from "./screens/ShoppingListScreen";
import NearbyStoresScreen from "./screens/NearbyStoresScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Define types for navigation
type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

type TabParamList = {
  Home: undefined;
  "Meal Plan": undefined;
  "Shop List": undefined;
  Stores: undefined;
  Profile: undefined;
};

// Create strongly typed navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Type definition for tab bar icon props
interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
  route: {
    name: keyof TabParamList;
  };
}

// Main tab navigator for authenticated users
function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Meal Plan") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Shop List") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Stores") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: focused ? 65 : size,
                height: focused ? 70 : size,
                borderTopLeftRadius: focused ? 30 : 0,
                borderTopRightRadius: focused ? 30 : 0,
                backgroundColor: focused ? "#6200ea" : "transparent",
                overflow: "hidden",
                paddingBottom: focused ? 5 : 0,
                paddingTop: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name={iconName}
                size={size}
                color={focused ? "white" : color}
              />
            </View>
          );
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          color: "gray",
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 0,
          height: 50,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Meal Plan" component={MealPlanScreen} />
      <Tab.Screen name="Shop List" component={ShoppingListScreen} />
      <Tab.Screen name="Stores" component={NearbyStoresScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App(): JSX.Element {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  function onAuthStateChanged(user: User | null): void {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    initializeRateLimiter();
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <PaperProvider>
      <NavigationContainer>
        {user ? (
          // Stack navigator for authenticated users
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          // Stack navigator for unauthenticated users (login flow)
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
