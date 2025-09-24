import React, { createContext, useContext, useMemo } from 'react';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
};

const theme: Theme = {
  colors,
  spacing,
  typography,
};

const ThemeContext = createContext<Theme>(theme);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const value = useMemo(() => theme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext);
