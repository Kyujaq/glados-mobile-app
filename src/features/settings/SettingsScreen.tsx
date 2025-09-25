import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { PrimaryButton, Surface, TextField } from '../../components';
import { useTheme } from '../../theme';
import { useSettings } from '../../providers/SettingsProvider';
import { useConnectionStatus } from '../../hooks';

const SettingsScreen = (): JSX.Element => {
  const { colors, spacing, typography } = useTheme();
  const { settings, updateSettings, resetSettings, loading, error, lastSavedAt } = useSettings();
  const { connectionState, refreshConnection } = useConnectionStatus();

  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleFieldChange = useCallback((field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleTls = useCallback((value: boolean) => {
    setForm(prev => ({ ...prev, useTls: value }));
  }, []);

  const hasChanges = useMemo(
    () =>
      form.baseUrl !== settings.baseUrl ||
      form.sttPath !== settings.sttPath ||
      form.ttsPath !== settings.ttsPath ||
      form.textPath !== settings.textPath ||
      form.healthPath !== settings.healthPath ||
      form.tailscaleHostname !== settings.tailscaleHostname ||
      form.tailscaleIp !== settings.tailscaleIp ||
      form.tailscalePort !== settings.tailscalePort ||
      form.useTls !== settings.useTls ||
      form.apiAuthToken !== settings.apiAuthToken,
    [form, settings],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await updateSettings(form);
      setFeedback('Settings saved.');
    } catch (saveError) {
      console.error('Failed to save settings', saveError);
      setFeedback('Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }, [form, updateSettings]);

  const handleReset = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await resetSettings();
      setFeedback('Settings restored to defaults.');
    } catch (resetError) {
      console.error('Failed to reset settings', resetError);
      setFeedback('Unable to reset settings.');
    } finally {
      setSaving(false);
    }
  }, [resetSettings]);

  const handleTestConnection = useCallback(async () => {
    try {
      await refreshConnection();
    } catch (refreshError) {
      console.error('Connectivity check failed', refreshError);
    }
  }, [refreshConnection]);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return 'Never';
    }
    const savedDate = new Date(lastSavedAt);
    return `${savedDate.toLocaleDateString()} ${savedDate.toLocaleTimeString()}`;
  }, [lastSavedAt]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.lg, gap: spacing.lg }]}
      >
        <Surface>
          <Text style={[typography.title, styles.sectionTitle]}>Connection Status</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.outline,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    connectionState === 'connected'
                      ? colors.success
                      : connectionState === 'error'
                      ? colors.danger
                      : colors.warning,
                },
              ]}
            />
            <Text style={[typography.body, { color: colors.textPrimary }]}>
              {connectionState.toUpperCase()}
            </Text>
          </View>
          <PrimaryButton
            label="Test Connection"
            onPress={handleTestConnection}
            variant="outline"
            style={styles.fullWidthButton}
          />
        </Surface>

        <Surface>
          <Text style={[typography.title, styles.sectionTitle]}>Webhook Paths</Text>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>Base URL</Text>
            <TextField
              value={form.baseUrl}
              placeholder="https://tailscale-node.local"
              onChangeText={value => handleFieldChange('baseUrl', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>STT Path</Text>
            <TextField
              value={form.sttPath}
              onChangeText={value => handleFieldChange('sttPath', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>TTS Path</Text>
            <TextField
              value={form.ttsPath}
              onChangeText={value => handleFieldChange('ttsPath', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>Text Chat Path</Text>
            <TextField
              value={form.textPath}
              onChangeText={value => handleFieldChange('textPath', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>Health Path</Text>
            <TextField
              value={form.healthPath}
              onChangeText={value => handleFieldChange('healthPath', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Surface>

        <Surface>
          <Text style={[typography.title, styles.sectionTitle]}>Tailscale Overrides</Text>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>Hostname</Text>
            <TextField
              value={form.tailscaleHostname}
              onChangeText={value => handleFieldChange('tailscaleHostname', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>MagicDNS / 100.x IP</Text>
            <TextField
              value={form.tailscaleIp}
              onChangeText={value => handleFieldChange('tailscaleIp', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>Port</Text>
            <TextField
              value={form.tailscalePort}
              onChangeText={value =>
                handleFieldChange('tailscalePort', value.replace(/[^0-9]/g, ''))
              }
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.fieldGroup, styles.switchRow]}>
            <Text style={[typography.caption, styles.label]}>Use TLS</Text>
            <Switch
              value={form.useTls}
              onValueChange={handleToggleTls}
              thumbColor={form.useTls ? colors.primary : colors.surfaceElevated}
            />
          </View>
        </Surface>

        <Surface>
          <Text style={[typography.title, styles.sectionTitle]}>Authentication</Text>
          <View style={styles.fieldGroup}>
            <Text style={[typography.caption, styles.label]}>Bearer Token</Text>
            <TextField
              value={form.apiAuthToken}
              onChangeText={value => handleFieldChange('apiAuthToken', value)}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Optional bearer token"
            />
          </View>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            The token is stored in AsyncStorage and forwarded on each request. Leave blank when
            developing locally.
          </Text>
        </Surface>

        <Surface>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Last saved</Text>
          <Text style={[typography.body, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            {lastSavedLabel}
          </Text>
          {error && <Text style={[typography.caption, styles.errorText]}>{error}</Text>}
          {feedback && !error && (
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{feedback}</Text>
          )}
          <View style={[styles.actionsRow, { gap: spacing.sm }]}>
            <PrimaryButton
              label={saving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={!hasChanges || saving || loading}
              style={styles.flexButton}
            />
            <PrimaryButton
              label="Reset"
              onPress={handleReset}
              disabled={saving || loading}
              variant="outline"
              style={styles.flexButton}
            />
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 8,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexButton: {
    flex: 1,
  },
  fullWidthButton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  errorText: {
    color: '#FF6F61',
    marginBottom: 8,
  },
});

export default SettingsScreen;
