import { Link, useParams } from "react-router";
import { api, EDITABLE, huf, NEXT_STEP, STATUS, type Part, type ProjectDetail } from "../api";
import { useEffect, useState } from "react";
import { Alert, Button, Group, NumberInput, Paper, Progress, Select, SimpleGrid, Skeleton, Stack, Table, Text, Timeline, Title } from "@mantine/core";
import { IconArrowLeft, IconCalculator, IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { LifecycleSteps, PageHeader, StatusBadge } from "../components";
import { notifyError, notifyOk } from "../notify";


type Calculation = {
    partsCost: number;
    laborCost: number;
    total: number;
    missing: { partId: number; name: string; missing: number} [];
}


export default function ProjectDetalPage() {
    const {id} = useParams();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [parts, setParts] = useState<Part[]>([]);
    const [add, setAdd] = useState({partId: null as string | null, quanity: 1});
    const [work, setWork] = useState({workHours: 0, laborCost: 0});
    const [calc, setCalc] = useState<Calculation | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [closing, setClosing] = useState(false);

    async function load() {
        const p = await api<ProjectDetail>(`/projects/${id}`);
        setProject(p);
        setWork({workHours: p.workHours, laborCost: p.laborCost});
        setParts(await api<Part[]>('/parts'));
    }

    useEffect(() => {
        load().catch((e) => setError(e.message));
    }, [id]);


    async function run<T>(path: string, method: string, body?: unknown, okMessage?: string) {
        setBusy(true);
        try {
            const rs = await api<T>(`/projects/${id}${path}`, {method, body});
            setError('');
            await load();
            if (okMessage) notifyOk(okMessage);
            return rs ?? (true as unknown as T);
        } catch (error) {
            notifyError((error as Error).message);
        } finally {
            setBusy(false);
        }
    }

    if(!project) {
        return error ? (
            <Stack>
                <Alert color="red" role="alert">{error}</Alert>
                <Button component={Link} to="/projects" variant="default" leftSection={<IconArrowLeft size={16} />} w="fit-content">Vissza a projektekhez</Button>
            </Stack>
        ) : (
            <Stack>
                <Skeleton height={32} width={260} />
                <Skeleton height={80} />
                <Skeleton height={220} />
            </Stack>
        );
    }

    const editable = EDITABLE.includes(project.status);
    const canCalculate = project.status === 'DRAFT' || project.status === 'WAIT';
    const partsTotal = project.parts.reduce((sum, pp) => sum + pp.quanity * pp.part.price, 0);
    const missingCount = project.parts.filter((pp) => pp.reserved < pp.quanity).length;
    const selectedPart = parts.find((p) => String(p.id) === add.partId);
    const alreadyAdded = (partId: number) => project.parts.some((pp) => pp.partId === partId);

    async function calculate() {
        const result = await run<Calculation>('/calculate', 'POST');
        if (!result) return;
        setCalc(result);
        notifyOk(result.missing.length > 0 ? 'Az árkalkuláció kész, hiányzó alkatrész miatt a projekt várakozik.' : 'Az árkalkuláció kész, a projekt ütemezett.');
    }

    async function close(success: boolean) {
        const result = await run('/close', 'POST', {success}, success ? 'A projekt sikeresen lezárva.' : 'A projekt sikertelenként lezárva.');
        if (result) setClosing(false);
    }

    return (
        <Stack gap="md">
            <Button component={Link} to="/projects" variant="subtle" color="gray" size="compact-sm" leftSection={<IconArrowLeft size={14} />} w="fit-content" ml={-8}>
                Projektek
            </Button>
            <PageHeader
                title={`#${project.id} ${project.location}`}
                description={project.description || undefined}
                action={<StatusBadge status={project.status} />}
            />

            <Paper className="panel" p="md">
                <LifecycleSteps status={project.status} />
            </Paper>

            <Paper className="panel next-step">
                <Text>{NEXT_STEP[project.status]}</Text>
                {canCalculate && (
                    <Button leftSection={<IconCalculator size={16} />} loading={busy} onClick={calculate}>Árkalkuláció</Button>
                )}
                {project.status === 'IN_PROGRESS' && !closing && (
                    <Button onClick={() => setClosing(true)}>Projekt lezárása</Button>
                )}
                {project.status === 'IN_PROGRESS' && closing && (
                    <Group gap="xs">
                        <Button color="teal" leftSection={<IconCheck size={16} />} loading={busy} onClick={() => close(true)}>Sikeres lezárás</Button>
                        <Button color="red" variant="outline" leftSection={<IconX size={16} />} loading={busy} onClick={() => close(false)}>Sikertelen</Button>
                        <Button variant="default" onClick={() => setClosing(false)}>Mégse</Button>
                    </Group>
                )}
            </Paper>

            {calc && (
                <Paper className="panel" p="md">
                    <Stack gap="xs">
                        <Title order={2}>Árkalkuláció</Title>
                        <Group gap="xl">
                            <div>
                                <Text size="sm" className="muted">Alkatrészek</Text>
                                <Text fw={600}>{huf(calc.partsCost)}</Text>
                            </div>
                            <div>
                                <Text size="sm" className="muted">Munkadíj</Text>
                                <Text fw={600}>{huf(calc.laborCost)}</Text>
                            </div>
                            <div>
                                <Text size="sm" className="muted">Összesen</Text>
                                <Text fw={700} size="xl">{huf(calc.total)}</Text>
                            </div>
                        </Group>
                        {calc.missing.length > 0 && (
                            <Alert color="orange" title={`A projekt ${STATUS.WAIT.label} állapotba került`}>
                                Hiányzó alkatrészek: {calc.missing.map((m) => `${m.name} (${m.missing} db)`).join(', ')}
                            </Alert>
                        )}
                    </Stack>
                </Paper>
            )}

            <SimpleGrid cols={{base: 1, md: 3}} spacing="md">
                <Stack gap="md" className="span-2">
                    <Title order={2}>Alkatrészek</Title>
                    <div className="table-wrap">
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Alkatrész</Table.Th>
                                    <Table.Th className="num">Mennyiség</Table.Th>
                                    <Table.Th>Lefoglalva</Table.Th>
                                    <Table.Th className="num">Hiányzik</Table.Th>
                                    <Table.Th className="num">Érték</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {project.parts.map((pp) =>(
                                    <Table.Tr key={pp.partId}>
                                        <Table.Td fw={600}>{pp.part.name}</Table.Td>
                                        <Table.Td className="num">{pp.quanity}</Table.Td>
                                        <Table.Td miw={140}>
                                            <Progress
                                                value={pp.quanity === 0 ? 0 : (pp.reserved / pp.quanity) * 100}
                                                color={pp.reserved < pp.quanity ? 'orange' : 'teal'}
                                                size="sm"
                                                aria-label={`${pp.reserved} / ${pp.quanity} lefoglalva`}
                                            />
                                            <Text size="xs" className="muted" mt={2}>{pp.reserved} / {pp.quanity}</Text>
                                        </Table.Td>
                                        <Table.Td className="num" fw={pp.quanity > pp.reserved ? 700 : 400} c={pp.quanity > pp.reserved ? '#c92a2a' : undefined}>
                                            {pp.quanity > pp.reserved ? pp.quanity - pp.reserved : '–'}
                                        </Table.Td>
                                        <Table.Td className="num">{huf(pp.quanity * pp.part.price)}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                            {project.parts.length > 0 && (
                                <Table.Tfoot>
                                    <Table.Tr>
                                        <Table.Td colSpan={4} fw={600}>Alkatrészek összesen</Table.Td>
                                        <Table.Td className="num" fw={700}>{huf(partsTotal)}</Table.Td>
                                    </Table.Tr>
                                </Table.Tfoot>
                            )}
                        </Table>
                        {project.parts.length === 0 && (
                            <Text className="muted" ta="center" py="xl">
                                Még nincs alkatrész a projektben.{editable ? ' Add hozzá az elsőt lent.' : ''}
                            </Text>
                        )}
                    </div>
                    {missingCount > 0 && project.parts.length > 0 && (
                        <Text size="sm" className="muted">{missingCount} tételből hiányzik készlet. A bevételezés után futtasd újra az árkalkulációt.</Text>
                    )}

                    {editable && (
                        <Paper className="panel" p="md">
                            <Stack gap="sm">
                                <Title order={3}>Alkatrész hozzáadása</Title>
                                <Group align="flex-end" gap="sm">
                                    <Select
                                        label="Alkatrész"
                                        searchable
                                        placeholder="Válassz alkatrészt"
                                        w={{base: '100%', sm: 380}}
                                        data={parts.map((p) => ({
                                            value: String(p.id),
                                            label: `${p.name}${alreadyAdded(p.id) ? ' (már a projektben)' : ''}`,
                                        }))}
                                        value={add.partId}
                                        onChange={(partId) => setAdd({...add, partId})}
                                    />
                                    <NumberInput
                                        label="Darab"
                                        min={1}
                                        w={110}
                                        value={add.quanity}
                                        onChange={(v) => setAdd({...add, quanity: Number(v)})}
                                    />
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        disabled={!add.partId || add.quanity < 1}
                                        loading={busy}
                                        onClick={async ()=> {
                                            const result = await run('/parts', 'POST', {partId: Number(add.partId), quanity: add.quanity}, 'Alkatrész hozzáadva.');
                                            if (result) setAdd({partId: null, quanity: 1});
                                        }}
                                    >Hozzáadás</Button>
                                </Group>
                                {selectedPart && (
                                    <Text size="sm" className="muted">
                                        Szabad készlet: <b>{selectedPart.free} db</b> · Egységár: {huf(selectedPart.price)}
                                        {selectedPart.free < add.quanity && ' · A hiányzó mennyiség előfoglalásként kerül a projektbe.'}
                                    </Text>
                                )}
                            </Stack>
                        </Paper>
                    )}

                    {editable && (
                        <Paper className="panel" p="md">
                            <Group align="flex-end" gap="sm">
                                <NumberInput
                                    label="Becsült munkaóra"
                                    min={0}
                                    w={180}
                                    value={work.workHours}
                                    onChange={(v) =>setWork({...work, workHours: Number(v)})}
                                />
                                <Button variant="default" loading={busy} onClick={()=> run('/work', 'PATCH', work, 'Munkaóra mentve.')}>Mentés</Button>
                            </Group>
                        </Paper>
                    )}
                </Stack>

                <Stack gap="md">
                    <Title order={2}>Megrendelő</Title>
                    <Paper className="panel" p="md">
                        <Stack gap={4}>
                            <Text fw={600}>{project.customerName}</Text>
                            {project.customerPhone && <Text size="sm" component="a" href={`tel:${project.customerPhone}`}>{project.customerPhone}</Text>}
                            {project.customerEmail && <Text size="sm" component="a" href={`mailto:${project.customerEmail}`}>{project.customerEmail}</Text>}
                        </Stack>
                    </Paper>
                    <Title order={2}>Állapotnapló</Title>
                    <Paper className="panel" p="md">
                        <Timeline active={project.statusLog.length - 1} bulletSize={16} lineWidth={2} color="rack">
                            {project.statusLog.map((log)=> (
                                <Timeline.Item key={log.id} title={STATUS[log.status].label}>
                                    <Text size="xs" className="muted">
                                        {new Date(log.changedAt).toLocaleString('hu-HU')}
                                    </Text>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Paper>
                </Stack>
            </SimpleGrid>
        </Stack>
    )
}
