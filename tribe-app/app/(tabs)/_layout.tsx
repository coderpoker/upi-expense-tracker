import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../src/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.tabIndicator} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Explore" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="host"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Host" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 75,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purple,
    marginTop: 2,
  },
});
