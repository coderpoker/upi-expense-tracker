import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useEffect } from 'react';
import { colors } from '../src/theme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      // Redirect to login if user is not authenticated
      router.replace('/login');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    // Optionally return a splash screen here while checking auth state
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
