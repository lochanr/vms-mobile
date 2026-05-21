import { View, Text } from 'react-native';

const STATUS_CONFIG = {
  PENDING:     { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', label: 'PENDING'     },
  APPROVED:    { bg: 'rgba(16,185,129,0.15)',   color: '#10b981', label: 'APPROVED'    },
  REJECTED:    { bg: 'rgba(239,68,68,0.15)',    color: '#ef4444', label: 'REJECTED'    },
  CHECKED_IN:  { bg: 'rgba(99,102,241,0.15)',   color: '#818cf8', label: 'CHECKED IN'  },
  CHECKED_OUT: { bg: 'rgba(100,116,139,0.15)',  color: '#94a3b8', label: 'CHECKED OUT' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.color, letterSpacing: 0.8 }}>
        {cfg.label}
      </Text>
    </View>
  );
}
