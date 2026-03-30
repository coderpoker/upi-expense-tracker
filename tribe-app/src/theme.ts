// =============================================
// Tribe — Design System Tokens
// =============================================

export const colors = {
  // Backgrounds
  bg: '#0A0A0F',
  bgCard: 'rgba(255, 255, 255, 0.05)',
  bgCardHover: 'rgba(255, 255, 255, 0.08)',
  bgGlass: 'rgba(255, 255, 255, 0.07)',
  bgInput: 'rgba(255, 255, 255, 0.06)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  textInverse: '#0A0A0F',

  // Accents
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDark: '#7C3AED',
  teal: '#2DD4BF',
  coral: '#FB7185',
  amber: '#FBBF24',
  lavender: '#C4B5FD',

  // Gradients
  gradientPurple: ['#8B5CF6', '#A78BFA'] as const,
  gradientPurpleTeal: ['#8B5CF6', '#2DD4BF'] as const,
  gradientCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(139, 92, 246, 0.5)',

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FB7185',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 32,
  display: 40,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 0,
  },
};
