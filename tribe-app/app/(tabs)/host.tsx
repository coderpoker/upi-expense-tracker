import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { colors, spacing, fontSize, radius } from '../../src/theme';
import { Input, GradientButton, Chip } from '../../src/components/ui';
import { CATEGORY_CONFIG } from '../../src/data/mockData';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/utils/supabase';
export default function HostScreen() {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('6');
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const [isPaid, setIsPaid] = useState(false);
  const [shareableLink, setShareableLink] = useState(true);

  const categories = Object.keys(CATEGORY_CONFIG);
  const { user } = useAuth();

  const handlePublish = async () => {
    if (!user) {
      alert('You must be logged in to host an event');
      return;
    }

    const generatedSlug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const eventCategory = category || 'social';
    const eventEmoji = CATEGORY_CONFIG[eventCategory]?.emoji || '📍';

    const { error } = await supabase.from('events').insert({
      title: eventName,
      emoji: eventEmoji,
      description: `Join me for ${eventName} at ${location}! (Date: ${date})`,
      category: eventCategory,
      location_name: location || 'Bangalore',
      area: location || 'Central',
      date_time: new Date(Date.now() + 86400000).toISOString(), // MVP: Sets to tomorrow
      max_capacity: parseInt(capacity) || 6,
      host_id: user.id,
      price: isPaid ? (parseInt(price) || 0) : 0,
      upi_id: isPaid ? upiId : null,
      slug: generatedSlug,
    });

    if (error) {
      alert('Error publishing event: ' + error.message);
    } else {
      alert('Event successfully published to the Tribe!');
      setEventName('');
      setLocation('');
      setDate('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Host an Event ✨</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
        <Input
          label="Event Name"
          placeholder="e.g. Cubbon Park Morning Walk"
          value={eventName}
          onChangeText={setEventName}
        />

        <View style={styles.row}>
          <Input
            label="Date & Time"
            placeholder="Sat 4:00 PM"
            value={date}
            onChangeText={setDate}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <Input
            label="Max People"
            placeholder="6"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
            style={{ width: 100 }}
          />
        </View>

        <Input
          label="Location"
          placeholder="Search areas in Bangalore..."
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((catKey) => {
            const cat = CATEGORY_CONFIG[catKey];
            return (
              <Chip
                key={catKey}
                label={cat.label}
                emoji={cat.emoji}
                selected={category === catKey}
                onPress={() => setCategory(catKey)}
                style={{ marginRight: spacing.sm }}
              />
            );
          })}
        </ScrollView>

        <View style={styles.divider} />

        {/* Payments Section via UPI */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Is this a paid event?</Text>
            <Text style={styles.switchSub}>Charge a fee to cover RSVP or split bills.</Text>
          </View>
          <Switch
            value={isPaid}
            onValueChange={setIsPaid}
            trackColor={{ false: colors.bgInput, true: colors.purpleLight }}
            thumbColor={isPaid ? colors.purple : '#f4f3f4'}
          />
        </View>

        {isPaid && (
          <View style={styles.paidFields}>
            <Input
              label="Price per person (₹)"
              placeholder="e.g. 250"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={{ flex: 1 }}
            />
            <Input
              label="UPI ID / Phone Number"
              placeholder="user@upi"
              value={upiId}
              onChangeText={setUpiId}
            />
            <Text style={styles.helperText}>
              Attendees will pay you directly via the app using this UPI ID before joining the group chat.
            </Text>
          </View>
        )}

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Generate Shareable Link</Text>
            <Text style={styles.switchSub}>tribe.app/e/your-event</Text>
          </View>
          <Switch
            value={shareableLink}
            onValueChange={setShareableLink}
            trackColor={{ false: colors.bgInput, true: colors.purpleLight }}
            thumbColor={shareableLink ? colors.purple : '#f4f3f4'}
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="Publish Event"
          onPress={handlePublish}
          disabled={!eventName || !date || !category}
          style={{ width: '100%' }}
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
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.hero,
    fontWeight: '700',
  },
  formContainer: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  switchLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  paidFields: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: spacing.lg,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
