import { useEffect, useState } from "react";
import {  api, type Part } from "../api";
import { Alert, Button, Group, NumberInput, Select, Stack, Table, Title } from "@mantine/core";

export default function StockInPage() {
    const [parts, setParts] = useState<Part[]>([]);
    const [partId, setPartId] = useState<string | null>(null);
    const [quanity, setQuanity] = useState(1);
    const [placements, setPlacements] = useState<{ bin:string; add:number}[]>([]);
    const [error, setError] = useState('');


    useEffect(() => {
        api<Part[]>('/parts')
            .then(setParts)
            .catch((e)=> setError(e.message));
    }, []);


    async function submit(){
        try{
            setPlacements(
                await api('/warehouse/stock-in', {method: 'POST', body: {partId:Number(partId), quanity}}),
            );
            setError('');
        } catch (e){
            setError((e as Error).message);
            setPlacements([]);
        }
    }


    return (
        <Stack>
            <Title order={3}>Bevetelezes</Title>
            {error && <Alert color="red">{error}</Alert>}
            <Group align="end">
                <Select
                label="Alkatresz"
                data={parts.map((p)=> ({ value: String(p.id), label: `${p.name} (max ${p.maxPerBin}/rekesz)`}))}
                value={partId}
                onChange={setPartId}
                w={320}
                />
                <NumberInput label="Darab" min={1} value={quanity} onChange={(v) => setQuanity(Number(v))}></NumberInput>
                <Button disabled={!partId} onClick={submit}>Bevetelezes</Button>

            </Group>
            {placements.length > 0 && (
                <>
                    <Alert color="green">Sikeres bevetelkezeles. Helyezd el az alkatreszeket az alabbi rekeszekben:</Alert>
                    <Table striped>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Rekesz</Table.Th>
                                <Table.Th>Darab</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                           {placements.map((p) => (
                            <Table.Tr key={p.bin}>
                                <Table.Td>{p.bin}</Table.Td>
                                <Table.Td>{p.add}</Table.Td>
                            </Table.Tr>
                           ))}
                        </Table.Tbody>
                    </Table>
                </>
            )}
        </Stack>
    );
}