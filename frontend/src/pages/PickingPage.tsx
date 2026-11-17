import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router'
import { api } from "../api";
import { ActionIcon, Alert, Button, Checkbox, Group, Paper, Progress, SegmentedControl, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconMapPin, IconPrinter } from "@tabler/icons-react";
import { BinPlate, EmptyState, PageHeader } from "../components";
import { FloorMap, RackFace } from "../FloorMap";
import { aisleOf, legLength, optimizeRoute, routeLength, sideOf } from "../routing";

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
    const storageKey = `pick-${id}`;
    const [steps, setSteps] = useState<Step[] | null>(null);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'fast' | 'list'>('fast');
    const [focus, setFocus] = useState<number | null>(null);
    const [done, setDone] = useState<number[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) ?? '[]');
        } catch {
            return [];
        }
    });


    useEffect(()=> {
        api<Step[]>(`/picking/${id}`)
            .then(setSteps)
            .catch((e)=> setError(e.message));
    }, [id]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(done));
    }, [done, storageKey]);

    const plan = useMemo(() => {
        if (!steps) return null;
        const optimized = optimizeRoute(steps);
        const listLength = routeLength(steps);
        const optimizedLength = routeLength(optimized);
        return {
            list: steps,
            fast: optimizedLength < listLength ? optimized : steps,
            listLength,
            fastLength: Math.min(listLength, optimizedLength),
        };
    }, [steps]);

    const route = plan ? (mode === 'fast' ? plan.fast : plan.list) : [];
    const total = route.length;
    const finished = route.filter((s) => done.includes(s.step)).length;
    const current = route.find((s) => s.step === focus && !done.includes(s.step)) ?? route.find((s) => !done.includes(s.step)) ?? null;
    const currentIndex = current ? route.indexOf(current) : -1;
    const meters = current ? Math.round(legLength(currentIndex > 0 ? route[currentIndex - 1] : null, current)) : 0;
    const saved = plan ? Math.round(plan.listLength - plan.fastLength) : 0;

    function toggle(step: number) {
        setDone((d) => d.includes(step) ? d.filter((s) => s !== step) : [...d, step]);
    }

    function pickCurrent() {
        if (!current) return;
        setDone((d) => [...d, current.step]);
        setFocus(null);
    }


    return (
       <Stack gap="md">
            <Button component={Link} to="/picking" variant="subtle" color="gray" size="compact-sm" leftSection={<IconArrowLeft size={14} />} w="fit-content" ml={-8} className="no-print">
                Kivételezés
            </Button>
            <PageHeader
                title="Kivételezési útvonal"
                description={`#${id}. projekt`}
                action={
                    <Button variant="default" leftSection={<IconPrinter size={16} />} className="no-print" onClick={() => window.print()}>
                        Nyomtatás
                    </Button>
                }
            />
            {error && <Alert color="red" role="alert">{error}</Alert>}

            {steps === null && !error && <Skeleton height={240} />}

            {plan && total > 0 && (
                <>
                    <Paper className="panel" p="md">
                        <Group justify="space-between" mb={8}>
                            <Text fw={600} role="status">
                                {finished === total ? 'Minden tétel kivéve.' : `${finished} / ${total} kivéve`}
                            </Text>
                            <Text size="sm" className="muted">
                                {mode === 'fast' ? 'Leggyorsabb út' : 'Lista sorrendje'}: kb. {Math.round(mode === 'fast' ? plan.fastLength : plan.listLength)} m séta, vissza a csomagolóig
                            </Text>
                        </Group>
                        <Progress value={(finished / total) * 100} color="teal" size="lg" aria-label={`${finished} / ${total} kivéve`} />
                    </Paper>

                    <SimpleGrid cols={{base: 1, md: 3}} spacing="md">
                        <Stack gap="sm" className="span-2">
                            <Group justify="space-between" gap="sm" className="no-print">
                                <Title order={2}>Útvonal a raktárban</Title>
                                <SegmentedControl
                                    size="xs"
                                    value={mode}
                                    onChange={(v) => { setMode(v as 'fast' | 'list'); setFocus(null); }}
                                    data={[
                                        {value: 'fast', label: 'Leggyorsabb út'},
                                        {value: 'list', label: 'Lista sorrendje'},
                                    ]}
                                />
                            </Group>
                            <Paper className="panel" style={{overflow: 'hidden'}}>
                                <FloorMap route={route} done={done} current={current?.step ?? null} />
                            </Paper>
                            <Text size="sm" className="muted">
                                A számozott körök a megállók sorrendjét mutatják, a narancs a következő. A térkép feltételezett alaprajzzal számol: 3 m széles folyosók, 2,7 m széles rekeszoszlopok, a bejárat az A1 folyosó elején.
                                {saved >= 1 && mode === 'fast' && ` A leggyorsabb út kb. ${saved} m-rel rövidebb a lista sorrendjénél.`}
                                {saved < 1 && mode === 'fast' && ' A lista sorrendje már a legrövidebb séta.'}
                            </Text>
                        </Stack>

                        <Stack gap="sm">
                            <Title order={2}>Következő megálló</Title>
                            <Paper className="panel" p="md">
                                {current ? (
                                    <Stack gap="md">
                                        <Text size="sm" className="muted" role="status">{currentIndex + 1}. megálló a(z) {total} közül · innen kb. {meters} m</Text>
                                        <BinPlate number={current.bin.split(' ')[0]} row={current.row} col={current.col} level={current.level} large />
                                        <Stack gap={2}>
                                            <Text fw={700} size="lg">A{aisleOf(current.row) + 1} folyosó, {current.col}. oszlop</Text>
                                            <Text>{sideOf(current.row)} oldali polc ({current.row}. sor), {current.level}. szint</Text>
                                            <Text size="xs" className="muted">Bal és jobb a folyosó bejáratától nézve, a hátsó fal felé fordulva.</Text>
                                        </Stack>
                                        <Text fw={600}>{current.part} · {current.quanity} db</Text>
                                        <RackFace
                                            row={current.row}
                                            col={current.col}
                                            level={current.level}
                                            quanity={current.quanity}
                                            others={route.filter((s) => s.row === current.row && s.step !== current.step && !done.includes(s.step))}
                                        />
                                        <Button size="lg" fullWidth leftSection={<IconCheck size={18} />} onClick={pickCurrent} className="no-print">Kivettem</Button>
                                    </Stack>
                                ) : (
                                    <Stack gap="sm">
                                        <Text fw={700} size="lg">Minden tétel kivéve.</Text>
                                        <Text>Vidd az alkatrészeket a csomagolóhoz a bejáratnál.</Text>
                                        <Button component={Link} to="/picking" className="no-print">Vissza a listához</Button>
                                    </Stack>
                                )}
                            </Paper>
                        </Stack>
                    </SimpleGrid>

                    <Title order={2}>Teljes lista</Title>
                    <Paper className="panel" style={{overflow: 'hidden'}}>
                        {route.map((s, index) => {
                            const checked = done.includes(s.step);
                            return (
                                <label key={s.step} className={`pick-row${checked ? ' pick-done' : ''}`}>
                                    <Checkbox
                                        size="lg"
                                        checked={checked}
                                        onChange={() => toggle(s.step)}
                                        aria-label={`${index + 1}. megálló kész: ${s.part}`}
                                    />
                                    <span className="pick-step">{index + 1}.</span>
                                    <BinPlate number={s.bin.split(' ')[0]} row={s.row} col={s.col} level={s.level} />
                                    <span className="pick-part">{s.part}</span>
                                    <Group gap="sm" wrap="nowrap">
                                        <span className="pick-qty">{s.quanity} db</span>
                                        {!checked && (
                                            <Tooltip label="Mutasd a térképen" openDelay={400}>
                                                <ActionIcon
                                                    variant="default"
                                                    size="lg"
                                                    className="no-print"
                                                    aria-label={`${index + 1}. megálló mutatása a térképen`}
                                                    onClick={(e) => { e.preventDefault(); setFocus(s.step); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                                                >
                                                    <IconMapPin size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </label>
                            );
                        })}
                    </Paper>
                    {finished > 0 && (
                        <Button variant="default" size="compact-sm" w="fit-content" className="no-print" onClick={() => { setDone([]); setFocus(null); }}>
                            Pipák törlése
                        </Button>
                    )}
                </>
            )}

            {steps && steps.length === 0 && (
                <Paper className="panel">
                    <EmptyState title="Ehhez a projekthez nincs kivételezési tétel" text="Előbb indítsd el a kivételezést a projektlistán." />
                </Paper>
            )}
       </Stack>
    )
}
