// projekt reszletei, es a szakember muveletei...

import { useParams } from "react-router";
import { api, huf, STATUS, type Part, type ProjectDetail } from "../api";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Group, NumberInput, Paper, Select, Stack, Table, Text, Title } from "@mantine/core";


export default function ProjectDetalPage() {
    const {id} = useParams();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [parts, setParts] = useState<Part[]>([]);
    const [add, setAdd] = useState({partId: null as string | null, quanity: 1});
    const [work, setWork] = useState({workHours: 0, laborCost: 0});
    const [error, setError] = useState('');

    async function load() {
        const p = await api<ProjectDetail>(`/projects/${id}`);
        setProject(p);
        setWork({workHours: p.workHours, laborCost: p.laborCost});
        setParts(await api<Part[]>('/parts'));
    }

    useEffect(() => {
        load().catch((e) => setError(e.message));
    }, [id]);


    async function run(path: string, method: string, body: unknown) {
        try {
            await api(`/projects/${id}${path}`, {method, body});
            setError('');
            await load();
        } catch (error) {
            setError((error as Error).message);
        }
    }

    if(!project) return error ? <Alert color="red">{error}</Alert> : null;
    const ediable = ['NEW', 'DRAFT',' WAIT'].includes(project.status);


    return (
        <Stack>
            <Group>
                <Title order={3}>
                    #{project.id} {project.location}
                </Title>
                <Badge color={STATUS[project.status].color}>{STATUS[project.status].label}</Badge>
            </Group>
            {error && <Alert color="red">{error}</Alert>}
            <Paper withBorder p="sm">
                <Text>{project.description}</Text>
                <Text size="sm" c="dimmed">
                    Megrendelo: {project.customerName}, {project.customerPhone}, {project.customerEmail}
                </Text>
            </Paper>

            <Title order={4}>Alkatreszek</Title>
            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Alkatreszek</Table.Th>
                        <Table.Th>Mennyiseg</Table.Th>
                        <Table.Th>Foglalt</Table.Th>
                        <Table.Th>Hianzyo (elofoglalas)</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {project.parts.map((pp) =>(
                        <Table.Tr key={pp.partId}>
                            <Table.Td>{pp.part.name}</Table.Td>
                            <Table.Td>{pp.quanity}</Table.Td>
                            <Table.Td>{pp.reserved}</Table.Td>
                            <Table.Td c={pp.quanity > pp.reserved ? 'red': undefined}>
                                {pp.quanity - pp.reserved}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {ediable && (
                <>
                    <Group align="end">
                        <Select
                            label="Alkatresz hozzaadasa"
                            w={420}
                            data={parts.map((p) => ({
                                value: String(p.id),
                                label: `${p.name} - elerheto:> ${p.free} db, ${huf(p.price)}`,
                            }))}
                            value={add.partId}
                            onChange={(partId) => setAdd({...add, partId})}
                        />
                        <NumberInput
                            label="Darab"
                            min={1}
                            value={add.quanity}
                            onChange={(v) => setAdd({...add, quanity: Number(v)})}
                        />

                        <Button
                            disabled={!add.partId}
                            onClick={()=> run('/parts', 'POST', {partId: Number(add.partId), quanity: add.quanity})}
                        >Hozzaadas
                        </Button>
                    </Group>
                    <Group align="end">
                        <NumberInput
                            label="Becsult munkaora"
                            min={0}
                            value={work.workHours}
                            onChange={(v) =>setWork({...work, workHours: Number(v)})}
                        />
                        <Button onClick={()=> run('/work', 'PATCH',work)}>Mentes</Button>
                    </Group>
                </>
            )}
        </Stack>
    )
}