import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../theme';

export const TextField = forwardRef<TextInput, TextInputProps>(({ style, ...rest }, ref) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.base,
        typography.body,
        {
          color: colors.textPrimary,
          backgroundColor: colors.surface,
          borderColor: colors.outline,
          padding: spacing.md,
        },
        style,
      ]}
      {...rest}
    />
  );
});

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
  },
});
