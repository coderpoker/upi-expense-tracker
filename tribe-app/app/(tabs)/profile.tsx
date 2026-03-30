import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { colors, spacing, fontSize, radius } from '../../src/theme';
import { GradientButton, SectionHeader, GlassCard } from '../../src/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../src/utils/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { router } from 'expo-router';
import { Image } from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
    if (data) setProfile(data);
  };

  const shareVibeCard = async () => {
    try {
      await Share.share({
        message: 'Join my tribe in Bangalore! tribe.app/u/shrey',
        title: 'Shrey\'s Vibe Card',
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vibe Card */}
        <LinearGradient
          colors={['#8B5CF6', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vibeCard}
        >
          <View style={styles.vibeHeader}>
            <View style={styles.vibeAvatar}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={{ width: 64, height: 64, borderRadius: 32 }} />
              ) : (
                <Text style={styles.avatarEmoji}>👻</Text>
              )}
            </View>
            <View>
              <Text style={styles.vibeCardName}>{profile?.name || user?.email?.split('@')[0] || 'Unknown Tribe'}</Text>
              <Text style={styles.vibeCardTitle}>{profile?.vibe_type ? profile.vibe_type.toUpperCase() : 'THE DISCOVERER 🧭'}</Text>
            </View>
          </View>
          
          <Text style={styles.vibeCardStats}>{profile?.city || 'Bangalore'} · Tribe Native</Text>
          
          <View style={styles.vibeCardTags}>
            {profile?.interests?.map((tag: string) => (
              <View key={tag} style={styles.vibeCardTag}>
                <Text style={styles.vibeCardTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <GradientButton
          title="Share Your Vibe ✨"
          onPress={shareVibeCard}
          variant="outline"
          style={{ marginBottom: spacing.md }}
        />

        <GradientButton
          title="🛡️ Open Admin Sourcing Engine"
          onPress={() => router.push('/admin')}
          variant="secondary"
          style={{ marginBottom: spacing.xxxl }}
        />

        <SectionHeader title="Your Upcoming Events" />
        
        <GlassCard style={styles.eventCard}>
          <Text style={styles.eventDate}>Tomorrow, 6:00 AM</Text>
          <Text style={styles.eventTitle}>Sunrise Run Club 🌅</Text>
          <Text style={styles.eventInfo}>Cubbon Park Main Gate · 5 attending</Text>
        </GlassCard>

        <SectionHeader title="Your Hosted Events" />

        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You haven't hosted any events yet.</Text>
          <TouchableOpacity>
            <Text style={styles.emptyLink}>Host your first event</Text>
          </TouchableOpacity>
        </View>

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
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: '700',
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  vibeCard: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
  },
  vibeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  vibeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  vibeCardName: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: 2,
  },
  vibeCardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  vibeCardStats: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  vibeCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  vibeCardTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  vibeCardTagText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  eventCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  eventDate: {
    color: colors.purpleLight,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventInfo: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  emptyLink: {
    color: colors.purple,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
