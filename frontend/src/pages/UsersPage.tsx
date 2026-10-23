//felhasznalok listaja es felvetele

import { useEffect, useState } from "react";
import { api, ROLE_NAMES,type Role, type User} from "../api";
import { Alert, Button, Group, PasswordInput, Select, Stack, Table, TextInput, Title } from "@mantine/core";


const emptyForm = { name: '', email: '', password:'', role:'SPECIALIST' as Role}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');


    //lsita betoltese, mentes utan is ezt fogjuk hivni

    const load = () => {
        api<User[]>('/users')
            .then(setUsers)
            .catch((e) => setError(e.message));
    };
    useEffect(() => void load(), []);

    async function create() {
        try{
            await api('/users', {method: 'POST', body: form});
            setForm(emptyForm);
            setError('');
            load();
        } catch (e){
        setError((e as Error).message);
        }
    }


    return (
        <Stack>
            <Title order={3}>Felhasznalok</Title>
            {error && <Alert color="red">{error}</Alert>}
            <Group align="end">
                <TextInput
                label="Nev"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value})}
                />
                <TextInput
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value})}
                />
                <PasswordInput
                label="Jelszo"
                w={250}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value})}
                />
                <Select
                label="Szerepkor"
                data={Object.entries(ROLE_NAMES).map(([value, label]) => ({value, label}))}
                value={form.role}
                onChange={(v) => setForm({...form, role: v as Role})}
                ></Select>
                <Button onClick={create}>Felvetel</Button>
            </Group>
            <Table striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Nev</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Szerepkor</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {users.map((u) => (
                        <Table.Tr key={u.id}>
                            <Table.Td>{u.name}</Table.Td>
                            <Table.Td>{u.email}</Table.Td>
                            <Table.Td>{ROLE_NAMES[u.role]}</Table.Td>
                        </Table.Tr>
                    )) }
                </Table.Tbody>
            </Table>
        </Stack>
    )
}

