/**
 * Theme constants and configuration
 */

import { Theme } from '@/types';

export const lightTheme: Theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
    },
  },
};

export const signalColors = {
  oversold: '#10b981', // Green
  overbought: '#ef4444', // Red
  neutral: '#64748b', // Gray
};

export const chartColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  grid: '#e2e8f0',
  gridDark: '#334155',
};

export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
// /* CSS HEX */
// --dark-moss-green: #606c38ff;
// --pakistan-green: #283618ff;
// --cornsilk: #fefae0ff;
// --earth-yellow: #dda15eff;
// --tigers-eye: #bc6c25ff;
//
// /* CSS HSL */
// --dark-moss-green: hsla(74, 32%, 32%, 1);
// --pakistan-green: hsla(88, 38%, 15%, 1);
// --cornsilk: hsla(52, 94%, 94%, 1);
// --earth-yellow: hsla(32, 65%, 62%, 1);
// --tigers-eye: hsla(28, 67%, 44%, 1);
//
// /* SCSS HEX */
// $dark-moss-green: #606c38ff;
// $pakistan-green: #283618ff;
// $cornsilk: #fefae0ff;
// $earth-yellow: #dda15eff;
// $tigers-eye: #bc6c25ff;
//
// /* SCSS HSL */
// $dark-moss-green: hsla(74, 32%, 32%, 1);
// $pakistan-green: hsla(88, 38%, 15%, 1);
// $cornsilk: hsla(52, 94%, 94%, 1);
// $earth-yellow: hsla(32, 65%, 62%, 1);
// $tigers-eye: hsla(28, 67%, 44%, 1);
//
// /* SCSS RGB */
// $dark-moss-green: rgba(96, 108, 56, 1);
// $pakistan-green: rgba(40, 54, 24, 1);
// $cornsilk: rgba(254, 250, 224, 1);
// $earth-yellow: rgba(221, 161, 94, 1);
// $tigers-eye: rgba(188, 108, 37, 1);
//
// /* SCSS Gradient */
// $gradient-top: linear-gradient(0deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-right: linear-gradient(90deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-bottom: linear-gradient(180deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-left: linear-gradient(270deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-top-right: linear-gradient(45deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-bottom-right: linear-gradient(135deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-top-left: linear-gradient(225deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-bottom-left: linear-gradient(315deg, #606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);
// $gradient-radial: radial-gradient(#606c38ff, #283618ff, #fefae0ff, #dda15eff, #bc6c25ff);