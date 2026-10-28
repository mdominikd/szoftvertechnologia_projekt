import { useEffect, useState } from "react";
import {api, type Part } from "../api";
import { Alert, Stack, Table, Title } from "@mantine/core";

type Prereserved = {
    projectId: number;
    partId: number;
    quanity: number;
    reserved: number;
    missing: number;
    project: {id: number; location: string};
    part: { name: string};
};


export default function MisssingPage () {
    const [missing, setMissing] = useState<(Part & { toOrder: number})[]>([]);
    const [prereserved, setPrereserved] = useState<Prereserved[]>([]);
    const [error, setError] = useState('');


    useEffect(() => {
        api<typeof missing>('/parts/missing')
            .then(setMissing)
            .catch((e)=>setError(e.message));
        api<Prereserved[]>('/parts/prereserved')
            .then(setPrereserved)
            .catch((e)=>setError(e.message));
    }, []);



    return (
        <Stack>
            {error && <Alert color="red">{error}</Alert>}

            <Title order={3}>Hianzo alkatreszek</Title>
            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Alkatreszek</Table.Th>
                        <Table.Th>Keszlet</Table.Th>
                        <Table.Th>Foglat</Table.Th>
                        <Table.Th>Igeny</Table.Th>
                        <Table.Th>Rendelheto</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {missing.map((p)=> (
                        <Table.Tr key={p.id}>
                            <Table.Td>{p.name}</Table.Td>
                            <Table.Td>{p.stock}</Table.Td>
                            <Table.Td>{p.reserved}</Table.Td>
                            <Table.Td>{p.demand}</Table.Td>
                            <Table.Td fw={700}>{p.toOrder}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>


            <Title order={3}>Elore lefoglat, de meg hianyzo tetelek</Title>
            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Projektek</Table.Th>
                        <Table.Th>AlkatrEsz</Table.Th>
                        <Table.Th>Kell</Table.Th>
                        <Table.Th>Foglalt</Table.Th>
                        <Table.Th>Hianyzik</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {prereserved.map((i)=> (
                        <Table.Tr key={`${i.projectId}-${i.partId}`}>
                            <Table.Td>#{i.project.id} {i.project.location}</Table.Td>
                            <Table.Td>{i.part.name}</Table.Td>
                            <Table.Td>{i.quanity}</Table.Td>
                            <Table.Td>{i.reserved}</Table.Td>
                            <Table.Td fw={700}>{i.missing}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    )
}