import * as SecureStore from 'expo-secure-store';

const KEY = 'active_visit';

export type ActiveVisit = {
  visitId: string;
  requestId: number;
  phone: string;
  visitorName: string;
  hostName: string;
  status: string;
  approvedAt?: string;
  photo?: string;
};

// Save active visit pass
export const saveActiveVisit = async (data: ActiveVisit): Promise<void> => {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('saveActiveVisit failed:', e);
  }
};

// Get saved active visit
export const getActiveVisit = async (): Promise<ActiveVisit | null> => {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveVisit;
  } catch (e) {
    console.error('getActiveVisit failed:', e);
    return null;
  }
};

// Remove saved pass
export const removeActiveVisit = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (e) {
    console.error('removeActiveVisit failed:', e);
  }
};

// Statuses that mean pass is no longer valid
export const isPassExpired = (status: string): boolean =>
  ['CHECKED_OUT', 'REJECTED', 'PENDING'].includes(status);
