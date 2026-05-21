import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import StatusBadge from '../components/ui/StatusBadge';
import { getVisitPass } from '../services/visits';
import { saveActiveVisit, removeActiveVisit, isPassExpired } from '../services/storage';
import { Visit } from '../types';
import { Colors } from '../constants/colors';

export default function PassScreen() {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visitId) { setError('No visit ID'); return; }
    loadPass();
  }, [visitId]);

  const loadPass = async () => {
    try {
      const r = await getVisitPass(visitId!);
      const v = r.data;
      setVisit(v);

      // Sync latest status to SecureStore
      if (isPassExpired(v.status)) {
        // Pass no longer valid — remove from storage
        await removeActiveVisit();
      } else {
        // Update stored pass with latest status
        await saveActiveVisit({
          visitId: v.visitId,
          requestId: v.id,
          phone: v.visitor.phone,
          visitorName: v.visitor.name,
          hostName: v.host?.name || '',
          status: v.status,
          approvedAt: v.approvedAt,
          photo: v.visitor.photoBase64,
        });
      }
    } catch {
      setError('Pass not found');
    }
  };

  if (error) return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>❌</Text>
      <Text style={{ color: Colors.danger, fontWeight: '800', fontSize: 18 }}>Pass Not Found</Text>
      <Text style={{ color: Colors.muted, fontSize: 13, marginTop: 8 }}>{error}</Text>
      <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 24 }}>
        <Text style={{ color: Colors.accent }}>← Go Home</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  if (!visit) return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>

          {/* Pass card */}
          <View style={{ backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 }}>
            <LinearGradient colors={['#1e293b', '#0f172a']} style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 6 }}>VISITOR PASS</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>{visit.visitor.name}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{visit.visitor.organizationName}</Text>
                </View>
                {visit.visitor.photoBase64 ? (
                  <Image source={{ uri: visit.visitor.photoBase64 }} style={{ width: 60, height: 60, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)' }} />
                ) : null}
              </View>
            </LinearGradient>

            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {[
                  ['Visiting',   visit.host?.name || 'N/A'],
                  ['Department', visit.department],
                  ['Purpose',    visit.reason],
                  ['Phone',      visit.visitor.phone],
                  ['Date',       new Date(visit.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                ].map(([label, value]) => (
                  <View key={label} style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, minWidth: '45%', flex: 1 }}>
                    <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.8, marginBottom: 2 }}>{label?.toUpperCase()}</Text>
                    <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '600' }}>{value}</Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <StatusBadge status={visit.status} />
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', borderStyle: 'dashed', paddingTop: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <QRCode value={visit.qrValue || visit.visitId} size={80} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.8, marginBottom: 4 }}>SCAN TO VERIFY</Text>
                  <Text style={{ fontFamily: 'monospace', fontSize: 9, color: '#64748b' }} numberOfLines={2}>{visit.visitId}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 14 }}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
