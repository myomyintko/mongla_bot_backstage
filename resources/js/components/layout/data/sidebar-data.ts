import {
    Bell,
    Grid2X2CheckIcon,
    LayoutDashboardIcon,
    MegaphoneIcon,
    Monitor,
    Palette,
    PinIcon,
    Settings,
    StoreIcon,
    UserCheck,
    UserCog,
    UserPlus,
    Users,
    Wrench,
} from 'lucide-react';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
    user: {
        name: 'satnaing',
        email: 'satnaingdev@gmail.com',
        avatar: '/avatars/shadcn.jpg',
    },
    navGroups: [
        {
            title: 'General',
            items: [
                {
                    title: 'Dashboard',
                    url: '/',
                    icon: LayoutDashboardIcon,
                },
                {
                    title: 'Menu Buttons',
                    url: '/menu-buttons',
                    icon: Grid2X2CheckIcon,
                },
                {
                    title: 'Store',
                    url: '/stores',
                    icon: StoreIcon,
                },
                {
                    title: 'Advertisements',
                    url: '/advertisements',
                    icon: MegaphoneIcon,
                },
                {
                    title: 'Pin Messages',
                    url: '/pin-messages',
                    icon: PinIcon,
                },
                // {
                //     title: 'System User & Role',
                //     icon: UserPlus,
                //     items: [
                //         {
                //             title: 'Users',
                //             url: '/users',
                //             icon: Users,
                //         },
                //         {
                //             title: 'Roles',
                //             url: '/roles',
                //             icon: UserCheck,
                //         }
                //     ],
                // },
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
                            title: 'Account',
                            url: '/settings/account',
                            icon: Wrench,
                        },
                        {
                            title: 'Appearance',
                            url: '/settings/appearance',
                            icon: Palette,
                        },
                        {
                            title: 'Notifications',
                            url: '/settings/notifications',
                            icon: Bell,
                        },
                        {
                            title: 'Display',
                            url: '/settings/display',
                            icon: Monitor,
                        },
                    ],
                },
            ],
        },
    ],
};
