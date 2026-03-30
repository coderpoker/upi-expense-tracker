// =============================================
// Tribe — Onboarding / Vibe Check
// =============================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize } from '../src/theme';
import { GradientButton, Chip } from '../src/components/ui';
import { VIBE_OPTIONS, INTEREST_TAGS } from '../src/data/mockData';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleVibe = (id: string) => {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const nextStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    if (step < 2) {
      setTimeout(() => setStep(step + 1), 150);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
            <Text style={styles.title}>What's your{'\n'}vibe? ✨</Text>
            <Text style={styles.subtitle}>
              Pick the activities that sound like your kind of weekend. Choose as many as you like.
            </Text>

            <View style={styles.vibeGrid}>
              {VIBE_OPTIONS.map((vibe) => {
                const isSelected = selectedVibes.includes(vibe.id);
                return (
                  <TouchableOpacity
                    key={vibe.id}
                    onPress={() => toggleVibe(vibe.id)}
                    activeOpacity={0.7}
                    style={[styles.vibeCard, isSelected && styles.vibeCardSelected]}
                  >
                    <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                    <Text style={styles.vibeTitle}>{vibe.title}</Text>
                    <Text style={styles.vibeSubtitle}>{vibe.subtitle}</Text>
                    {isSelected && (
                      <View style={styles.vibeCheck}>
                        <Text style={{ fontSize: 12 }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {step === 1 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
            <Text style={styles.title}>Pick your{'\n'}interests 🎯</Text>
            <Text style={styles.subtitle}>
              These help us match you with people who love the same stuff.
            </Text>

            <View style={styles.tagGrid}>
              {INTEREST_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={selectedInterests.includes(tag)}
                  onPress={() => toggleInterest(tag)}
                  style={{ marginRight: spacing.sm, marginBottom: spacing.sm }}
                />
              ))}
            </View>
          </ScrollView>
        )}

        {step === 2 && (
          <View style={styles.scrollContent}>
            <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
            <Text style={styles.title}>You're{'\n'}all set! 🎉</Text>
            <Text style={styles.subtitle}>
              Your tribe is waiting. Let's find your people this weekend.
            </Text>

            {/* Mini Vibe Card Preview */}
            <LinearGradient
              colors={['#8B5CF6', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vibeCardPreview}
            >
              <Text style={styles.vibeCardName}>Explorer 🧭</Text>
              <Text style={styles.vibeCardStats}>
                {selectedVibes.length} vibes · {selectedInterests.length} interests
              </Text>
              <View style={styles.vibeCardTags}>
                {selectedInterests.slice(0, 4).map((tag) => (
                  <View key={tag} style={styles.vibeCardTag}>
                    <Text style={styles.vibeCardTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}
      </Animated.View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <GradientButton
          title={step === 2 ? "Let's Go ✨" : 'Continue'}
          onPress={nextStep}
          size="lg"
          disabled={step === 0 && selectedVibes.length === 0}
          style={{ width: '100%' }}
        />
        {step < 2 && (
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ marginTop: spacing.md }}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  progressDot: {
    height: 3,
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.bgInput,
  },
  progressDotActive: {
    backgroundColor: colors.purple,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  stepLabel: {
    color: colors.purple,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.xxxl,
  },

  // Vibe Grid
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  vibeCard: {
    width: (width - spacing.xl * 2 - spacing.md) / 2,
    backgroundColor: colors.bgGlass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  vibeCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: colors.purple,
  },
  vibeEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  vibeTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  vibeSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  vibeCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tags
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Vibe Card Preview
  vibeCardPreview: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  vibeCardName: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
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
    justifyContent: 'center',
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

  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.lg,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  skipText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
