import { View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
}

export default function Screen({ children, scroll = false, centered = false }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: 24, ...(centered ? { justifyContent: 'center', alignItems: 'center' } : {}) }}>
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={['#0f172a', '#080c14']}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {content}
      </SafeAreaView>
    </LinearGradient>
  );
}
