import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api,STATUS,type Project } from "../api";
import { Alert, Button, Stack, Table, Title } from "@mantine/core";

export default function PickingListPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [error, setError] = useState('');


    useEffect(()=> {
        api<Project[]>('/picking/projects')
            .then(setProjects)
            .catch((e)=> setError(e.message));
    }, []);


    async function start(id: number) {
        try {
            await api(`/picking/${id}/start`, {method: 'POST'});
            navigate(`/picking/${id}`); //ez jo
        } catch (error) {
            setError((error as Error).message);
        }
    }


    return (
        <Stack>
            <Title order={3}>Kivetelezes</Title>
            {error && <Alert color="red">{error}</Alert>}
            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>Helyszin</Table.Th>
                        <Table.Th>Megrendelo</Table.Th>
                        <Table.Th>Allapot</Table.Th>
                        <Table.Th/>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {projects.map((p)=> (
                        <Table.Tr key={p.id}>
                            <Table.Td>{p.id}</Table.Td>
                            <Table.Td>{p.location}</Table.Td>
                            <Table.Td>{p.customerName}</Table.Td>
                            <Table.Td>{STATUS[p.status].label}</Table.Td>
                            <Table.Td>
                                {p.status === 'SCHEDULED'? (
                                    <Button size="xs" onClick={()=> start(p.id)}>Kivetelezes inditasa</Button>
                                ) : (
                                    <Button size="xs" onClick={()=> navigate(`/picking/${p.id}`)}>Utvonal</Button>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    )
}