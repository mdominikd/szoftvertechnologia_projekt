import type { ReactNode } from "react";
import { useEffect } from "react";
import { ROLE_NAMES, type Role } from "./api";
import { useAuth } from "./auth";
import { Link, useLocation, useNavigate } from "react-router";
import { ActionIcon, AppShell, Avatar, Burger, Group, Text, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Spotlight, spotlight, type SpotlightActionData } from "@mantine/spotlight";
import {
    IconAlertTriangle,
    IconBuildingWarehouse,
    IconClipboardList,
    IconListCheck,
    IconLogout,
    IconMoon,
    IconPackage,
    IconPackageImport,
    IconPlus,
    IconSearch,
    IconSun,
    IconUsers,
    type Icon,
} from "@tabler/icons-react";
import { RackMark } from "./components";

export const MENU: Record<Role, {path: string;label: string; icon: Icon} []> = {
    ADMIN: [{ path:'/users',label:'Felhasználók', icon: IconUsers}],
    WH_MANAGER: [
        { path:'/parts',label:'Alkatrészek', icon: IconPackage},
        { path:'/warehouse',label:'Raktár', icon: IconBuildingWarehouse},
        { path:'/stock-in',label:'Bevételezés', icon: IconPackageImport},
        { path:'/missing',label:'Hiánylisták', icon: IconAlertTriangle},
    ],
    SPECIALIST: [
        { path:'/projects',label:'Projektek', icon: IconClipboardList},
        { path:'/parts',label:'Alkatrészek', icon: IconPackage},
    ],
    WH_WORKER: [
        { path:'/picking',label:'Kivételezés', icon: IconListCheck},
        { path:'/warehouse',label:'Raktár', icon: IconBuildingWarehouse},
    ],
}

export default function Layout({children}: {children: ReactNode}) {
    const {user, logout} = useAuth();
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [opened, {toggle, close}] = useDisclosure(false);
    const {setColorScheme} = useMantineColorScheme();
    const scheme = useComputedColorScheme('light');
    const menu = MENU[user!.role];

    useEffect(() => {
        close();
    }, [pathname]);

    const actions: SpotlightActionData[] = [
        ...menu.map((item) => ({
            id: item.path,
            label: item.label,
            description: 'Ugrás az oldalra',
            leftSection: <item.icon size={20} stroke={1.75} />,
            onClick: () => navigate(item.path),
        })),
    ];
    if (user!.role === 'SPECIALIST') {
        actions.push({
            id: 'new-project',
            label: 'Új projekt',
            description: 'Projekt felvétele',
            leftSection: <IconPlus size={20} stroke={1.75} />,
            onClick: () => navigate('/projects?new=1'),
        });
    }
    if (user!.role === 'WH_MANAGER') {
        actions.push({
            id: 'new-stock-in',
            label: 'Új bevételezés',
            description: 'Készlet felvétele a raktárba',
            leftSection: <IconPlus size={20} stroke={1.75} />,
            onClick: () => navigate('/stock-in'),
        });
    }
    actions.push({
        id: 'theme',
        label: scheme === 'dark' ? 'Világos téma' : 'Sötét téma',
        description: 'Megjelenés váltása',
        leftSection: scheme === 'dark' ? <IconSun size={20} stroke={1.75} /> : <IconMoon size={20} stroke={1.75} />,
        onClick: () => setColorScheme(scheme === 'dark' ? 'light' : 'dark'),
    });
    actions.push({
        id: 'logout',
        label: 'Kijelentkezés',
        leftSection: <IconLogout size={20} stroke={1.75} />,
        onClick: logout,
    });

    return(
        <AppShell
            header={{height: 56}}
            navbar={{ width: 232, breakpoint: 'sm', collapsed: {mobile: !opened}}}
            padding="md"
        >
            <AppShell.Header className="topbar" px="md">
                <Group h="100%" justify="space-between" wrap="nowrap" gap="sm">
                    <Group gap="sm" wrap="nowrap" style={{flex: 1}}>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Menü" />
                        <button type="button" className="search-trigger" onClick={() => spotlight.open()}>
                            <IconSearch size={16} />
                            <span className="search-label">Ugrás bárhová</span>
                            <kbd>Ctrl K</kbd>
                        </button>
                    </Group>
                    <Group gap="sm" wrap="nowrap">
                        <Tooltip label={scheme === 'dark' ? 'Világos téma' : 'Sötét téma'} openDelay={400}>
                            <ActionIcon
                                variant="default"
                                size="lg"
                                aria-label="Téma váltása"
                                onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
                            >
                                {scheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                            </ActionIcon>
                        </Tooltip>
                        <Group gap={8} wrap="nowrap" visibleFrom="xs">
                            <Avatar size={32} color="rack" variant="filled" radius="sm">
                                {user!.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                            </Avatar>
                            <div>
                                <Text size="sm" fw={600} lh={1.2}>{user!.name}</Text>
                                <Text size="xs" className="muted" lh={1.2}>{ROLE_NAMES[user!.role]}</Text>
                            </div>
                        </Group>
                        <Tooltip label="Kijelentkezés" openDelay={400}>
                            <ActionIcon variant="default" size="lg" aria-label="Kijelentkezés" onClick={logout}>
                                <IconLogout size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="sm" className="rail">
                <div className="rail-brand">
                    <RackMark size={32} light />
                    Napelem raktár
                </div>
                <nav aria-label="Főmenü">
                    {menu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="rail-link"
                            aria-current={pathname.startsWith(item.path) ? 'page' : undefined}
                        >
                            <item.icon size={20} stroke={1.75} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="rail-foot">
                    Gyorskeresés: <kbd>Ctrl K</kbd>
                </div>
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
            <Spotlight
                actions={actions}
                nothingFound="Nincs találat"
                searchProps={{ leftSection: <IconSearch size={18} />, placeholder: 'Ugrás oldalra vagy művelethez…' }}
            />
        </AppShell>
    );
}
