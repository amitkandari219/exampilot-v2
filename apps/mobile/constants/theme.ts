const darkColors = {
  // V4 core palette
  background: '#0B1120',
  surface: '#131C31',
  surfaceLight: '#182036',     // alias kept for backward compat
  primary: '#3ECFB4',
  primaryDim: '#0891B2',
  text: '#E8ECF4',
  textSecondary: '#7B8BA5',
  textMuted: '#4A5568',
  border: '#1E2D4A',
  success: '#34D399',
  warning: '#F59E42',
  error: '#EF4444',
  card: '#182036',
  orange: '#F97316',
  purple: '#A78BFA',
  recoveryBg: '#065F46',
  recoveryTrack: '#064E3B',
  recoveryLight: '#A7F3D0',
  recoveryMint: '#6EE7B7',
  primaryDark: '#1E2D4A',     // alias kept for backward compat
  // V4 new semantic tokens
  accent: '#3ECFB4',
  accentDim: 'rgba(62,207,180,0.12)',
  warn: '#F59E42',
  warnDim: 'rgba(245,158,66,0.12)',
  danger: '#EF4444',
  dangerDim: 'rgba(239,68,68,0.10)',
  green: '#34D399',
  greenDim: 'rgba(52,211,153,0.12)',
  purpleDim: 'rgba(167,139,250,0.12)',
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
  purple: '#7C3AED',
  recoveryBg: '#D1FAE5',
  recoveryTrack: '#A7F3D0',
  recoveryLight: '#065F46',
  recoveryMint: '#059669',
  primaryDark: '#BFDBFE',
  // V4 new semantic tokens (light variants)
  accent: '#0891B2',
  accentDim: 'rgba(8,145,178,0.10)',
  warn: '#D97706',
  warnDim: 'rgba(217,119,6,0.10)',
  danger: '#DC2626',
  dangerDim: 'rgba(220,38,38,0.08)',
  green: '#059669',
  greenDim: 'rgba(5,150,105,0.10)',
  purpleDim: 'rgba(124,58,237,0.10)',
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
