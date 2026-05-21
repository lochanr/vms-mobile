import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View style={{
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      ...style
    }}>
      <BlurView intensity={20} tint="dark" style={{ padding: 20 }}>
        {children}
      </BlurView>
    </View>
  );
}
