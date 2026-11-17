import { useEffect, useState } from "react";
import { Link } from "react-router";
import {api, type Part } from "../api";
import { Alert, Button, Stack, Table, Title } from "@mantine/core";
import { IconPackageImport } from "@tabler/icons-react";
import { EmptyState, PageHeader, TableSkeleton } from "../components";

type Prereserved = {
    projectId: number;
    partId: number;
    quanity: number;
    reserved: number;
    missing: number;
    project: {id: number; location: string};
    part: { name: string};
};


export default function MissingPage () {
    const [missing, setMissing] = useState<(Part & { toOrder: number})[] | null>(null);
    const [prereserved, setPrereserved] = useState<Prereserved[] | null>(null);
    const [error, setError] = useState('');


    useEffect(() => {
        api<(Part & { toOrder: number})[]>('/parts/missing')
            .then(setMissing)
            .catch((e)=>setError(e.message));
        api<Prereserved[]>('/parts/prereserved')
            .then(setPrereserved)
            .catch((e)=>setError(e.message));
    }, []);


    return (
        <Stack gap="md">
            <PageHeader title="Hiánylisták" description="Mit kell rendelni, és mely projektek várnak alkatrészre." />
            {error && <Alert color="red" role="alert">{error}</Alert>}

            <Title order={2}>Hiányzó alkatrészek</Title>
            <div className="table-wrap">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Alkatrész</Table.Th>
                            <Table.Th className="num">Készlet</Table.Th>
                            <Table.Th className="num">Foglalt</Table.Th>
                            <Table.Th className="num">Igény</Table.Th>
                            <Table.Th className="num">Rendelendő</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    {missing === null && !error ? (
                        <TableSkeleton rows={3} cols={6} />
                    ) : (
                        <Table.Tbody>
                            {(missing ?? []).map((p)=> (
                                <Table.Tr key={p.id}>
                                    <Table.Td fw={600}>{p.name}</Table.Td>
                                    <Table.Td className="num">{p.stock}</Table.Td>
                                    <Table.Td className="num">{p.reserved}</Table.Td>
                                    <Table.Td className="num">{p.demand}</Table.Td>
                                    <Table.Td className="num" fw={700}>{p.toOrder}</Table.Td>
                                    <Table.Td>
                                        <Button
                                            component={Link}
                                            to={`/stock-in?part=${p.id}&q=${p.toOrder}`}
                                            size="compact-sm"
                                            variant="default"
                                            leftSection={<IconPackageImport size={14} />}
                                        >Bevételezés</Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    )}
                </Table>
                {missing?.length === 0 && (
                    <EmptyState title="Nincs hiányzó alkatrész" text="A készlet fedezi az aktív projektek igényét." />
                )}
            </div>

            <Title order={2} mt="md">Előre lefoglalt, de még hiányzó tételek</Title>
            <div className="table-wrap">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Projekt</Table.Th>
                            <Table.Th>Alkatrész</Table.Th>
                            <Table.Th className="num">Kell</Table.Th>
                            <Table.Th className="num">Foglalt</Table.Th>
                            <Table.Th className="num">Hiányzik</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    {prereserved === null && !error ? (
                        <TableSkeleton rows={3} cols={5} />
                    ) : (
                        <Table.Tbody>
                            {(prereserved ?? []).map((i)=> (
                                <Table.Tr key={`${i.projectId}-${i.partId}`}>
                                    <Table.Td>#{i.project.id} {i.project.location}</Table.Td>
                                    <Table.Td fw={600}>{i.part.name}</Table.Td>
                                    <Table.Td className="num">{i.quanity}</Table.Td>
                                    <Table.Td className="num">{i.reserved}</Table.Td>
                                    <Table.Td className="num" fw={700}>{i.missing}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    )}
                </Table>
                {prereserved?.length === 0 && (
                    <EmptyState title="Nincs előfoglalás" text="Minden projekt tétele teljesen le van foglalva." />
                )}
            </div>
        </Stack>
    )
}
