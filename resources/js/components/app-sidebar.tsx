import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AwardIcon, BookOpen, Code2Icon, IdCard, LayoutDashboard, LayoutGrid, QrCodeIcon, StampIcon, StoreIcon, TicketIcon, Users2Icon } from 'lucide-react';
import LOGO from '../../images/mainLogo.png';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/business/dashboard',
        icon: LayoutGrid,
    },
     {
        title: 'Staff Accounts',
        href: '/business/staffs',
        icon: StoreIcon,
    },
      {
        title: 'Issue Stamp',
        href: '/business/issue-stamp',
        icon: StampIcon,
    },
     {
        title: 'Perk Claims',
        href: '/business/perk-claims',
        icon: AwardIcon,
    },
       {
        title: 'Stamp Codes',
        href: '/business/stamp-codes',
        icon: Code2Icon,
    },
      {
        title: 'Loyalty Cards',
        href: '/business/card-templates',
        icon: IdCard,
    },
      {
        title: 'Customers',
        href: '/business/customers',
        icon: Users2Icon,
    },
          {
        title: 'QR Studio',
        href: '/business/qr-studio',
        icon: QrCodeIcon,
    },
     {
        title: 'Tickets',
        href: '/business/tickets',
        icon: TicketIcon,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '/documentation',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';
    const navItems: NavItem[] = isAdmin
        ? [
              {
                  title: 'Admin Dashboard',
                  href: '/admin/dashboard',
                  icon: LayoutDashboard,
              },
          ]
        : mainNavItems;
    const logoHref = isAdmin ? '/admin/dashboard' : '/business/dashboard';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <img src={LOGO} alt="logo" className='w-full' />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
