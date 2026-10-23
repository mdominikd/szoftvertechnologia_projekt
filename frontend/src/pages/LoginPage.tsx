//login oldal

import { useNavigate } from "react-router";
import { useAuth } from "../auth";
import { useState, type FormEvent } from "react";
import { MENU } from "../Layout";
import { Alert, Button, Paper, PasswordInput, Stack, TextInput, Title } from "@mantine/core";

export default function LoginPage() {
    const {login} = useAuth();
    const navigate= useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    async function submit(e: FormEvent) {
        e.preventDefault();
        try{
            const user = await login(email, password);
            navigate(MENU[user.role][0].path);
        } catch (err){
            setError((err as Error).message);
        }
    }


    return (
        <Paper maw={360} mx="auto" mt={100} p="lg" withBorder>
            <form onSubmit={submit}>
                <Stack>
                    <Title order={3}>Bejelentkezes</Title>
                    {error && <Alert color="red">{error}</Alert>}
                    <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)}></TextInput>
                    <PasswordInput label="Jelszo" value={password} onChange={(e) => setPassword(e.target.value)}></PasswordInput>
                    <Button type="submit">Belepes</Button>
                </Stack>
            </form>
        </Paper>
    );
}