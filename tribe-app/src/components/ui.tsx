// =============================================
// Tribe — Reusable UI Components
// =============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '../theme';

// ---------- Glass Card ----------
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function GlassCard({ children, style, onPress }: GlassCardProps) {
  const content = (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ---------- Gradient Button ----------
interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  style,
}: GradientButtonProps) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.outlineBtn,
          size === 'sm' && styles.btnSm,
          size === 'lg' && styles.btnLg,
          disabled && styles.btnDisabled,
          style,
        ]}
      >
        <Text style={[styles.outlineBtnText, size === 'sm' && { fontSize: fontSize.sm }]}>
          {icon ? `${icon} ${title}` : title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[disabled && styles.btnDisabled, style]}
    >
      <LinearGradient
        colors={variant === 'secondary' ? ['#374151', '#1F2937'] : [colors.purple, colors.purpleLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientBtn,
          size === 'sm' && styles.btnSm,
          size === 'lg' && styles.btnLg,
        ]}
      >
        <Text style={[styles.gradientBtnText, size === 'sm' && { fontSize: fontSize.sm }]}>
          {icon ? `${icon} ${title}` : title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ---------- Chip ----------
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  emoji?: string;
  style?: ViewStyle;
}

export function Chip({ label, selected, onPress, emoji, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {emoji ? `${emoji} ${label}` : label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------- Input ----------
interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  style?: ViewStyle;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  label,
  multiline,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
        {...props}
      />
    </View>
  );
}

// ---------- Section Header ----------
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------- Avatar Row ----------
interface AvatarRowProps {
  count: number;
  total: number;
}

export function AvatarRow({ count, total }: AvatarRowProps) {
  const filled = Math.min(count, total);
  const empty = total - filled;
  const avatarEmojis = ['😊', '🙂', '😎', '🤗', '😄', '🥳'];

  return (
    <View style={styles.avatarRow}>
      {Array.from({ length: filled }).map((_, i) => (
        <View key={`f-${i}`} style={[styles.avatar, styles.avatarFilled, { marginLeft: i > 0 ? -8 : 0 }]}>
          <Text style={{ fontSize: 14 }}>{avatarEmojis[i % avatarEmojis.length]}</Text>
        </View>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <View key={`e-${i}`} style={[styles.avatar, styles.avatarEmpty, { marginLeft: -8 }]}>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>+</Text>
        </View>
      ))}
      <Text style={styles.avatarText}>{count} of {total} joined</Text>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: colors.bgGlass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },

  gradientBtn: {
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBtnText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  outlineBtn: {
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  btnSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  btnLg: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: radius.xxl,
  },
  btnDisabled: {
    opacity: 0.5,
  },

  chip: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: colors.purple,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.purple,
  },

  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  sectionAction: {
    color: colors.purple,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  avatarFilled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  avatarEmpty: {
    backgroundColor: colors.bgInput,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  avatarText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
});
