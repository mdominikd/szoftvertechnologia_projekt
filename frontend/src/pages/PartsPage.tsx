import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import { api, huf, type Part } from "../api";
import { Alert, Button, Group, NumberInput, Paper, SimpleGrid, Stack, Table, Text, TextInput } from "@mantine/core";
import { IconCheck, IconPencil, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { EmptyState, PageHeader, TableSkeleton } from "../components";
import { notifyError, notifyOk } from "../notify";


export default function PartsPage() {
    const {user} = useAuth();
    const isManager = user!.role === 'WH_MANAGER';
    const [parts, setParts]= useState<Part[] | null>(null);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState('');
    const [newPart, setNewPart] = useState({name: '', price:0, maxPerBin: 1});
    const [edit, setEdit] = useState<{id: number; price: number; maxPerBin: number} | null>(null);

    const load = () =>
        api<Part[]>('/parts')
            .then(setParts)
            .catch((e) =>setError(e.message));
    useEffect(() => {
        load();
    }, []);


    async function save(path: string, method: string, body:unknown, okMessage: string) {
        setSaving(true);
        try {
            await api(path, {method,body});
            setError('');
            await load();
            notifyOk(okMessage);
            return true;
        }catch(e){
            notifyError((e as Error).message);
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function create() {
        if (!newPart.name.trim()) {
            setNameError('Add meg az alkatrész nevét');
            return;
        }
        setNameError('');
        if (await save('/parts', 'POST', newPart, 'Alkatrész felvéve.')) {
            setNewPart({name: '', price: 0, maxPerBin: 1});
            setOpen(false);
        }
    }

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (parts ?? [])
            .filter((p) => !q || p.name.toLowerCase().includes(q))
            .sort((a, b) => a.name.localeCompare(b.name, 'hu'));
    }, [parts, query]);

    const loading = parts === null && !error;
    const columns = isManager ? 7 : 6;

    return (
        <Stack gap="md">
            <PageHeader
                title="Alkatrészek"
                description="Katalógus készlettel, foglalással és szabad mennyiséggel."
                action={isManager && (
                    <Button leftSection={open ? <IconX size={16} /> : <IconPlus size={16} />} variant={open ? 'default' : 'filled'} onClick={() => setOpen(!open)}>
                        {open ? 'Mégse' : 'Új alkatrész'}
                    </Button>
                )}
            />
            {error && <Alert color="red" role="alert">{error}</Alert>}

            {isManager && open && (
                <Paper className="panel" p="md">
                    <Stack gap="sm">
                        <SimpleGrid cols={{base: 1, sm: 3}}>
                            <TextInput
                                label="Név"
                                required
                                value={newPart.name}
                                error={nameError}
                                onChange={(e) => setNewPart({ ...newPart, name: e.target.value})}
                            />
                            <NumberInput
                                label="Egységár (Ft)"
                                min={0}
                                thousandSeparator=" "
                                value={newPart.price}
                                onChange={(v) => setNewPart({...newPart, price: Number(v)})}
                            />
                            <NumberInput
                                label="Max / rekesz"
                                value={newPart.maxPerBin}
                                min={1}
                                onChange={(v) => setNewPart({...newPart,maxPerBin: Number(v)})}
                            />
                        </SimpleGrid>
                        <Group>
                            <Button loading={saving} onClick={create}>Felvétel</Button>
                        </Group>
                    </Stack>
                </Paper>
            )}

            <TextInput
                aria-label="Keresés az alkatrészek között"
                placeholder="Keresés név szerint"
                leftSection={<IconSearch size={16} />}
                w={{base: '100%', sm: 320}}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <div className="table-wrap">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Név</Table.Th>
                            <Table.Th className="num">Ár</Table.Th>
                            <Table.Th className="num">Max / rekesz</Table.Th>
                            <Table.Th className="num">Készlet</Table.Th>
                            <Table.Th className="num">Foglalt</Table.Th>
                            <Table.Th className="num">Elérhető</Table.Th>
                            {isManager && <Table.Th />}
                        </Table.Tr>
                    </Table.Thead>
                    {loading ? (
                        <TableSkeleton cols={columns} />
                    ) : (
                        <Table.Tbody>
                            {visible.map((p)=> {
                                const editing = edit?.id === p.id;
                                return (
                                    <Table.Tr key={p.id}>
                                        <Table.Td fw={600}>{p.name}</Table.Td>
                                        <Table.Td className="num">
                                            {editing ? (
                                                <NumberInput
                                                    aria-label="Új ár"
                                                    size="xs"
                                                    min={0}
                                                    w={120}
                                                    ml="auto"
                                                    thousandSeparator=" "
                                                    value={edit.price}
                                                    onChange={(v) => setEdit({...edit, price: Number(v)})}
                                                />
                                            ) : huf(p.price)}
                                        </Table.Td>
                                        <Table.Td className="num">
                                            {editing ? (
                                                <NumberInput
                                                    aria-label="Új max / rekesz"
                                                    size="xs"
                                                    min={1}
                                                    w={90}
                                                    ml="auto"
                                                    value={edit.maxPerBin}
                                                    onChange={(v)=> setEdit({ ...edit, maxPerBin: Number(v)})}
                                                />
                                            ) : p.maxPerBin}
                                        </Table.Td>
                                        <Table.Td className="num">{p.stock}</Table.Td>
                                        <Table.Td className="num">{p.reserved}</Table.Td>
                                        <Table.Td className="num" fw={700} c={p.free <= 0 ? '#c92a2a' : undefined}>{p.free}</Table.Td>
                                        {isManager && (
                                            <Table.Td>
                                                {editing ? (
                                                    <Group gap={6} justify="flex-end" wrap="nowrap">
                                                        <Button
                                                            size="compact-sm"
                                                            leftSection={<IconCheck size={14} />}
                                                            loading={saving}
                                                            onClick={async () => {
                                                                if (await save(`/parts/${p.id}`, 'PATCH', {price: edit.price, maxPerBin: edit.maxPerBin}, 'Alkatrész módosítva.')) setEdit(null);
                                                            }}
                                                        >Mentés</Button>
                                                        <Button size="compact-sm" variant="default" onClick={() => setEdit(null)}>Mégse</Button>
                                                    </Group>
                                                ) : (
                                                    <Group justify="flex-end">
                                                        <Button
                                                            size="compact-sm"
                                                            variant="default"
                                                            leftSection={<IconPencil size={14} />}
                                                            onClick={() => setEdit({id: p.id, price: p.price, maxPerBin: p.maxPerBin})}
                                                        >Szerkesztés</Button>
                                                    </Group>
                                                )}
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    )}
                </Table>
                {!loading && visible.length === 0 && (
                    <EmptyState
                        title={parts && parts.length > 0 ? 'Nincs ilyen alkatrész' : 'Még nincs alkatrész a katalógusban'}
                        text={parts && parts.length > 0 ? 'Próbálj másik keresőszót.' : isManager ? 'Vedd fel az első alkatrészt az Új alkatrész gombbal.' : undefined}
                    />
                )}
            </div>
            {!loading && visible.length > 0 && (
                <Text size="sm" className="muted">{visible.length} alkatrész</Text>
            )}
        </Stack>
    )
}
