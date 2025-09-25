import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, Surface, TextField } from '../../components';
import { useTheme } from '../../theme';
import { transport } from '../../services';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  pending?: boolean;
  error?: boolean;
};

const TextChatScreen = (): JSX.Element => {
  const { colors, spacing, typography } = useTheme();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${now}`,
      role: 'user',
      content: trimmed,
      timestamp: now,
    };
    const pendingMessage: ChatMessage = {
      id: `assistant-${now}`,
      role: 'assistant',
      content: 'Awaiting response...',
      timestamp: now + 1,
      pending: true,
    };

    setMessages(prev => [...prev, userMessage, pendingMessage]);
    setDraft('');
    setSending(true);

    try {
      const result = await transport.sendTextMessage({ message: trimmed });
      setMessages(prev =>
        prev.map(message =>
          message.id === pendingMessage.id
            ? {
                ...message,
                content: result.reply || 'No response received from server.',
                pending: false,
              }
            : message,
        ),
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(message =>
          message.id === pendingMessage.id
            ? {
                ...message,
                role: 'system',
                content: 'Failed to deliver message. Check connectivity and try again.',
                pending: false,
                error: true,
              }
            : message,
        ),
      );
    } finally {
      setSending(false);
    }
  }, [draft]);

  const hasMessages = messages.length > 0;

  const historyContent = hasMessages ? (
    <ScrollView contentContainerStyle={styles.historyContent}>
      {messages.map(message => {
        const isUser = message.role === 'user';
        const bubbleStyle = [
          styles.messageBubble,
          {
            backgroundColor: isUser ? colors.primary : colors.surfaceElevated,
            borderColor: message.error ? colors.danger : colors.outline,
          },
        ];
        const textColor = isUser ? colors.background : colors.textPrimary;

        return (
          <View
            key={message.id}
            style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}
          >
            <View style={bubbleStyle}>
              <Text style={[typography.body, { color: textColor }]}>{message.content}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  ) : (
    <View style={styles.emptyHistory}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>
        Conversation history will be displayed here.
      </Text>
    </View>
  );

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
        <View style={[styles.historyContainer, { borderColor: colors.outline }]}>
          {historyContent}
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
          editable={!sending}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <View style={{ width: spacing.sm }} />
        <PrimaryButton
          label={sending ? 'Sending...' : 'Send'}
          onPress={handleSend}
          disabled={draft.trim().length === 0 || sending}
        />
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
  historyContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    overflow: 'hidden',
  },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    gap: 12,
    paddingBottom: 12,
  },
  messageRow: {
    maxWidth: '90%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
