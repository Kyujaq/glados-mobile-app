import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, Surface, TextField } from '../../components';
import { useTheme } from '../../theme';

const TextChatScreen = (): JSX.Element => {
  const { colors, spacing, typography } = useTheme();
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    // Placeholder: integrate transport client in later phases
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        <Surface>
          <Text style={[typography.title, styles.title]}>Text Session</Text>
          <Text style={[typography.body, styles.description, { color: colors.textSecondary }]}>
            Draft messages that will be delivered over the same secure channel as voice
            interactions. Incoming responses will appear below.
          </Text>
        </Surface>
        <View style={[styles.history, { borderColor: colors.outline }]}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Conversation history will be displayed here.
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outline,
            padding: spacing.sm,
          },
        ]}
      >
        <TextField
          value={draft}
          onChangeText={setDraft}
          placeholder="Message GLaDOS"
          style={styles.textField}
          editable
        />
        <View style={{ width: spacing.sm }} />
        <PrimaryButton label="Send" onPress={handleSend} disabled={draft.trim().length === 0} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  history: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  textField: {
    flex: 1,
  },
});

export default TextChatScreen;
