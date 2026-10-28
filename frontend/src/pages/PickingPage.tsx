
import { useEffect, useState } from 'react';
import { useParams} from 'react-router'
import { api } from "../api";
import { Alert, Stack, Table, Title } from "@mantine/core";

type Step = {
    step: number;
    bin: string;
    row: number;
    col: number;
    level: number;
    part: string;
    quanity:number;
};


export default function PickingPage() {
    const {id} = useParams();
    const [steps, setSteps] = useState<Step[]>([]);
    const [error, setError] = useState('');


    useEffect(()=> {
        api<Step[]>(`/picking/${id}`)
            .then(setSteps)
            .catch((e)=> setError(e.message));
    }, [id]);


    return (
       <Stack>
            <Title order={3}>Kivetelezesi utvonal - #{id}. projekt</Title>
            {error && <Alert color="red">{error}</Alert>}
            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>Rekesz</Table.Th>
                        <Table.Th>Sor</Table.Th>
                        <Table.Th>Oszlop</Table.Th>
                        <Table.Th>Szint</Table.Th>
                        <Table.Th>Alkatresz</Table.Th>
                        <Table.Th>Darab</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {steps.map((s) => (
                        <Table.Tr key={s.step}>
                            <Table.Td>{s.step}</Table.Td>
                            <Table.Td>{s.bin}</Table.Td>
                            <Table.Td fw={700}>{s.row}</Table.Td>
                            <Table.Td>{s.col}</Table.Td>
                            <Table.Td>{s.level}</Table.Td>
                            <Table.Td>{s.part}</Table.Td>
                            <Table.Td>{s.quanity}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
       </Stack>
    )
}