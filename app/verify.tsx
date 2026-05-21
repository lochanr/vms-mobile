import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Screen from '../components/layout/Screen';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useVisitorStore } from '../store/useVisitorStore';
import { verifyOtp } from '../services/otp';
import { getVisitorByPhone } from '../services/visits';
import { Colors } from '../constants/colors';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone, email, devOtp } = useLocalSearchParams<{ phone: string; email: string; devOtp: string }>();
  const { setReturningVisitor } = useVisitorStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim()) return Alert.alert('Error', 'Enter OTP');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);

      // Check returning visitor
      try {
        const r = await getVisitorByPhone(phone);
        setReturningVisitor(r.data);
      } catch {
        setReturningVisitor(null);
      }

      router.push('/photo');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <Screen scroll>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 28 }}>
        <Text style={{ color: Colors.muted, fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 28 }}>
        <Text style={{ fontSize: 11, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 8 }}>
          STEP 1 OF 3
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 6 }}>
          Enter the code
        </Text>
        <Text style={{ fontSize: 14, color: Colors.muted }}>OTP sent to {email}</Text>
      </View>

      <Card>
        <Input
          label="One-Time Password"
          value={otp}
          onChangeText={setOtp}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          style={{ textAlign: 'center', fontSize: 24, letterSpacing: 12 }}
        />

        {/* Dev OTP hint */}
        {devOtp ? (
          <View style={{ padding: 14, borderRadius: 12, backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', marginBottom: 16 }}>
            <Text style={{ fontSize: 10, color: Colors.accent, fontFamily: 'monospace', marginBottom: 4 }}>DEV OTP</Text>
            <Text style={{ fontSize: 22, color: Colors.accent, fontFamily: 'monospace', fontWeight: '800', letterSpacing: 8 }}>{devOtp}</Text>
          </View>
        ) : null}

        <Button label={loading ? 'Verifying...' : 'Verify & Continue →'} onPress={handleVerify} loading={loading} />
      </Card>
    </Screen>
  );
}
