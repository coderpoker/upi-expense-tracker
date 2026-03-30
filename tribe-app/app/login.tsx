import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/utils/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, spacing, fontSize } from '../src/theme';
import { Input, GradientButton, GlassCard } from '../src/components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { session } = useAuth();

  React.useEffect(() => {
      // If a user hard-refreshes the page and already has a session, push them home
      // instead of relying on the global _layout which causes infinite update loops.
      if (session) {
          router.replace('/');
      }
  }, []); // Run ONLY on mount!

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    let error;

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Quick default for MVP
          }
        }
      });
      error = signUpError;
      if (!error) {
        if (data.session) {
          // Supabase Email Confirmation is off! We are instantly logged in.
          router.replace('/create-profile');
        } else {
          Platform.OS === 'web' ? window.alert('Account created! Please sign in.') : Alert.alert('Success', 'Account created! Please sign in.');
          setIsSignUp(false);
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
      if (!error) {
        router.replace('/');
      }
    }

    if (error) {
      Platform.OS === 'web' ? window.alert(error.message) : Alert.alert('Error', error.message);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logoText}>Tribe.🔥</Text>
        <Text style={styles.subtitle}>Find your people.</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.formTitle}>
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </Text>
        
        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <GradientButton
          title={loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          onPress={handleAuth}
          disabled={loading}
          style={{ marginTop: spacing.md }}
        />

        <GradientButton
          title={isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          onPress={() => setIsSignUp(!isSignUp)}
          variant="outline"
          style={{ marginTop: spacing.md }}
        />
      </GlassCard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  card: {
    padding: spacing.xl,
  },
  formTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
