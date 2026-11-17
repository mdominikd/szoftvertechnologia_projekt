import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api, type Part } from "../api";
import { Alert, Button, Group, NumberInput, Paper, Select, Stack, Text, Title } from "@mantine/core";
import { IconPackageImport } from "@tabler/icons-react";
import { PageHeader } from "../components";
import { notifyError, notifyOk } from "../notify";

export default function StockInPage() {
    const [params] = useSearchParams();
    const [parts, setParts] = useState<Part[]>([]);
    const [partId, setPartId] = useState<string | null>(params.get('part'));
    const [quanity, setQuanity] = useState(Math.max(1, Number(params.get('q')) || 1));
    const [placements, setPlacements] = useState<{ bin:string; add:number}[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        api<Part[]>('/parts')
            .then(setParts)
            .catch((e)=> setError(e.message));
    }, []);

    const part = parts.find((p) => String(p.id) === partId);
    const binsNeeded = part ? Math.ceil(quanity / part.maxPerBin) : 0;

    async function submit(){
        setLoading(true);
        try{
            const result = await api<{ bin:string; add:number}[]>('/warehouse/stock-in', {method: 'POST', body: {partId:Number(partId), quanity}});
            setPlacements(result);
            setError('');
            notifyOk(`${quanity} db bevételezve.`);
            api<Part[]>('/parts').then(setParts).catch(() => undefined);
        } catch (e){
            notifyError((e as Error).message);
            setPlacements([]);
        } finally {
            setLoading(false);
        }
    }


    return (
        <Stack gap="md">
            <PageHeader title="Bevételezés" description="A rendszer kijelöli, melyik rekeszekbe kerüljön az áru." />
            {error && <Alert color="red" role="alert">{error}</Alert>}
            <Paper className="panel" p="md" maw={720}>
                <Stack gap="md">
                    <Group align="flex-end" gap="sm">
                        <Select
                            label="Alkatrész"
                            placeholder="Válassz alkatrészt"
                            searchable
                            data={parts.map((p)=> ({ value: String(p.id), label: p.name}))}
                            value={partId}
                            onChange={(v) => { setPartId(v); setPlacements([]); }}
                            w={{base: '100%', sm: 320}}
                        />
                        <NumberInput
                            label="Darab"
                            min={1}
                            w={120}
                            value={quanity}
                            onChange={(v) => { setQuanity(Number(v)); setPlacements([]); }}
                        />
                        <Button
                            leftSection={<IconPackageImport size={16} />}
                            disabled={!partId || quanity < 1}
                            loading={loading}
                            onClick={submit}
                        >Bevételezés</Button>
                    </Group>
                    {part && (
                        <Group gap="lg">
                            <Text size="sm" className="muted">Készlet: <b>{part.stock} db</b></Text>
                            <Text size="sm" className="muted">Foglalt: <b>{part.reserved} db</b></Text>
                            <Text size="sm" className="muted">Max / rekesz: <b>{part.maxPerBin} db</b></Text>
                            <Text size="sm" className="muted">Várhatóan <b>{binsNeeded} rekesz</b> kell</Text>
                        </Group>
                    )}
                    {part && quanity > part.maxPerBin && (
                        <Button variant="default" size="compact-sm" w="fit-content" onClick={() => setQuanity(part.maxPerBin)}>
                            Egy rekesznyi ({part.maxPerBin} db)
                        </Button>
                    )}
                </Stack>
            </Paper>

            {placements.length > 0 && (
                <Stack gap="sm" maw={720}>
                    <Title order={2}>Helyezd el az alkatrészeket ezekben a rekeszekben</Title>
                    <div className="table-wrap" role="status">
                        <ol className="placements">
                            {placements.map((p) => (
                                <li key={p.bin}>
                                    <Text fw={600}>{p.bin}</Text>
                                    <span className="placement-add">+ {p.add} db</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </Stack>
            )}
        </Stack>
    );
}
