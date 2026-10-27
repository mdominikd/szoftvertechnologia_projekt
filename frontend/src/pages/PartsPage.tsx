// alkatreszek listaja keszlettel

import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { api, type Part } from "../api";
import { Alert, Button, Group, NumberInput, Select, Stack, Table, TextInput, Title } from "@mantine/core";




export default function PartsPage() {
    const {user} = useAuth();
    const isManager = user!.role === 'WH_MANAGER'; // csak o szerkezthet
    const [parts, setParts]= useState<Part[]>([]);
    const [error, setError] = useState('');
    const [newPart, setNewPart] = useState({name: '', price:0, maxPerBin: 1});
    const [edit, setEdit] = useState({id: null as string | null, price: 0, maxPerBin: 1})

    const load = () =>
        api<Part[]>('/parts')
            .then(setParts)
            .catch((e) =>setError(e.message));
    useEffect(() => void load(), []);


    //kozos mentes: hivas, hibakezeles, lista ujratoltes
    async function save(path: string, method: string, body:unknown) {
        try {
            await api(path, {method,body});
            setError('');
            load();
        }catch(e){
            setError((e as Error).message);
        }
    }

    return (
        <Stack>
            <Title order={3}>Alkatreszek</Title>
            {error  && <Alert color="red">{error}</Alert>}

            {isManager && (
                <>
                    <Group align="end">
                        <TextInput
                            label="Nev"
                            value={newPart.name}
                            onChange={(e) => setNewPart({ ...newPart, name: e.target.value})}
                        />
                            <NumberInput
                                label="Max / rekesz"
                                value={newPart.maxPerBin}
                                min={1}
                                onChange={(v) => setNewPart({...newPart,maxPerBin: Number(v)})}
                            />
                            <Button onClick={() => save('/parts', 'POST',newPart)}>Felvetel</Button>
                    </Group>
                    <Group align="end">
                        <Select
                            label="Alkatresz"
                            data={parts.map((p) => ({ value: String(p.id), label: p.name}))}
                            value={edit.id}
                            onChange={(id) => {
                                const p = parts.find((p) => String(p.id) == id);
                                setEdit({id, price: p?.price ?? 0, maxPerBin: p?.maxPerBin ??1});
                            }}
                        />
                        <NumberInput
                            label="Uj ar (Ft)"
                            min={0}
                            value={edit.price}
                            onChange={(v) => setEdit({...edit, price: Number(v)})}
                        />
                        <NumberInput
                            label="Max / rekesz"
                            min={1}
                            value={edit.maxPerBin}
                            onChange={(v)=> setEdit({ ...edit, maxPerBin: Number(v)})}
                        >
                            
                        </NumberInput>
                        <Button
                            disabled={!edit.id}
                            onClick={() => save(`/parts/${edit.id}`, 'PATCH', {price: edit.price, maxPerBin: edit.maxPerBin})}                        
                        >
                            Modositas
                        </Button>
                    </Group>
                </>
            )}

            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Nev</Table.Th>
                        <Table.Th>Ar (Ft)</Table.Th>
                        <Table.Th>Max / rekesz</Table.Th>
                        <Table.Th>Keszelt</Table.Th>
                        <Table.Th>Foglalt</Table.Th>
                        <Table.Th>Elerheto</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {parts.map((p)=> (
                        <Table.Tr key={p.id}>
                            <Table.Td>{p.name}</Table.Td>
                            <Table.Td>{p.price.toLocaleString('hu-HU')}</Table.Td>
                            <Table.Td>{p.maxPerBin}</Table.Td>
                            <Table.Td>{p.stock}</Table.Td>
                            <Table.Td>{p.reserved}</Table.Td>
                            <Table.Td>{p.free}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    )



}