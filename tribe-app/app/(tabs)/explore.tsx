import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { colors, spacing, fontSize, radius } from '../../src/theme';
import { GlassCard, Chip } from '../../src/components/ui';
import { MOCK_EVENTS, CATEGORY_CONFIG } from '../../src/data/mockData';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Object.keys(CATEGORY_CONFIG);

  const filteredEvents = MOCK_EVENTS.filter(event => {
    if (activeCategory && event.category !== activeCategory) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, venues..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <Chip
            label="All"
            selected={activeCategory === null}
            onPress={() => setActiveCategory(null)}
            style={{ marginRight: spacing.sm }}
          />
          {categories.map((catKey) => {
            const cat = CATEGORY_CONFIG[catKey];
            return (
              <Chip
                key={catKey}
                label={cat.label}
                emoji={cat.emoji}
                selected={activeCategory === catKey}
                onPress={() => setActiveCategory(catKey)}
                style={{ marginRight: spacing.sm }}
              />
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        <Text style={styles.resultsText}>{filteredEvents.length} events found</Text>
        
        {filteredEvents.map(event => (
          <GlassCard 
            key={event.id}
            onPress={() => router.push(`/event/${event.slug}`)}
            style={styles.miniCard}
          >
            <View style={styles.emojiBox}>
              <Text style={styles.emojiBig}>{event.emoji}</Text>
            </View>
            <View style={styles.miniCardInfo}>
              <Text style={styles.miniCardTitle}>{event.title}</Text>
              <Text style={styles.miniCardMeta}>{event.dayLabel} · {event.timeLabel}</Text>
              <Text style={styles.miniCardArea}>{event.area}</Text>
            </View>
          </GlassCard>
        ))}
        
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👀</Text>
            <Text style={styles.emptyTitle}>Nothing found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
          </View>
        )}
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
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  resultsText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  miniCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  emojiBox: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emojiBig: {
    fontSize: 28,
  },
  miniCardInfo: {
    flex: 1,
  },
  miniCardTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  miniCardMeta: {
    color: colors.purpleLight,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  miniCardArea: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
