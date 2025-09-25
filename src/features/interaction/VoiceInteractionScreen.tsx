import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, Surface } from '../../components';
import { useTheme } from '../../theme';
import { useConnectionStatus } from '../../hooks';

const VoiceInteractionScreen = (): JSX.Element => {
  const { colors, spacing, typography } = useTheme();
  const { connectionState, refreshConnection } = useConnectionStatus();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshConnection();
    } finally {
      setRefreshing(false);
    }
  }, [refreshConnection]);

  return (
    <View style={[styles.container, { padding: spacing.lg }]}>
      <Surface>
        <Text style={[typography.title, styles.title]}>Voice Session</Text>
        <Text style={[typography.body, styles.bodyText, { color: colors.textSecondary }]}>
          Hold the mic button to stream voice securely to your home node. Release to finish the
          utterance and wait for the TTS response.
        </Text>
        <View style={[styles.statusPill, { backgroundColor: colors.surfaceElevated }]}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: connectionState === 'connected' ? colors.success : colors.warning,
              },
            ]}
          />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Connection: {connectionState}
          </Text>
        </View>
      </Surface>
      <View style={styles.actionArea}>
        <PrimaryButton
          label={refreshing ? 'Checking...' : 'Check Connectivity'}
          onPress={handleRefresh}
          disabled={refreshing}
          variant="outline"
          style={styles.checkButton}
        />
        <PrimaryButton label="Hold to Stream" disabled style={styles.streamButton} />
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          Microphone integration pending native module wiring.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  bodyText: {
    lineHeight: 22,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  actionArea: {
    marginTop: 32,
    alignItems: 'center',
    gap: 16,
  },
  streamButton: {
    alignSelf: 'stretch',
  },
  checkButton: {
    alignSelf: 'stretch',
  },
});

export default VoiceInteractionScreen;
