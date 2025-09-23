import {
    Grid2X2CheckIcon,
    LayoutDashboardIcon,
    MegaphoneIcon,
    Palette,
    PinIcon,
    Settings,
    Shield,
    StoreIcon,
    UserCog,
    ImageIcon,
    Users,
    UserCircle,
    ShieldCheck,
    Bot,
    FileText
} from 'lucide-react';
import { type SidebarData } from '../types';

// Helper function to check if user has permission for a resource
const hasPermission = (userPermissions: string[], resource: string): boolean => {
    return userPermissions.includes(`${resource}.view`)
}

// Single source of truth for sidebar data
const baseSidebarData: SidebarData = {
    navGroups: [
        {
            title: 'General',
            items: [
                {
                    title: 'Dashboard',
                    url: '/',
                    icon: LayoutDashboardIcon,
                    permission: null, // Dashboard is always accessible
                },
                {
                    title: 'Menu Buttons',
                    url: '/menu-buttons',
                    icon: Grid2X2CheckIcon,
                    permission: 'menu-buttons',
                },
                {
                    title: 'Store',
                    url: '/stores',
                    icon: StoreIcon,
                    permission: 'stores',
                },
                {
                    title: 'Advertisements',
                    url: '/advertisements',
                    icon: MegaphoneIcon,
                    permission: 'advertisements',
                },
                {
                    title: 'Pin Messages',
                    url: '/pin-messages',
                    icon: PinIcon,
                    permission: 'pin-messages',
                },
                {
                    title: 'Media Library',
                    url: '/media-library',
                    icon: ImageIcon,
                    permission: 'media',
                },
                {
                    title: 'Telegraph Bots',
                    url: '/telegraph/bots',
                    icon: Bot,
                    permission: 'telegraph',
                },
                {
                    title: 'Bot Templates',
                    url: '/bot-templates',
                    icon: FileText,
                    permission: 'bot-templates',
                },
                {
                    title: 'System User & Role',
                    icon: UserCircle,
                    permission: 'users',
                    items: [
                        {
                            title: 'Users',
                            url: '/users',
                            icon: Users,
                            permission: 'users',
                        },
                        {
                            title: 'Roles',
                            url: '/roles',
                            icon: ShieldCheck,
                            permission: 'roles',
                        }
                    ],
                },
            ],
        },
        {
            title: 'Other',
            items: [
                {
                    title: 'Settings',
                    icon: Settings,
                    items: [
                        {
                            title: 'Profile',
                            url: '/settings',
                            icon: UserCog,
                        },
                        {
                            title: 'Security',
                            url: '/settings/security',
                            icon: Shield,
                        },
                        {
                            title: 'Appearance',
                            url: '/settings/appearance',
                            icon: Palette,
                        },
                    ],
                },
            ],
        },
    ],
};

// Function to filter sidebar data based on user permissions
export const getFilteredSidebarData = (userPermissions: string[]): SidebarData => {
    // Filter each nav group without deep cloning to preserve React components
    const filteredNavGroups = baseSidebarData.navGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!item.permission) return true // Dashboard is always accessible
            if (item.items) {
                // For collapsible items, check if user has permission for any sub-item
                const hasSubItemPermission = item.items.some(subItem => 
                    hasPermission(userPermissions, subItem.permission!)
                )
                if (hasSubItemPermission) {
                    // Filter sub-items based on permissions
                    item.items = item.items.filter(subItem => 
                        hasPermission(userPermissions, subItem.permission!)
                    )
                    return true
                }
                return false
            }
            return hasPermission(userPermissions, item.permission)
        })
    }));

    return {
        navGroups: filteredNavGroups
    };
}
