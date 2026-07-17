import type { LucideIcon } from 'lucide-react';

export interface PaginatedList<T> {
  data: T[];
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export type StaffDashboardTab = 'issue-stamp' | 'perk-claims' | 'stamp-codes' | 'account';

export interface LoyaltyCard {
  id: number;
  name: string;
  logo?: string;
}

export interface PerkClaim {
  id: number;
  customer_id: number;
  loyalty_card_id: number;
  perk_id: number;
  stamps_at_claim: number;
  is_redeemed: boolean;
  redeemed_at: string | null;
  remarks: string | null;
  created_at: string;
  customer: {
    id: number;
    username: string;
    email: string;
  };
  perk: {
    id: number;
    reward: string;
    details: string | null;
    stampNumber: number;
  };
  loyalty_card: {
    id: number;
    name: string;
    logo: string | null;
  };
  redeemed_by?: {
    id: number;
    username: string;
  };
}

export interface StampCodeRecord {
  id: number;
  code: string;
  customer: {
    username: string;
    email: string;
  } | null;
  used_at: string | null;
  is_expired: boolean;
  number_of_stamps: number;
  created_at: string;
  loyalty_card: {
    name: string;
  };
}

export interface GeneratedStampCode {
  success: boolean;
  code: string;
  qr_url: string;
  created_at: string;
  number_of_stamps?: number;
}

export interface StaffStats {
  total: number;
  available: number;
  redeemed: number;
}

export interface StaffNavItem {
  id: StaffDashboardTab;
  label: string;
  icon: LucideIcon;
  badge?: number;
  dot?: boolean;
}
