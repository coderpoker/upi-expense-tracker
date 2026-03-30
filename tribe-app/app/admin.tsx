import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/utils/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, spacing, fontSize, radius } from '../src/theme';
import { Input, GradientButton, GlassCard } from '../src/components/ui';

export default function AdminSourcingScreen() {
  const { user } = useAuth();
  
  const [sourceUrl, setSourceUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    description: string;
    location: string;
    price: string;
    date: string;
    vibe: string;
  } | null>(null);

  const handleScrape = () => {
    if (!sourceUrl) {
      Platform.OS === 'web' ? window.alert('Paste a valid event URL first.') : Alert.alert('Error', 'Paste a URL');
      return;
    }
    
    setIsScraping(true);
    
    // Simulate hitting a Supabase Edge Function integrating Gemini/Cheerio
    setTimeout(() => {
      setScrapedData({
        title: 'Standup Comedy: The Local Lineup',
        description: 'An aggressive 2-hour set featuring Bangalores top underground comics. Raw, unfiltered, and highly questionable.',
        location: 'Koramangala Social',
        price: '499',
        date: new Date(Date.now() + 86400000).toISOString(),
        vibe: 'creative' // Mock extracted vibe
      });
      setIsScraping(false);
    }, 2500);
  };

  const handleInjectToTribe = async () => {
    if (!scrapedData || !user) return;
    setIsScraping(true);

    const generatedSlug = scrapedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    const { error } = await supabase.from('events').insert({
      title: scrapedData.title,
      emoji: '🎭',
      description: scrapedData.description,
      category: scrapedData.vibe,
      location_name: scrapedData.location,
      area: 'Koramangala',
      date_time: scrapedData.date,
      max_capacity: 50,
      host_id: user.id, // The Admin hosts it formally
      price: parseInt(scrapedData.price) || 0,
      source: 'external',
      slug: generatedSlug,
    });

    if (error) {
      Platform.OS === 'web' ? window.alert(error.message) : Alert.alert('Error', error.message);
    } else {
      Platform.OS === 'web' ? window.alert('Event injected into Home Feed!') : Alert.alert('Success', 'Injected successfully.');
      router.replace('/');
    }
    setIsScraping(false);
  };

  // Basic authorization hide (in production, check user.id against admin table)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Sourcing Engine</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
            <GlassCard style={styles.card}>
                <Text style={styles.label}>Paste External URL (e.g. BookMyShow)</Text>
                <Input 
                    placeholder="https://..."
                    value={sourceUrl}
                    onChangeText={setSourceUrl}
                    autoCapitalize="none"
                />
                
                <GradientButton 
                    title={isScraping && !scrapedData ? "AI is parsing web content..." : "Extract Data"}
                    onPress={handleScrape} 
                    disabled={isScraping || !!scrapedData}
                />
            </GlassCard>

            {scrapedData && (
                <GlassCard style={{ ...styles.card, marginTop: spacing.md, borderColor: colors.teal }}>
                    <Text style={[styles.label, { color: colors.teal }]}>AI Extraction Successful ✅</Text>
                    
                    <View style={styles.parsedRow}>
                        <Text style={styles.parsedKey}>Title:</Text>
                        <Text style={styles.parsedVal}>{scrapedData.title}</Text>
                    </View>
                    <View style={styles.parsedRow}>
                        <Text style={styles.parsedKey}>Vibe:</Text>
                        <Text style={styles.parsedVal}>{scrapedData.vibe}</Text>
                    </View>
                    <View style={styles.parsedRow}>
                        <Text style={styles.parsedKey}>Location:</Text>
                        <Text style={styles.parsedVal}>{scrapedData.location}</Text>
                    </View>
                    <View style={styles.parsedRow}>
                        <Text style={styles.parsedKey}>Price:</Text>
                        <Text style={styles.parsedVal}>₹{scrapedData.price}</Text>
                    </View>

                    <GradientButton 
                        title={isScraping ? "Injecting..." : "Inject to Tribe Feed"}
                        onPress={handleInjectToTribe}
                        variant="primary"
                        style={{ marginTop: spacing.lg }}
                        disabled={isScraping}
                    />
                </GlassCard>
            )}
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
    backBtn: { marginBottom: spacing.sm },
    backText: { color: colors.purpleLight, fontSize: fontSize.md, fontWeight: '600' },
    title: { color: colors.textPrimary, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    scroll: { padding: spacing.xl },
    card: { padding: spacing.xl },
    label: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm },
    parsedRow: { flexDirection: 'row', marginBottom: spacing.sm },
    parsedKey: { color: colors.textSecondary, width: 80, fontSize: fontSize.sm },
    parsedVal: { color: colors.textPrimary, flex: 1, fontSize: fontSize.sm, fontWeight: '500' }
});
