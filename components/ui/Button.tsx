import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

export default function Button({ label, onPress, loading, disabled, variant = 'primary', style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled || loading ? 0.5 : 1,
        ...(isPrimary && { backgroundColor: Colors.accent }),
        ...(isGhost && { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }),
        ...(isDanger && { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }),
        ...style,
      }}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#000' : Colors.text} size="small" />
      ) : (
        <Text style={{
          fontSize: 15,
          fontWeight: '700',
          letterSpacing: 0.3,
          color: isPrimary ? '#000' : isDanger ? Colors.danger : Colors.text,
        }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
