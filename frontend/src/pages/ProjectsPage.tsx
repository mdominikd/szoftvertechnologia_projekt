import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api, STATUS, type Project } from "../api";
import { Alert, Badge, Button, Group, Stack, Table, Textarea, TextInput, Title } from "@mantine/core";

const emptyForm = {location: '', description: '', customerName: '', customerPhone: '', customerEmail: ''};
export default function ProjectPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');


    useEffect(() => {
            api<Project[]>('/projects')
                .then(setProjects)
                .catch((e)=> setError(e.message));
        }, []);


        async function create() {
            try{
                const project = await api<Project>('/projects', {method: 'POST', body: form});
                navigate(`/projects/${project.id}`);
            } catch(e) {
                setError((e as Error).message);
            }
        }

        const field = (key: keyof typeof emptyForm, label: string) => (
            <TextInput
                label={label}
                value={form[key]}
                onChange={(e)=> setForm({ ...form, [key]: e.target.value})}
            />
        );

        return (
            <Stack>
                <Title order={3}>Projektek</Title>
                {error && <Alert color="red">{error}</Alert>}
                <Group align="end">
                    {field('location', 'Helyszin')}
                    {field('customerName', 'Megrendelo')}
                    {field('customerPhone', 'Telefon')}
                    {field('customerEmail', 'Email')}
                </Group>
                <Textarea
                    label="Leiras"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value})}
                />
                <Group>
                    <Button onClick={create}>Uj projekt</Button>
                </Group>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>#</Table.Th>
                            <Table.Th>Helyszin</Table.Th>
                            <Table.Th>Megrendelo</Table.Th>
                            <Table.Th>Letrehozva</Table.Th>
                            <Table.Th>Allapot</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {projects.map((p) => (
                            <Table.Tr key={p.id} style={{cursor:'pointer'}} onClick={()=> navigate(`/projects/${p.id}`)}>
                                <Table.Td>{p.location}</Table.Td>
                                <Table.Td>{p.customerName}</Table.Td>
                                <Table.Td>{new Date(p.createdAt).toLocaleDateString('hu-HU')}</Table.Td>
                                <Table.Td>
                                    <Badge color={STATUS[p.status].color}>{STATUS[p.status].label}</Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Stack>
        )
}