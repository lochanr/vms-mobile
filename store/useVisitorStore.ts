import { create } from 'zustand';
import { Host } from '../types';

interface VisitorStore {
  // OTP step
  phone: string;
  email: string;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;

  // Photo step
  photoUri: string;
  photoBase64: string;
  setPhoto: (uri: string, base64: string) => void;

  // Returning visitor
  returningVisitor: any | null;
  setReturningVisitor: (v: any | null) => void;

  // Visit submission
  visitDbId: number | null;        // DB id — used for polling
  visitId: string | null;          // cuid — used for pass
  setVisitIds: (dbId: number, visitId: string) => void;

  // Reset entire flow
  reset: () => void;
}

export const useVisitorStore = create<VisitorStore>((set) => ({
  phone: '',
  email: '',
  setPhone: (phone) => set({ phone }),
  setEmail: (email) => set({ email }),

  photoUri: '',
  photoBase64: '',
  setPhoto: (uri, base64) => set({ photoUri: uri, photoBase64: base64 }),

  returningVisitor: null,
  setReturningVisitor: (v) => set({ returningVisitor: v }),

  visitDbId: null,
  visitId: null,
  setVisitIds: (dbId, visitId) => set({ visitDbId: dbId, visitId }),

  reset: () => set({
    phone: '', email: '',
    photoUri: '', photoBase64: '',
    returningVisitor: null,
    visitDbId: null, visitId: null,
  }),
}));
