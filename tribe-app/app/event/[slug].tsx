import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, radius } from '../../src/theme';
import { GradientButton, SectionHeader, AvatarRow } from '../../src/components/ui';
import { MOCK_EVENTS } from '../../src/data/mockData';
import { supabase } from '../../src/utils/supabase';

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  
  const [event, setEvent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [joined, setJoined] = React.useState(false);

  React.useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(name)')
      .eq('slug', slug)
      .single();

    if (data) {
      const d = new Date(data.date_time);
      setEvent({
        ...data,
        hostName: data.profiles?.name || 'Tribe Host',
        hostAvatar: '👤',
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        timeLabel: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        currentMembers: data.active_members || 1,
        maxCapacity: data.max_capacity || 6,
        locationName: data.location_name,
      });
    } else {
      setEvent(MOCK_EVENTS.find(e => e.slug === slug) || MOCK_EVENTS[0]);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me for ${event.title} on ${event.dayLabel}! tribe.app/e/${event.slug}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoin = () => {
    // Mock join flow
    if (event.price > 0 && !joined) {
      alert(`This event costs ₹${event.price}. In a real app, this would trigger the UPI intent for payment to the host.`);
    }
    setJoined(!joined);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted }}>Loading event...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(10, 10, 15, 1)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroEmojiBox}>
            <Text style={styles.heroEmoji}>{event.emoji}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <Text style={{ fontSize: 16 }}>{event.hostAvatar}</Text>
            </View>
            <Text style={styles.hostText}>Hosted by <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{event.hostName}</Text></Text>
          </View>

          <AvatarRow count={event.currentMembers + (joined ? 1 : 0)} total={event.maxCapacity} />

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View>
              <Text style={styles.detailValue}>{event.dayLabel} · {event.timeLabel}</Text>
              <Text style={styles.detailLabel}>Add to calendar</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <View>
              <Text style={styles.detailValue}>{event.locationName}</Text>
              <Text style={styles.detailLabel}>{event.area} · Open in Maps</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🎟️</Text>
            <View>
              <Text style={styles.detailValue}>{event.price > 0 ? `₹${event.price} per person` : 'Free Event'}</Text>
              <Text style={styles.detailLabel}>{event.price > 0 ? 'Pay host via UPI to reserve spot' : 'No cost to attend'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <SectionHeader title="What to expect" />
          <Text style={styles.description}>{event.description}</Text>

          {/* Chat Preview (if joined) */}
          {joined && (
            <View style={styles.chatPreview}>
              <Text style={styles.chatTitle}>💬 Event Chat is Live</Text>
              <Text style={styles.chatSub}>Introduce yourself to the group!</Text>
              <GradientButton 
                title="Open Chat" 
                onPress={() => router.push(`/chat/${event.id}?title=${encodeURIComponent(event.title)}`)} 
                variant="secondary" 
                size="sm" 
                style={{ marginTop: spacing.sm }} 
              />
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <GradientButton
          title={joined ? "You're In! ✨" : "Join This Tribe ✨"}
          onPress={handleJoin}
          variant={joined ? "outline" : "primary"}
          disabled={!joined && event.currentMembers >= event.maxCapacity}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroGradient: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmojiBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    ...Platform.OS === 'ios' ? shadow.glow : {},
  },
  heroEmoji: {
    fontSize: 50,
  },
  content: {
    padding: spacing.xl,
    marginTop: -20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  hostText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailLabel: {
    color: colors.purpleLight,
    fontSize: fontSize.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  chatPreview: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  chatTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  chatSub: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

import { Platform } from 'react-native';
import { shadow } from '../../src/theme';
