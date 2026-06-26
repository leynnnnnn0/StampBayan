import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    customer?: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name?: string;
    username: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash?: FlashMessages;
    [key: string]: unknown;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export type StampShapeName =
    | 'circle'
    | 'star'
    | 'square'
    | 'hexagon'
    | 'heart'
    | 'diamond'
    | 'triangle'
    | 'oval';

export interface CardTemplatePerk {
    stampNumber: number;
    reward: string;
    color: string;
    details?: string;
}

export interface CardTemplate {
    id: number;
    logo?: string | null;
    name: string;
    heading: string;
    subheading: string;
    stampsNeeded: number;
    mechanics: string;
    backgroundColor: string;
    valid_until?: string | null;
    valid_until_formatted?: string | null;
    textColor: string;
    stampColor: string;
    stampFilledColor: string;
    stampEmptyColor: string;
    stampImage?: string | null;
    backgroundImage?: string | null;
    footer: string;
    stampShape: StampShapeName;
    perks: CardTemplatePerk[];
    is_expired?: boolean;
}

export interface StampCode {
    id: number;
    code: string;
    number_of_stamps: number;
    used_at?: string | null;
    created_at?: string;
    qr_url?: string;
    customer?: {
        id: number;
        username: string;
        email: string;
    } | null;
    loyalty_card?: Pick<CardTemplate, 'id' | 'name' | 'heading'> | null;
}
