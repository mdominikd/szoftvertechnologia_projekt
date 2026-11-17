import { useEffect, useMemo, useState } from "react";
import { api, type Bin } from "../api";
import { Alert, Group, Paper, Select, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { PageHeader } from "../components";
import { binLabel } from "../binLabel";


export default function WarehousePage() {
    const [bins, setBins]= useState<Bin[] | null>(null);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        api<Bin[]>('/warehouse/bins')
            .then(setBins)
            .catch((e) => setError(e.message));
    }, []);

    const stats = useMemo(() => {
        const all = bins ?? [];
        const occupied = all.filter((b) => b.part && b.quanity > 0);
        const names = [...new Set(occupied.map((b) => b.part!.name))].sort((a, b) => a.localeCompare(b, 'hu'));
        const hits = selected ? occupied.filter((b) => b.part!.name === selected) : [];
        return {
            total: all.length,
            occupied: occupied.length,
            names,
            hitBins: hits.length,
            hitQuanity: hits.reduce((sum, b) => sum + b.quanity, 0),
        };
    }, [bins, selected]);

    const index = useMemo(() => {
        const map = new Map<string, Bin>();
        for (const b of bins ?? []) map.set(`${b.row}-${b.col}-${b.level}`, b);
        return map;
    }, [bins]);

    const rows = [...new Set((bins ?? []).map((b) => b.row))].sort((a, b) => a - b);
    const cols = [...new Set((bins ?? []).map((b) =>  b.col))].sort((a, b) => a - b);
    const levels = [...new Set((bins ?? []).map((b) => b.level))].sort((a, b) => b - a);

    return (
        <Stack gap="md">
            <PageHeader
                title="Raktár"
                description={bins ? `${stats.occupied} / ${stats.total} rekesz foglalt` : undefined}
                action={
                    <Select
                        aria-label="Alkatrész kiemelése"
                        placeholder="Alkatrész kiemelése"
                        searchable
                        clearable
                        allowDeselect
                        w={{base: '100%', sm: 300}}
                        data={stats.names}
                        value={selected}
                        onChange={setSelected}
                    />
                }
            />
            {error && <Alert color="red" role="alert">{error}</Alert>}
            {selected && (
                <Text role="status">
                    <b>{selected}</b>: {stats.hitBins} rekeszben, összesen {stats.hitQuanity} db.
                </Text>
            )}

            {bins === null && !error && <Skeleton height={320} />}

            <SimpleGrid cols={{base: 1, lg: 2}} spacing="md">
                {rows.map((row)=> (
                    <Paper key={row} className="panel" p="sm">
                        <Group justify="space-between" mb={8}>
                            <Text fw={700}>{row}. sor</Text>
                            <Text size="xs" className="muted">Szint 1 alul, szint {levels[0]} felül</Text>
                        </Group>
                        <div className="rack">
                            {levels.map((level) => (
                                <div key={level} className="rack-level">
                                    <div className="rack-level-name">Sz{level}</div>
                                    {cols.map((col) => {
                                        const bin = index.get(`${row}-${col}-${level}`);
                                        if (!bin) return <div key={col} className="bin" />;
                                        const stocked = !!bin.part && bin.quanity > 0;
                                        const hit = !!selected && stocked && bin.part?.name === selected;
                                        const dim = !!selected && !hit;
                                        return (
                                            <div
                                                key={col}
                                                className={`bin${hit ? ' bin-hit' : ''}${dim ? ' bin-dim' : ''}`}
                                                title={binLabel(bin)}
                                            >
                                                <span className="bin-num">{String(bin.number).padStart(3, '0')}</span>
                                                {stocked && bin.part ? (
                                                    <>
                                                        <span className="bin-part">{bin.part.name}</span>
                                                        <b>{bin.quanity} db</b>
                                                    </>
                                                ) : (
                                                    <span className="bin-free">Üres</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </Paper>
                ))}
            </SimpleGrid>
        </Stack>
    )
}
