//raktar racsnezet

import { useEffect, useState } from "react";
import { api, type Bin } from "../api";
import { Alert, Paper, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";


export default function WarehousePage() {
    const [bins, setBins]= useState<Bin[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api<Bin[]>('/warehouse/bins')
            .then(setBins)
            .catch((e) => setError(e.message));
    }, []);


    const rows = [...new Set(bins.map((b) =>  b.row))];
    const cols = [...new Set(bins.map((b) =>  b.col))];
    const levels = [...new Set(bins.map((b) =>  b.level))].reverse();
    const find = (row: number, col: number, level: number) =>
        bins.find((b)=> b.row ===row && b.col ===col && b.level === level);

    return (

        <Stack>
            <Title order={3}>Raktar</Title>
            {error && <Alert color="red">{error}</Alert>}
            <SimpleGrid cols={{base: 1, md:2}}>
                {rows.map((row)=> (
                    <Paper key={row} withBorder p="xs">
                        <Text fw={700}>{row}. sor</Text>
                        <Table withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Szint</Table.Th>
                                    {cols.map((col) => (
                                        <Table.Th key={col}>{col}. oszlop</Table.Th>
                                    ))}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {levels.map((level) => (
                                    <Table.Tr key={level}>
                                        <Table.Td>{level}</Table.Td>
                                        {cols.map((col) => {
                                            const bin = find(row,col,level)!;
                                            return (
                                                <Table.Td key={col} c={bin.part ? undefined: 'dimmed'}>
                                                    <Text size="xs" fw={700}>
                                                        #{bin.nubmer}
                                                    </Text>
                                                    <Text size="xs">{bin?.part?.name ? `${bin.part.name}: ${bin.quanity} db` : 'Ures'}</Text>
                                                </Table.Td>
                                            );
                                        })}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                ))}
            
            </SimpleGrid>
        </Stack>
    )
}