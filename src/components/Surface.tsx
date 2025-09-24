import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface SurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export const Surface = ({ children, style, padding }: SurfaceProps): JSX.Element => {
  const { colors, spacing } = useTheme();
  const resolvedPadding = padding ?? spacing.md;

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.surface, padding: resolvedPadding, borderColor: colors.outline },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    borderWidth: 1,
  },
});
