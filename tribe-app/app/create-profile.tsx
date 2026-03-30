import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../src/utils/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, spacing, fontSize, radius, shadow } from '../src/theme';
import { Input, GradientButton, Chip } from '../src/components/ui';
import { CATEGORY_CONFIG } from '../src/data/mockData';
import { decode } from 'base64-arraybuffer';

export default function CreateProfileScreen() {
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [vibe, setVibe] = useState<string | null>(null);
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = Object.keys(CATEGORY_CONFIG);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to new enum
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const notify = (msg: string) => Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Notice', msg);

  const handleComplete = async () => {
    if (!user) {
      notify('You are not authenticated.');
      return;
    }
    if (!name || !bio || !vibe) {
      notify('Please fill in your name, bio, and main vibe.');
      return;
    }

    setLoading(true);

    try {
      let avatar_url = null;

      // 1. Upload Avatar if selected
      if (imageBase64) {
        const filePath = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(imageBase64), { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }

      // 2. Update Profile Record
      const updates = {
        name,
        city,
        vibe_type: vibe,
        interests: [vibe],
        // A bio field isnt explicitly in Phase 1 schema, but we can store it in a JSON block or add it if needed. 
        // We'll append bio to 'name' or a new column next. For MVP, we will update the defined columns.
        avatar_url: avatar_url || undefined,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      router.replace('/');
    } catch (e: any) {
      notify(e.message || 'Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Build your Vibe 💫</Text>
          <Text style={styles.subtitle}>Let the tribe know who you are</Text>
        </View>

        {/* Photo Upload */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIcon}>📸</Text>
                <Text style={styles.avatarText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Details */}
        <Input
          label="What do people call you?"
          placeholder="First Name"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Short Bio"
          placeholder="New to Bangalore, looking for badminton partners..."
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          editable={false} // Locked to Bangalore for MVP
          style={{ opacity: 0.7 }}
        />

        <Text style={styles.label}>What's your main vibe?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((catKey) => {
            const cat = CATEGORY_CONFIG[catKey];
            return (
              <Chip
                key={catKey}
                label={cat.label}
                emoji={cat.emoji}
                selected={vibe === catKey}
                onPress={() => setVibe(catKey)}
                style={{ marginRight: spacing.sm }}
              />
            );
          })}
        </ScrollView>

      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title={loading ? "Saving Profile..." : "Join the Tribe"}
          onPress={handleComplete}
          disabled={loading || !name || !vibe}
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
  scroll: {
    padding: spacing.xl,
    paddingTop: 80,
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '800',
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.bgInput,
    borderWidth: 2,
    borderColor: colors.purple,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  avatarText: {
    color: colors.purpleLight,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: spacing.xxl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: 40,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
