import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../src/utils/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, fontSize, radius } from '../../src/theme';
import { Input, GradientButton } from '../../src/components/ui';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: { name: string } | null;
};

export default function ChatScreen() {
  const { eventId, title } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!eventId || !user) return;
    
    // 1. Initial Fetch
    fetchMessages();

    // 2. Subscribe to realtime updates
    const channel = supabase
      .channel(`chat_${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${eventId}` },
        (_payload) => {
          // Simplest MVP hack: Just refetch to get the profile names joined again
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, user]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (name)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) setMessages(data as Message[]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;
    const currentText = inputText;
    setInputText(''); // Optimistic clear

    const { error } = await supabase.from('messages').insert({
      event_id: eventId,
      sender_id: user.id,
      content: currentText.trim(),
    });

    if (error) {
      alert('Failed to send message: ' + error.message);
      setInputText(currentText); // revert on failure
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && <Text style={styles.senderName}>{item.profiles?.name || 'Anonymous'}</Text>}
        <Text style={[styles.messageText, isMe && { color: '#fff' }]}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={80} // For expo-router header offset
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Live View'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={<Text style={styles.emptyText}>Be the first to say hi! 👋</Text>}
      />

      <View style={styles.inputArea}>
        <Input
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.chatInput}
        />
        <GradientButton 
          title="Send" 
          onPress={sendMessage} 
          disabled={!inputText.trim()}
          size="sm"
          style={styles.sendBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgGlass,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingRight: spacing.md,
  },
  backText: {
    color: colors.purpleLight,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.xxl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.purple,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgInput,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderName: {
    color: colors.teal,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  inputArea: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.bgGlass,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing.sm,
  },
  sendBtn: {
    marginTop: 0,
  },
});
