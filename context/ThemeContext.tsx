import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DefaultTheme,
  DarkTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("isDarkMode");
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    void loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem("isDarkMode", JSON.stringify(newTheme));
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  };

  const theme = isDarkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: "#6200ea",
          accent: "#03dac6",
          background: "#121212",
          surface: "#1e1e1e",
          text: "#ffffff",
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: "#6200ea",
          accent: "#03dac6",
        },
      };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
