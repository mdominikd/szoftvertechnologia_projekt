import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, type Project } from "../api";
import { Alert, Button, Group, Stack, Table, Text } from "@mantine/core";
import { IconListCheck } from "@tabler/icons-react";
import { EmptyState, PageHeader, StatusBadge, TableSkeleton } from "../components";
import { notifyError, notifyOk } from "../notify";

const isClosed = (p: Project) => p.status === 'COMPLETED' || p.status === 'FAILED';

export default function PickingListPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState<number | null>(null);
    const [starting, setStarting] = useState(false);


    useEffect(()=> {
        api<Project[]>('/picking/projects')
            .then((list) => setProjects([...list].sort((a, b) => Number(isClosed(a)) - Number(isClosed(b)))))
            .catch((e)=> setError(e.message));
    }, []);


    async function start(id: number) {
        setStarting(true);
        try {
            const result = await api<{length: number; baseline: number} | null>(`/picking/${id}/start`, {method: 'POST'});
            const saved = result ? result.baseline - result.length : 0;
            notifyOk(saved >= 1
                ? `A kivételezés elindult, a készlet levonva. A rekeszek úgy lettek kiválasztva, hogy a séta kb. ${saved} m-rel rövidebb legyen.`
                : 'A kivételezés elindult, a készlet levonva.');
            navigate(`/picking/${id}`);
        } catch (error) {
            notifyError((error as Error).message);
            setStarting(false);
        }
    }


    return (
        <Stack gap="md">
            <PageHeader title="Kivételezés" description="Ütemezett és folyamatban lévő projektek, alul a lezártak." />
            {error && <Alert color="red" role="alert">{error}</Alert>}
            <div className="table-wrap">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>#</Table.Th>
                            <Table.Th>Helyszín</Table.Th>
                            <Table.Th>Megrendelő</Table.Th>
                            <Table.Th>Állapot</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    {projects === null && !error ? (
                        <TableSkeleton rows={3} cols={5} />
                    ) : (
                        <Table.Tbody>
                            {(projects ?? []).map((p)=> (
                                <Table.Tr key={p.id}>
                                    <Table.Td>{p.id}</Table.Td>
                                    <Table.Td fw={600}>{p.location}</Table.Td>
                                    <Table.Td>{p.customerName}</Table.Td>
                                    <Table.Td><StatusBadge status={p.status} /></Table.Td>
                                    <Table.Td>
                                        <Group justify="flex-end" gap="xs">
                                            {p.status === 'SCHEDULED' && confirming !== p.id && (
                                                <Button size="compact-md" onClick={() => setConfirming(p.id)}>Kivételezés indítása</Button>
                                            )}
                                            {p.status === 'SCHEDULED' && confirming === p.id && (
                                                <>
                                                    <Text size="sm" className="muted">A készlet most levonódik.</Text>
                                                    <Button size="compact-md" loading={starting} onClick={() => start(p.id)}>Indítás</Button>
                                                    <Button size="compact-md" variant="default" onClick={() => setConfirming(null)}>Mégse</Button>
                                                </>
                                            )}
                                            {p.status !== 'SCHEDULED' && (
                                                <Button component={Link} to={`/picking/${p.id}`} size="compact-md" variant="default" leftSection={<IconListCheck size={14} />}>
                                                    Útvonal
                                                </Button>
                                            )}
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    )}
                </Table>
                {projects?.length === 0 && (
                    <EmptyState title="Nincs kivételezésre váró projekt" text="Egy projekt akkor kerül ide, ha Ütemezett állapotú. Ehhez a szakembernek hozzá kell adnia az alkatrészeket és le kell futtatnia az árkalkulációt úgy, hogy ne legyen hiány (a hiányt a raktárvezető bevételezéssel pótolja)." />
                )}
            </div>
        </Stack>
    )
}
