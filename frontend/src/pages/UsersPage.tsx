import { useEffect, useMemo, useState } from "react";
import { api, ROLE_NAMES,type Role, type User} from "../api";
import { Alert, Button, Group, Paper, PasswordInput, Select, SimpleGrid, Stack, Table, TextInput } from "@mantine/core";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { EmptyState, PageHeader, TableSkeleton } from "../components";
import { notifyError, notifyOk } from "../notify";


const emptyForm = { name: '', email: '', password:'', role:'SPECIALIST' as Role}

export default function UsersPage() {
    const [users, setUsers] = useState<User[] | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({});
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [query, setQuery] = useState('');

    const load = () => {
        api<User[]>('/users')
            .then(setUsers)
            .catch((e) => setError(e.message));
    };
    useEffect(() => {
        load();
    }, []);

    async function create() {
        const next: typeof errors = {};
        if (!form.name.trim()) next.name = 'Add meg a nevet';
        if (!form.email.includes('@')) next.email = 'Érvényes e-mail címet adj meg';
        if (!form.password) next.password = 'Add meg a jelszót';
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        setSaving(true);
        try{
            await api('/users', {method: 'POST', body: form});
            setForm(emptyForm);
            setError('');
            setOpen(false);
            load();
            notifyOk('Felhasználó felvéve.');
        } catch (e){
            notifyError((e as Error).message);
        } finally {
            setSaving(false);
        }
    }

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (users ?? []).filter((u) => !q || `${u.name} ${u.email} ${ROLE_NAMES[u.role]}`.toLowerCase().includes(q));
    }, [users, query]);


    return (
        <Stack gap="md">
            <PageHeader
                title="Felhasználók"
                description="Fiókok és szerepkörök kezelése."
                action={
                    <Button leftSection={open ? <IconX size={16} /> : <IconPlus size={16} />} variant={open ? 'default' : 'filled'} onClick={() => setOpen(!open)}>
                        {open ? 'Mégse' : 'Új felhasználó'}
                    </Button>
                }
            />
            {error && <Alert color="red" role="alert">{error}</Alert>}

            {open && (
                <Paper className="panel" p="md">
                    <Stack gap="sm">
                        <SimpleGrid cols={{base: 1, sm: 2, lg: 4}}>
                            <TextInput
                                label="Név"
                                required
                                value={form.name}
                                error={errors.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value})}
                            />
                            <TextInput
                                label="E-mail"
                                type="email"
                                required
                                value={form.email}
                                error={errors.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value})}
                            />
                            <PasswordInput
                                label="Jelszó"
                                required
                                autoComplete="new-password"
                                value={form.password}
                                error={errors.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value})}
                            />
                            <Select
                                label="Szerepkör"
                                data={Object.entries(ROLE_NAMES).map(([value, label]) => ({value, label}))}
                                value={form.role}
                                onChange={(v) => setForm({...form, role: v as Role})}
                            />
                        </SimpleGrid>
                        <Group>
                            <Button loading={saving} onClick={create}>Felvétel</Button>
                        </Group>
                    </Stack>
                </Paper>
            )}

            <TextInput
                aria-label="Keresés a felhasználók között"
                placeholder="Keresés név, e-mail vagy szerepkör szerint"
                leftSection={<IconSearch size={16} />}
                w={{base: '100%', sm: 360}}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <div className="table-wrap">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Név</Table.Th>
                            <Table.Th>E-mail</Table.Th>
                            <Table.Th>Szerepkör</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    {users === null && !error ? (
                        <TableSkeleton rows={4} cols={3} />
                    ) : (
                        <Table.Tbody>
                            {visible.map((u) => (
                                <Table.Tr key={u.id}>
                                    <Table.Td fw={600}>{u.name}</Table.Td>
                                    <Table.Td>{u.email}</Table.Td>
                                    <Table.Td><span className="tag">{ROLE_NAMES[u.role]}</span></Table.Td>
                                </Table.Tr>
                            )) }
                        </Table.Tbody>
                    )}
                </Table>
                {users !== null && visible.length === 0 && (
                    <EmptyState title="Nincs találat" text="Próbálj másik keresőszót." />
                )}
            </div>
        </Stack>
    )
}
