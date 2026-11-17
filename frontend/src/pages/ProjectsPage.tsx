import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api, STATUS, STATUS_ORDER, type Project, type ProjectStatus } from "../api";
import { Alert, Button, Chip, Group, Paper, SimpleGrid, Stack, Table, Text, Textarea, TextInput } from "@mantine/core";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { EmptyState, PageHeader, SortTh, StatusBadge, TableSkeleton } from "../components";
import { notifyError, notifyOk } from "../notify";

const emptyForm = {location: '', description: '', customerName: '', customerPhone: '', customerEmail: ''};

type SortKey = 'id' | 'location' | 'customerName' | 'createdAt' | 'status';

export default function ProjectPage() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyForm, string>>>({});
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [filter, setFilter] = useState<ProjectStatus | 'ALL'>('ALL');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<{key: SortKey; dir: 'asc' | 'desc'}>({key: 'createdAt', dir: 'desc'});
    const open = params.get('new') === '1';

    useEffect(() => {
        api<Project[]>('/projects')
            .then(setProjects)
            .catch((e)=> setError(e.message));
    }, []);

    function setOpen(value: boolean) {
        setParams(value ? {new: '1'} : {}, {replace: true});
    }

    async function create() {
        const next: typeof errors = {};
        if (!form.location.trim()) next.location = 'Add meg a helyszínt';
        if (!form.customerName.trim()) next.customerName = 'Add meg a megrendelő nevét';
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        setCreating(true);
        try{
            const project = await api<Project>('/projects', {method: 'POST', body: form});
            notifyOk(`Projekt létrehozva: #${project.id}`);
            navigate(`/projects/${project.id}`);
        } catch(e) {
            notifyError((e as Error).message);
            setCreating(false);
        }
    }

    function toggleSort(key: SortKey) {
        setSort((s) => s.key === key ? {key, dir: s.dir === 'asc' ? 'desc' : 'asc'} : {key, dir: 'asc'});
    }

    const counts = useMemo(() => {
        const result: Partial<Record<ProjectStatus, number>> = {};
        for (const p of projects ?? []) result[p.status] = (result[p.status] ?? 0) + 1;
        return result;
    }, [projects]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const dir = sort.dir === 'asc' ? 1 : -1;
        const value = (p: Project) => {
            if (sort.key === 'status') return STATUS_ORDER.indexOf(p.status);
            if (sort.key === 'createdAt') return new Date(p.createdAt).getTime();
            return p[sort.key];
        };
        return (projects ?? [])
            .filter((p) => (filter === 'ALL' || p.status === filter)
                && (!q || `${p.id} ${p.location} ${p.customerName} ${p.description}`.toLowerCase().includes(q)))
            .sort((a, b) => {
                const va = value(a);
                const vb = value(b);
                if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb, 'hu') * dir;
                return ((va as number) - (vb as number)) * dir;
            });
    }, [projects, filter, query, sort]);

    const field = (key: keyof typeof emptyForm, label: string, required = false) => (
        <TextInput
            label={label}
            required={required}
            value={form[key]}
            error={errors[key]}
            onChange={(e)=> setForm({ ...form, [key]: e.target.value})}
        />
    );

    const statuses = STATUS_ORDER.filter((s) => counts[s]);
    const loading = projects === null && !error;

    return (
        <Stack gap="md">
            <PageHeader
                title="Projektek"
                description="Ügyfélprojektek az életciklusuk szerint."
                action={
                    <Button leftSection={open ? <IconX size={16} /> : <IconPlus size={16} />} variant={open ? 'default' : 'filled'} onClick={() => setOpen(!open)}>
                        {open ? 'Mégse' : 'Új projekt'}
                    </Button>
                }
            />
            {error && <Alert color="red" role="alert">{error}</Alert>}

            {open && (
                <Paper className="panel" p="md">
                    <Stack gap="sm">
                        <SimpleGrid cols={{base: 1, sm: 2, lg: 4}}>
                            {field('location', 'Helyszín', true)}
                            {field('customerName', 'Megrendelő', true)}
                            {field('customerPhone', 'Telefon')}
                            {field('customerEmail', 'E-mail')}
                        </SimpleGrid>
                        <Textarea
                            label="Leírás"
                            autosize
                            minRows={2}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value})}
                        />
                        <Group>
                            <Button onClick={create} loading={creating}>Projekt létrehozása</Button>
                        </Group>
                    </Stack>
                </Paper>
            )}

            <Group justify="space-between" gap="sm">
                <Chip.Group multiple={false} value={filter} onChange={(v) => setFilter(v as ProjectStatus | 'ALL')}>
                    <Group gap={8}>
                        <Chip value="ALL" variant="outline">Mind ({projects?.length ?? 0})</Chip>
                        {statuses.map((s) => (
                            <Chip key={s} value={s} variant="outline">{STATUS[s].label} ({counts[s]})</Chip>
                        ))}
                    </Group>
                </Chip.Group>
                <TextInput
                    aria-label="Keresés a projektek között"
                    placeholder="Keresés helyszín, megrendelő, azonosító"
                    leftSection={<IconSearch size={16} />}
                    w={{base: '100%', sm: 320}}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </Group>

            <div className="table-wrap">
                <Table highlightOnHover={false}>
                    <Table.Thead>
                        <Table.Tr>
                            <SortTh label="#" active={sort.key === 'id'} dir={sort.dir} onClick={() => toggleSort('id')} />
                            <SortTh label="Helyszín" active={sort.key === 'location'} dir={sort.dir} onClick={() => toggleSort('location')} />
                            <SortTh label="Megrendelő" active={sort.key === 'customerName'} dir={sort.dir} onClick={() => toggleSort('customerName')} />
                            <SortTh label="Létrehozva" active={sort.key === 'createdAt'} dir={sort.dir} onClick={() => toggleSort('createdAt')} />
                            <SortTh label="Állapot" active={sort.key === 'status'} dir={sort.dir} onClick={() => toggleSort('status')} />
                        </Table.Tr>
                    </Table.Thead>
                    {loading ? (
                        <TableSkeleton cols={5} />
                    ) : (
                        <Table.Tbody>
                            {visible.map((p) => (
                                <Table.Tr key={p.id} className="row-link" onClick={()=> navigate(`/projects/${p.id}`)}>
                                    <Table.Td>{p.id}</Table.Td>
                                    <Table.Td>
                                        <Link to={`/projects/${p.id}`} className="row-anchor" onClick={(e) => e.stopPropagation()}>
                                            {p.location}
                                        </Link>
                                    </Table.Td>
                                    <Table.Td>{p.customerName}</Table.Td>
                                    <Table.Td>{new Date(p.createdAt).toLocaleDateString('hu-HU')}</Table.Td>
                                    <Table.Td><StatusBadge status={p.status} /></Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    )}
                </Table>
                {!loading && visible.length === 0 && (
                    projects && projects.length > 0 ? (
                        <EmptyState
                            title="Nincs a szűrésnek megfelelő projekt"
                            text="Módosítsd a keresést, vagy válassz másik állapotot."
                            action={<Button variant="default" onClick={() => { setFilter('ALL'); setQuery(''); }}>Szűrők törlése</Button>}
                        />
                    ) : (
                        <EmptyState
                            title="Még nincs projekt"
                            text="Az első projekt felvételével indul az életciklus."
                            action={<Button onClick={() => setOpen(true)}>Új projekt</Button>}
                        />
                    )
                )}
            </div>
            {!loading && visible.length > 0 && (
                <Text size="sm" className="muted">{visible.length} projekt látható</Text>
            )}
        </Stack>
    )
}
