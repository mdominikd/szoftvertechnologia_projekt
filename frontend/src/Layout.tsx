import type { ReactNode } from "react";
import { ROLE_NAMES, type Role } from "./api";
import { useAuth } from "./auth";
import { Link, useLocation } from "react-router";
import { AppShell,Group,Title,Text, Badge, Button, NavLink } from "@mantine/core";

export const MENU: Record<Role, {path: string;label: string} []> = {
    ADMIN: [{ path:'/users',label:'felhasznalok'}],
    WH_MANAGER: [
        { path:'/parts',label:'Alkatreszek'},
        { path:'/warehouse',label:'Raktar'},
    ],
    SPECIALIST: [{ path:'/parts',label:'Alkatreszek'}],
    WH_WORKER: [{ path:'/warehouse',label:'Raktar'}],
}

export default function Layout({children}: {children: ReactNode}) {
    const {user, logout} = useAuth();
    const {pathname} = useLocation();

    return(
        <AppShell header={{height: 56}} navbar={{ width:200, breakpoint: 'sm'}} padding="md">
            <AppShell.Header px='md'>
                <Group h="100%" justify="sapce-beetween">
                    <Title order={4}>Napelem raktar</Title>
                        <Group>
                            <Text>{user!.name}</Text>
                            <Badge>{ROLE_NAMES[user!.role]}</Badge>
                            <Button variant="Light" size="sx" onClick={logout}>Kijelentkezes</Button>
                        </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="xs">
                {MENU[user!.role].map((item) =>(
                    <NavLink
                        key={item.path}
                        component={Link}
                        to={item.path}
                        label={item.label}
                        active={pathname.startsWith(item.path)}
                    />
                ))}
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}