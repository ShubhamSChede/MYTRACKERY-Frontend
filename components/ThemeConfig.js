// components/ThemeConfig.js
export const COLORS = {
    primary: '#8B4513',    // Dark brown - primary color
    primaryLight: '#A67B5B', // Lighter brown for hover states
    primaryDark: '#704214',  // Darker brown for active states
    primaryBg: '#8B4513/10', // 10% opacity brown for backgrounds
    
    secondary: '#D2B48C',  // Tan/light brown - secondary color
    secondaryLight: '#E6D2B8', // Lighter tan
    secondaryDark: '#BF9F76', // Darker tan
    
    white: '#FFFFFF',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      light: '#FFFFFF',
    },
    
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    border: {
      light: '#E0E0E0',
      medium: '#BDBDBD',
      dark: '#8B4513',
    },
    
    shadow: {
      color: '#000000',
      opacity: 0.1,
    },
  };
  
  export const SIZES = {
    base: 8,
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 24,
    
    radius: {
      small: 4,
      medium: 8,
      large: 12,
      extraLarge: 20,
      round: 999,
    },
    
    padding: {
      small: 8,
      medium: 16,
      large: 24,
    },
    
    margin: {
      small: 8,
      medium: 16,
      large: 24,
    },
  };
  
  export const FONTS = {
    light: 'System',
    regular: 'System',
    medium: 'System',
    bold: 'System',
  };
  
  export const SHADOWS = {
    small: {
      shadowColor: COLORS.shadow.color,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: COLORS.shadow.opacity,
      shadowRadius: 3.84,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.shadow.color,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: COLORS.shadow.opacity,
      shadowRadius: 6.27,
      elevation: 5,
    },
    large: {
      shadowColor: COLORS.shadow.color,
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: COLORS.shadow.opacity,
      shadowRadius: 9.11,
      elevation: 10,
    },
  };
  
  export default { COLORS, SIZES, FONTS, SHADOWS };