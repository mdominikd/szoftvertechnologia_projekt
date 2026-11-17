import { useNavigate } from "react-router";
import { useAuth } from "../auth";
import { useState, type FormEvent } from "react";
import { MENU } from "../Layout";
import { Alert, Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { RackMark } from "../components";

export default function LoginPage() {
    useDocumentTitle('Bejelentkezés · Napelem raktár');
    const {login} = useAuth();
    const navigate= useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    async function submit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try{
            const user = await login(email, password);
            navigate(MENU[user.role][0].path);
        } catch (err){
            setError((err as Error).message);
            setLoading(false);
        }
    }


    return (
        <div className="login">
            <aside className="login-side">
                <RackMark size={64} light />
                <div>
                    <Title order={2}>Projektek, készlet és kivételezés egy helyen.</Title>
                    <Text mt="md">
                        A napelemes projektek alkatrészei a raktár rekeszeihez kötődnek: foglalás, hiánylista és kivételezési útvonal.
                    </Text>
                </div>
                <Text size="sm" c="rgba(255,255,255,0.72)">Napelem raktár</Text>
            </aside>
            <main className="login-main">
                <form onSubmit={submit} className="login-form">
                    <Stack gap="md">
                        <div className="login-mobile-mark">
                            <RackMark size={48} />
                        </div>
                        <Stack gap={4}>
                            <Title order={1}>Bejelentkezés</Title>
                            <Text size="sm" className="muted">Add meg a munkahelyi e-mail címedet és a jelszavadat.</Text>
                        </Stack>
                        {error && <Alert color="red" role="alert">{error}</Alert>}
                        <TextInput
                            label="E-mail"
                            type="email"
                            autoComplete="username"
                            autoFocus
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <PasswordInput
                            label="Jelszó"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" size="md" loading={loading}>Belépés</Button>
                    </Stack>
                </form>
            </main>
        </div>
    );
}
