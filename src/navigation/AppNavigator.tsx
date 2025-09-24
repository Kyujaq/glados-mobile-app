import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../providers/AppProvider';
import VoiceInteractionScreen from '../features/interaction/VoiceInteractionScreen';
import TextChatScreen from '../features/chat/TextChatScreen';
import { useTheme } from '../theme';

const baseStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    margin: 16,
    borderWidth: 1,
  },
  tabButton: {
    borderRadius: 999,
    borderWidth: 1,
  },
  spacer: {
    width: 12,
    height: 1,
  },
  screenContainer: {
    flex: 1,
  },
});

const AppNavigator = (): JSX.Element => {
  const { interactionMode, setInteractionMode } = useAppContext();
  const { colors, spacing, typography } = useTheme();

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          backgroundColor: colors.background,
        },
        tabBar: {
          borderColor: colors.outline,
          backgroundColor: colors.surface,
          padding: spacing.xs,
        },
        tabButtonActive: {
          backgroundColor: colors.primary,
          borderColor: colors.outline,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.lg,
        },
        tabButtonInactive: {
          backgroundColor: 'transparent',
          borderColor: colors.outline,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.lg,
        },
        tabLabelActive: {
          color: colors.textPrimary,
          fontWeight: '600',
        },
        tabLabelInactive: {
          color: colors.textSecondary,
          fontWeight: '500',
        },
        spacer: {
          width: spacing.sm,
        },
      }),
    [
      colors.background,
      colors.outline,
      colors.primary,
      colors.surface,
      colors.textPrimary,
      colors.textSecondary,
      spacing.lg,
      spacing.sm,
      spacing.xs,
    ],
  );

  const renderTabButton = (mode: typeof interactionMode, label: string) => {
    const isActive = interactionMode === mode;
    const buttonStyle = isActive ? themedStyles.tabButtonActive : themedStyles.tabButtonInactive;
    const labelStyle = isActive ? themedStyles.tabLabelActive : themedStyles.tabLabelInactive;

    return (
      <TouchableOpacity
        key={mode}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={() => setInteractionMode(mode)}
        style={[baseStyles.tabButton, buttonStyle]}
      >
        <Text style={[typography.body, labelStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[baseStyles.safeArea, themedStyles.safeArea]}>
      <View style={[baseStyles.tabBar, themedStyles.tabBar]}>
        {renderTabButton('voice', 'Voice')}
        <View style={[baseStyles.spacer, themedStyles.spacer]} />
        {renderTabButton('text', 'Text')}
      </View>
      <View style={baseStyles.screenContainer}>
        {interactionMode === 'voice' ? <VoiceInteractionScreen /> : <TextChatScreen />}
      </View>
    </SafeAreaView>
  );
};

export default AppNavigator;
