import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../components/layout/Screen';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useVisitorStore } from '../store/useVisitorStore';
import { sendOtp } from '../services/otp';
import { Colors } from '../constants/colors';

export default function OtpScreen() {
  const router = useRouter();
  const { setPhone, setEmail } = useVisitorStore();

  const [phone, setPhoneLocal] = useState('');
  const [email, setEmailLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const handleSend = async () => {
    if (!phone.trim()) return Alert.alert('Error', 'Enter your phone number');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return Alert.alert('Error', 'Enter a valid email address');

    setLoading(true);
    try {
      const r = await sendOtp(phone, email);
      setPhone(phone);
      setEmail(email);
      if (r.data.devOtp) setDevOtp(r.data.devOtp);
      router.push({ pathname: '/verify', params: { phone, email, devOtp: r.data.devOtp || '' } });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to send OTP');
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
          Verify your identity
        </Text>
        <Text style={{ fontSize: 14, color: Colors.muted }}>
          Enter your phone and email to receive an OTP
        </Text>
      </View>

      <Card>
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhoneLocal}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmailLocal}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Button label={loading ? 'Sending...' : 'Send OTP →'} onPress={handleSend} loading={loading} />
      </Card>
    </Screen>
  );
}
