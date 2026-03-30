import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, fontSize, radius } from '../../src/theme';
import { GlassCard, Chip } from '../../src/components/ui';
import { MOCK_EVENTS } from '../../src/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../src/utils/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (name)
        `)
        .order('date_time', { ascending: true });

      if (error || !data || data.length === 0) {
        setEvents(MOCK_EVENTS.slice(0, 3));
      } else {
        const formatted = data.map(dbEvent => {
          const d = new Date(dbEvent.date_time);
          return {
            ...dbEvent,
            hostName: dbEvent.profiles?.name || 'Unknown Ghost',
            dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
            timeLabel: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            currentMembers: dbEvent.active_members || 1,
            maxCapacity: dbEvent.max_capacity || 6,
          };
        });
        setEvents(formatted);
      }
    } catch (e) {
      setEvents(MOCK_EVENTS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (slug: string) => {
    router.push(`/event/${slug}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {user?.user_metadata?.full_name?.split(' ')[0] || 'Tribe'}, ✌️</Text>
          <Text style={styles.subtitle}>Your tribe awaits in Bangalore</Text>
        </View>
        <View style={styles.userAvatar}>
          <Text>👤</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Weekly Drop Banner */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(45, 212, 191, 0.1)']}
          style={styles.dropBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.dropTitle}>The Wednesday Drop 💧</Text>
          <Text style={styles.dropText}>3 new curated events just dropped for this weekend.</Text>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Weekend</Text>
        </View>

        {/* Event List */}
        {loading ? (
          <Text style={{ color: colors.textMuted, padding: spacing.xl }}>Loading events...</Text>
        ) : events.map((event) => (
          <GlassCard 
            key={event.id} 
            style={styles.eventCard}
            onPress={() => handleEventPress(event.slug)}
          >
            <View style={styles.eventHeader}>
              <View style={styles.eventCategory}>
                <Text style={styles.eventEmoji}>{event.emoji}</Text>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
              {event.price > 0 ? (
                <Text style={styles.priceTag}>₹{event.price}</Text>
              ) : (
                <Text style={styles.priceTagFree}>Free</Text>
              )}
            </View>
            
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.eventMeta}>
              <Text style={styles.metaText}>📅 {event.dayLabel} · {event.timeLabel}</Text>
              <Text style={styles.metaText}>📍 {event.area}</Text>
            </View>

            <View style={styles.eventFooter}>
              <View style={styles.spotsLeft}>
                <View style={[styles.spotIndicator, { backgroundColor: event.currentMembers < event.maxCapacity ? colors.teal : colors.coral }]} />
                <Text style={styles.spotsText}>
                  {event.maxCapacity - event.currentMembers} spots left
                </Text>
              </View>
              <Text style={styles.hostText}>by {event.hostName}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  dropBanner: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  dropTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  dropText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  eventCard: {
    padding: spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  eventEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceTag: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  priceTagFree: {
    color: colors.teal,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  eventMeta: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  spotsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  spotsText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  hostText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});
