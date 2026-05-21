import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../components/layout/Screen';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { sendOtp, verifyOtp } from '../services/otp';
import { recoverPass } from '../services/visits';
import { Colors } from '../constants/colors';
import { saveActiveVisit } from '../services/storage';
import { getVisitPass } from '../services/visits';

export default function RecoverScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) return Alert.alert('Error', 'Enter phone number');
    if (!email.trim()) return Alert.alert('Error', 'Enter email address');
    setLoading(true);
    try {
      const r = await sendOtp(phone, email);
      if (r.data.devOtp) setDevOtp(r.data.devOtp);
      setStep('otp');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // Replace handleVerify with:
  const handleVerify = async () => {
    if (!otp.trim()) return Alert.alert('Error', 'Enter OTP');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      const r = await recoverPass(phone);
      const { visitId } = r.data;
      if (!visitId) {
        Alert.alert('Not Found', 'No active approved pass found for this phone number');
        setLoading(false);
        return;
      }

      // Fetch full pass and save to SecureStore
      try {
        const passRes = await getVisitPass(visitId);
        const visit = passRes.data;
        await saveActiveVisit({
          visitId: visit.visitId,
          requestId: visit.id,
          phone: visit.visitor.phone,
          visitorName: visit.visitor.name,
          hostName: visit.host?.name || '',
          status: visit.status,
          approvedAt: visit.approvedAt,
          photo: visit.visitor.photoBase64,
        });
      } catch {
        // Non-fatal
      }

      router.replace({ pathname: '/my-pass' });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'No active pass found');
    }
    setLoading(false);
  };

  return (
    <Screen scroll>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 28 }}>
        <Text style={{ color: Colors.muted, fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 28 }}>
        <Text style={{ fontSize: 11, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 8 }}>RECOVER PASS</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 6 }}>
          {step === 'phone' ? 'Enter your details' : 'Verify OTP'}
        </Text>
        <Text style={{ fontSize: 14, color: Colors.muted }}>
          {step === 'phone' ? "We'll find your approved visitor pass" : 'OTP sent to your email'}
        </Text>
      </View>

      <Card>
        {step === 'phone' ? (
          <>
            <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
            <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Button label={loading ? 'Sending...' : 'Send OTP →'} onPress={handleSendOtp} loading={loading} />
          </>
        ) : (
          <>
            <Input label="One-Time Password" value={otp} onChangeText={setOtp} placeholder="123456" keyboardType="number-pad" maxLength={6} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 12 }} />
            {devOtp ? (
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', marginBottom: 12 }}>
                <Text style={{ fontSize: 10, color: Colors.accent, fontFamily: 'monospace' }}>DEV OTP</Text>
                <Text style={{ fontSize: 20, color: Colors.accent, fontFamily: 'monospace', fontWeight: '800', letterSpacing: 8 }}>{devOtp}</Text>
              </View>
            ) : null}
            <Button label={loading ? 'Looking up...' : 'Recover My Pass →'} onPress={handleVerify} loading={loading} />
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setDevOtp(''); }} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: Colors.muted, fontSize: 13 }}>← Change details</Text>
            </TouchableOpacity>
          </>
        )}
      </Card>
    </Screen>
  );
}
