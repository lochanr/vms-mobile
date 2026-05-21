import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useVisitorStore } from '../store/useVisitorStore';
import { getHosts, createVisit } from '../services/visits';
import { Host } from '../types';
import { Colors } from '../constants/colors';

export default function DetailsScreen() {
  const router = useRouter();
  const { phone, email, photoBase64, returningVisitor, setVisitIds } = useVisitorStore();

  const [profile, setProfile] = useState({
    name:             returningVisitor?.name             || '',
    organizationName: returningVisitor?.organizationName || '',
    idProofNumber:    returningVisitor?.idProofNumber    || '',
    vehicleNumber:    returningVisitor?.vehicleNumber    || '',
  });
  const [visit, setVisit] = useState({ hostId: '', department: '', reason: '' });
  const [hosts, setHosts] = useState<Host[]>([]);
  const [showHostPicker, setShowHostPicker] = useState(false);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getHosts().then(r => setHosts(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!profile.name || !profile.organizationName || !visit.hostId || !visit.department || !visit.reason)
      return Alert.alert('Error', 'Please fill all required fields');

    setLoading(true);
    try {
      const res = await createVisit({
        phone, email, photoBase64,
        name: profile.name,
        organizationName: profile.organizationName,
        idProofNumber: profile.idProofNumber,
        vehicleNumber: profile.vehicleNumber,
        hostId: parseInt(visit.hostId),
        department: visit.department,
        reason: visit.reason,
      });
      setVisitIds(res.data.id, res.data.visitId);
      router.push({ pathname: '/waiting', params: { id: res.data.id } });
    } catch {
      Alert.alert('Error', 'Submission failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#0f172a', '#080c14']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 28 }}>
            <Text style={{ color: Colors.muted, fontSize: 14 }}>← Back</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 11, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 8 }}>STEP 3 OF 3</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 4 }}>Visit Details</Text>
            {returningVisitor && <Text style={{ color: Colors.success, fontSize: 12 }}>Profile pre-filled — update if needed</Text>}
          </View>

          {/* Profile section */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 14 }}>VISITOR PROFILE</Text>
            <Input label="Full Name *" value={profile.name} onChangeText={t => setProfile(p => ({ ...p, name: t }))} placeholder="John Doe" />
            <Input label="Organization *" value={profile.organizationName} onChangeText={t => setProfile(p => ({ ...p, organizationName: t }))} placeholder="Acme Corp" />
            <Input label="ID Proof (optional)" value={profile.idProofNumber} onChangeText={t => setProfile(p => ({ ...p, idProofNumber: t }))} placeholder="Aadhaar / Passport" />
            <Input label="Vehicle Number (optional)" value={profile.vehicleNumber} onChangeText={t => setProfile(p => ({ ...p, vehicleNumber: t }))} placeholder="KA 01 AB 1234" />
            <Input label="Phone" value={phone} editable={false} placeholder={phone} style={{ opacity: 0.5 }} />
          </Card>

          {/* Visit section */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 10, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 14 }}>THIS VISIT</Text>

            {/* Host picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, color: Colors.muted, fontWeight: '600', letterSpacing: 1, marginBottom: 6 }}>PERSON TO VISIT *</Text>
              <TouchableOpacity
                onPress={() => setShowHostPicker(!showHostPicker)}
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Text style={{ color: selectedHost ? Colors.text : Colors.muted, fontSize: 15 }}>
                  {selectedHost ? selectedHost.name : 'Select a person...'}
                </Text>
              </TouchableOpacity>
              {showHostPicker && (
                <View style={{ marginTop: 8, backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  {hosts.map(h => (
                    <TouchableOpacity
                      key={h.id}
                      onPress={() => { setSelectedHost(h); setVisit(v => ({ ...v, hostId: String(h.id) })); setShowHostPicker(false); }}
                      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600' }}>{h.name}</Text>
                      <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 2 }}>{h.email}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Input label="Department *" value={visit.department} onChangeText={t => setVisit(v => ({ ...v, department: t }))} placeholder="Engineering" />
            <Input label="Purpose *" value={visit.reason} onChangeText={t => setVisit(v => ({ ...v, reason: t }))} placeholder="Meeting / Interview" />
          </Card>

          <Button label={loading ? 'Submitting...' : 'Submit Visit Request →'} onPress={handleSubmit} loading={loading} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
