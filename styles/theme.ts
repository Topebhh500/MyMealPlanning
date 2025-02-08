import { useTheme as usePaperTheme } from "react-native-paper";

export const useThemedStyles = () => {
  const theme = usePaperTheme();

  return {
    container: {
      backgroundColor: theme.colors.background,
    },
    surface: {
      backgroundColor: theme.colors.surface,
    },
    text: {
      color: theme.colors.text,
    },
    // Add more themed styles as needed
  };
};
