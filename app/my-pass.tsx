import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import StatusBadge from '../components/ui/StatusBadge';
import { getVisitPass } from '../services/visits';
import { getActiveVisit, saveActiveVisit, removeActiveVisit, isPassExpired } from '../services/storage';
import { Visit } from '../types';
import { Colors } from '../constants/colors';

export default function MyPassScreen() {
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadPass(); }, []);

  const loadPass = async () => {
    setLoading(true);
    setError('');
    try {
      const stored = await getActiveVisit();
      if (!stored) {
        setError('No active pass found');
        setLoading(false);
        return;
      }

      // Always verify with backend — don't trust stale local data
      const r = await getVisitPass(stored.visitId);
      const v = r.data;

      if (isPassExpired(v.status)) {
        // Pass expired — clean up and go home
        await removeActiveVisit();
        setError('Your pass is no longer active');
        setLoading(false);
        return;
      }

      // Update stored data with latest
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

      setVisit(v);
    } catch {
      setError('Could not load pass. Check your connection.');
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPass();
    setRefreshing(false);
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Pass',
      'Are you sure you want to remove your saved pass?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeActiveVisit();
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={Colors.accent} size="large" />
      <Text style={{ color: Colors.muted, marginTop: 12, fontSize: 13 }}>Loading your pass...</Text>
    </LinearGradient>
  );

  if (error) return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>🪪</Text>
      <Text style={{ color: Colors.danger, fontWeight: '800', fontSize: 18, textAlign: 'center' }}>{error}</Text>
      <TouchableOpacity onPress={() => router.replace('/')}
        style={{ marginTop: 24, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
        <Text style={{ color: Colors.accent, fontWeight: '700' }}>← Go Home</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  if (!visit) return null;

  return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={{ color: Colors.muted, fontSize: 14 }}>← Home</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2 }}>MY PASS</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
              <Text style={{ color: refreshing ? Colors.muted : Colors.accent, fontSize: 13, fontWeight: '700' }}>
                {refreshing ? '...' : '↻ Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pass card */}
          <View style={{ backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 }}>
            {/* Card header */}
            <LinearGradient colors={['#1e293b', '#0f172a']} style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 6 }}>
                    VISITOR PASS
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>{visit.visitor.name}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{visit.visitor.organizationName}</Text>
                </View>
                {visit.visitor.photoBase64 ? (
                  <Image
                    source={{ uri: visit.visitor.photoBase64 }}
                    style={{ width: 60, height: 60, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)' }}
                  />
                ) : null}
              </View>
            </LinearGradient>

            {/* Card body */}
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {[
                  ['Visiting',   visit.host?.name || 'N/A'],
                  ['Department', visit.department],
                  ['Purpose',    visit.reason],
                  ['Phone',      visit.visitor.phone],
                  ['Date',       new Date(visit.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                  ...(visit.inTime ? [['Checked In', new Date(visit.inTime).toLocaleTimeString()]] : []),
                  ...(visit.outTime ? [['Checked Out', new Date(visit.outTime).toLocaleTimeString()]] : []),
                ].map(([label, value]) => (
                  <View key={label} style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, minWidth: '45%', flex: 1 }}>
                    <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.8, marginBottom: 2 }}>
                      {label?.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '600' }}>{value}</Text>
                  </View>
                ))}
              </View>

              {/* Status */}
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <StatusBadge status={visit.status} />
              </View>

              {/* QR code */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', borderStyle: 'dashed', paddingTop: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <QRCode value={visit.qrValue || visit.visitId} size={90} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.8, marginBottom: 4 }}>
                    SCAN TO VERIFY
                  </Text>
                  <Text style={{ fontFamily: 'monospace', fontSize: 9, color: '#64748b' }} numberOfLines={2}>
                    {visit.visitId}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Remove pass button */}
          <TouchableOpacity
            onPress={handleRemove}
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 14, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.danger, fontWeight: '600', fontSize: 14 }}>🗑 Remove Saved Pass</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
