import { useTheme } from '@react-navigation/native';

export function useThemeColor(props, colorName) {
  const theme = useTheme();
  return theme.colors[colorName];
} 