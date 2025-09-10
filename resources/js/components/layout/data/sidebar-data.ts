import {
    Grid2X2CheckIcon,
    LayoutDashboardIcon,
    MegaphoneIcon,
    Palette,
    PinIcon,
    Settings,
    StoreIcon,
    UserCog,
    ImageIcon
} from 'lucide-react';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
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
                {
                    title: 'Media Library',
                    url: '/media-library',
                    icon: ImageIcon,
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
