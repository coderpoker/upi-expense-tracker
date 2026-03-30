import { Redirect } from 'expo-router';

// Entry point — redirect to onboarding (or tabs if already onboarded)
export default function Index() {
  // TODO: Check AsyncStorage for onboarding completion
  return <Redirect href="/onboarding" />;
}
