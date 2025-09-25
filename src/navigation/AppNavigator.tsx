import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../providers/AppProvider';
import VoiceInteractionScreen from '../features/interaction/VoiceInteractionScreen';
import TextChatScreen from '../features/chat/TextChatScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
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
  screenContainer: {
    flex: 1,
  },
});

const tabs = [
  { mode: 'voice' as const, label: 'Voice' },
  { mode: 'text' as const, label: 'Text' },
  { mode: 'settings' as const, label: 'Settings' },
];

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
          gap: spacing.sm,
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

  const renderTabButton = (mode: 'voice' | 'text' | 'settings', label: string) => {
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

  const renderScreen = () => {
    switch (interactionMode) {
      case 'voice':
        return <VoiceInteractionScreen />;
      case 'text':
        return <TextChatScreen />;
      case 'settings':
      default:
        return <SettingsScreen />;
    }
  };

  return (
    <SafeAreaView style={[baseStyles.safeArea, themedStyles.safeArea]}>
      <View style={[baseStyles.tabBar, themedStyles.tabBar]}>
        {tabs.map(tab => renderTabButton(tab.mode, tab.label))}
      </View>
      <View style={baseStyles.screenContainer}>{renderScreen()}</View>
    </SafeAreaView>
  );
};

export default AppNavigator;
