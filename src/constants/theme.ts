/**
 * Design System - Color Tokens
 * Based on design system guidelines
 */

export const colors = {
  // Neutral
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Primary (Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Success (Green)
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning (Amber)
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // Danger (Red)
  danger: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Info
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },
};

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  // Display: 36px, 700
  display: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
  },

  // Page title: 28px, 700
  pageTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },

  // Section heading: 20px, 600
  sectionHeading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },

  // Card heading: 16px, 600
  cardHeading: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },

  // Body: 14px, 400
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
  },

  // Large body: 16px, 400
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },

  // Small: 13px
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },

  // Caption: 12px
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
};
