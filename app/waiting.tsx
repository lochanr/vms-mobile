import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Screen from '../components/layout/Screen';
import { getVisitStatus, getVisitPass } from '../services/visits';
import { saveActiveVisit } from '../services/storage';
import { Colors } from '../constants/colors';

const STATUS_CONFIG = {
  PENDING:     { icon: '⏳', label: 'Waiting for Approval', sub: 'Your request has been submitted.', color: Colors.accent  },
  APPROVED:    { icon: '✅', label: 'Approved!',            sub: 'Redirecting to your pass...',     color: Colors.success },
  REJECTED:    { icon: '❌', label: 'Request Rejected',     sub: 'Contact the front desk.',          color: Colors.danger  },
  CHECKED_IN:  { icon: '🏢', label: 'Checked In',           sub: 'Entry recorded.',                  color: '#818cf8'      },
  CHECKED_OUT: { icon: '👋', label: 'Visit Complete',        sub: 'Thank you for visiting.',          color: '#94a3b8'      },
};

export default function WaitingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        const r = await getVisitStatus(parseInt(id));
        const { status: s, visitId } = r.data;
        setStatus(s);

        if (s === 'APPROVED' && visitId) {
          clearInterval(intervalRef.current!);

          // Fetch full pass data before saving
          try {
            const passRes = await getVisitPass(visitId);
            const visit = passRes.data;

            // Save to SecureStore so pass survives app close
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
          } catch (e) {
            // Non-fatal — pass page will still work, just won't persist
            console.warn('Could not save pass to storage:', e);
          }

          router.replace({ pathname: '/pass', params: { visitId } });
        }

        if (s === 'REJECTED') clearInterval(intervalRef.current!);
      } catch {
        setError('Could not reach server.');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  return (
    <Screen centered>
      <View style={{ width: '100%', maxWidth: 340, alignSelf: 'center', alignItems: 'center' }}>
        <View style={{
          width: '100%', padding: 32, borderRadius: 24,
          backgroundColor: `${cfg.color}10`,
          borderWidth: 1, borderColor: `${cfg.color}30`,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>{cfg.icon}</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: cfg.color, marginBottom: 8 }}>{cfg.label}</Text>
          <Text style={{ fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 20 }}>{cfg.sub}</Text>

          {error ? <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 16 }}>{error}</Text> : null}

          {status === 'PENDING' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <ActivityIndicator color={Colors.accent} size="small" />
              <Text style={{ fontSize: 11, color: Colors.muted, fontFamily: 'monospace', letterSpacing: 1 }}>
                CHECKING EVERY 3s
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 13, textAlign: 'center' }}>← Return to Home</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
