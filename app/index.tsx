import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../components/layout/Screen';
import { getActiveVisit, removeActiveVisit, isPassExpired } from '../services/storage';
import { getVisitPass } from '../services/visits';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [hasActivePass, setHasActivePass] = useState(false);
  const [checkingPass, setCheckingPass] = useState(true);

  useEffect(() => {
    checkForActivePass();
  }, []);

  const checkForActivePass = async () => {
    setCheckingPass(true);
    try {
      const stored = await getActiveVisit();
      if (!stored) { setHasActivePass(false); setCheckingPass(false); return; }

      // Verify with backend that pass is still valid
      const r = await getVisitPass(stored.visitId);
      const status = r.data.status;

      if (isPassExpired(status)) {
        // Auto-cleanup expired pass
        await removeActiveVisit();
        setHasActivePass(false);
      } else {
        setHasActivePass(true);
      }
    } catch {
      // If backend unreachable, still show the button (offline resilience)
      const stored = await getActiveVisit();
      setHasActivePass(!!stored);
    }
    setCheckingPass(false);
  };

  const menuItems = [
    { icon: '👤', title: 'New Visitor',   sub: 'Register & get your pass', route: '/otp',     accent: true  },
    { icon: '🔍', title: 'Recover Pass',  sub: 'Already registered?',      route: '/recover', accent: false },
  ];

  return (
    <Screen centered>
      <View style={{ width: '100%', maxWidth: 360, alignSelf: 'center' }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 18,
            backgroundColor: Colors.accent,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            shadowColor: Colors.accent, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}>
            <Text style={{ fontSize: 28 }}>🪪</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 }}>
            VisitorPass
          </Text>
          <Text style={{ fontSize: 14, color: Colors.muted, marginTop: 4 }}>
            Intelligent visitor management
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {/* Active pass button — shown only when pass exists */}
          {checkingPass ? (
            <View style={{ padding: 20, borderRadius: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          ) : hasActivePass ? (
            <TouchableOpacity
              onPress={() => router.push('/my-pass')}
              activeOpacity={0.85}
              style={{
                padding: 20, borderRadius: 20,
                flexDirection: 'row', alignItems: 'center', gap: 16,
                backgroundColor: 'rgba(16,185,129,0.1)',
                borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: 'rgba(16,185,129,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 20 }}>🪪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#10b981' }}>View My Pass</Text>
                <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>Your active visitor pass</Text>
              </View>
              <Text style={{ color: '#10b981', fontSize: 18 }}>→</Text>
            </TouchableOpacity>
          ) : null}

          {/* Regular menu items */}
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.85}
              style={{
                padding: 20, borderRadius: 20,
                flexDirection: 'row', alignItems: 'center', gap: 16,
                backgroundColor: item.accent ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: item.accent ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)',
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: item.accent ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.text }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <Text style={{ color: item.accent ? Colors.accent : Colors.muted, fontSize: 18 }}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: Colors.mutedDark, fontFamily: 'monospace' }}>
          DEV MODE · OTP: 123456
        </Text>
      </View>
    </Screen>
  );
}
