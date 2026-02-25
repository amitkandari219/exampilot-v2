const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  primary: '#22D3EE',
  primaryDim: '#0891B2',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  card: '#1E293B',
  orange: '#F97316',
  purple: '#A855F7',
  recoveryBg: '#065F46',
  recoveryTrack: '#064E3B',
  recoveryLight: '#A7F3D0',
  recoveryMint: '#6EE7B7',
  primaryDark: '#1E3A5F',
} as const;

const lightColors = {
  background: '#E0DCD4',
  surface: '#EAE6DF',
  surfaceLight: '#D6D2CA',
  primary: '#0891B2',
  primaryDim: '#22D3EE',
  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#78716C',
  border: '#D6D3CD',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  card: '#F5F2ED',
  orange: '#EA580C',
  purple: '#9333EA',
  recoveryBg: '#D1FAE5',
  recoveryTrack: '#A7F3D0',
  recoveryLight: '#065F46',
  recoveryMint: '#059669',
  primaryDark: '#BFDBFE',
} as const;

const shared = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  fontSize: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
} as const;

export const darkTheme = { colors: darkColors, ...shared } as const;
export const lightTheme = { colors: lightColors, ...shared } as const;

export type Theme = {
  colors: { [K in keyof typeof darkColors]: string };
  spacing: typeof shared.spacing;
  borderRadius: typeof shared.borderRadius;
  fontSize: typeof shared.fontSize;
};

// Backward compat — default export is dark theme
export const theme = darkTheme;
