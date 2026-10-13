import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useContractorStore = create(
  persist(
    (set) => ({
      profile: {
        name: 'Saurabh Patel',
        contractorId: 'NIT-S-2026',
        jurisdiction: 'Bihar / North Zone',
        affiliation: 'NIT Patna, Bihar',
        divisionBadge: 'Bihar Public Works Division',
        accountAuth: 'Google Verified',
        registrationClass: 'Class A Works',
        portalVerification: 'Active • L1 Compliant',
        status: 'Active',
      },
      updateProfile: (updatedFields) =>
        set((state) => ({
          profile: { ...state.profile, ...updatedFields },
        })),
    }),
    { name: 'bihartenders_contractor_profile' }
  )
);
