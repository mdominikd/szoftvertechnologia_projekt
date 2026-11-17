import type { ReactNode } from "react";
import { Group, Skeleton, Stack, Table, Text, Title, UnstyledButton } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { IconCheck, IconChevronDown, IconChevronUp, IconClock, IconSelector, IconX } from "@tabler/icons-react";
import { STATUS, stepIndex, type ProjectStatus } from "./api";

export function RackMark({size = 40, light = false}: {size?: number; light?: boolean}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            aria-hidden="true"
            className={light ? 'rackmark-light' : 'rackmark'}
        >
            <rect x="6" y="4" width="4" height="40" fill="currentColor" />
            <rect x="38" y="4" width="4" height="40" fill="currentColor" />
            <rect x="10" y="15" width="28" height="3" fill="#f27c2e" />
            <rect x="10" y="27" width="28" height="3" fill="#f27c2e" />
            <rect x="10" y="39" width="28" height="3" fill="#f27c2e" />
            <rect x="13" y="6" width="10" height="9" fill="currentColor" fillOpacity="0.6" />
            <rect x="26" y="8" width="9" height="7" fill="currentColor" fillOpacity="0.6" />
            <rect x="13" y="19" width="13" height="8" fill="currentColor" fillOpacity="0.6" />
            <rect x="15" y="31" width="8" height="8" fill="currentColor" fillOpacity="0.6" />
            <rect x="26" y="30" width="10" height="9" fill="currentColor" fillOpacity="0.6" />
        </svg>
    );
}

export function StatusBadge({status}: {status: ProjectStatus}) {
    const s = STATUS[status];
    return (
        <span className="status">
            <span className="status-dot" style={{background: `var(--mantine-color-${s.color}-6)`}} />
            {s.label}
        </span>
    );
}

export function BinPlate({number, row, col, level, large = false}: {number: number | string; row: number; col: number; level: number; large?: boolean}) {
    const label = typeof number === 'number' ? String(number).padStart(3, '0') : number;
    return (
        <span className={large ? 'plate plate-lg' : 'plate'} role="img" aria-label={`Rekesz ${label}, sor ${row}, oszlop ${col}, szint ${level}`}>
            <span className="plate-num">{label}</span>
            <span className="plate-cell"><small>Sor</small><b>{row}</b></span>
            <span className="plate-cell"><small>Oszl.</small><b>{col}</b></span>
            <span className="plate-cell"><small>Szint</small><b>{level}</b></span>
        </span>
    );
}

export function PageHeader({title, description, action}: {title: string; description?: string; action?: ReactNode}) {
    useDocumentTitle(`${title} · Napelem raktár`);
    return (
        <Group justify="space-between" align="flex-end" gap="md" className="page-header">
            <Stack gap={2}>
                <Title order={1}>{title}</Title>
                {description && <Text size="sm" className="muted">{description}</Text>}
            </Stack>
            {action}
        </Group>
    );
}

export function EmptyState({title, text, action}: {title: string; text?: string; action?: ReactNode}) {
    return (
        <div className="empty">
            <RackMark size={56} />
            <Text fw={600}>{title}</Text>
            {text && <Text size="sm" className="muted">{text}</Text>}
            {action}
        </div>
    );
}

export function TableSkeleton({rows = 5, cols}: {rows?: number; cols: number}) {
    return (
        <Table.Tbody>
            {Array.from({length: rows}).map((_, i) => (
                <Table.Tr key={i}>
                    {Array.from({length: cols}).map((_, j) => (
                        <Table.Td key={j}><Skeleton height={14} /></Table.Td>
                    ))}
                </Table.Tr>
            ))}
        </Table.Tbody>
    );
}

export function SortTh({label, active, dir, onClick}: {label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void}) {
    const Mark = !active ? IconSelector : dir === 'asc' ? IconChevronUp : IconChevronDown;
    return (
        <Table.Th aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <UnstyledButton className="sort-btn" onClick={onClick}>
                {label}
                <Mark size={14} />
            </UnstyledButton>
        </Table.Th>
    );
}

const STEPS = ['Új', 'Tervezet', 'Ütemezett', 'Folyamatban', 'Lezárva'];

export function LifecycleSteps({status}: {status: ProjectStatus}) {
    const current = stepIndex(status);
    return (
        <ol className="steps" aria-label="Projekt életciklus">
            {STEPS.map((label, i) => {
                let state = 'todo';
                let text = label;
                let mark: ReactNode = i + 1;
                if (i < current) {
                    state = 'done';
                    mark = <IconCheck size={16} stroke={3} />;
                } else if (i === current) {
                    state = 'current';
                    mark = <span aria-hidden="true">{i + 1}</span>;
                    if (status === 'WAIT') {
                        state = 'wait';
                        text = STATUS.WAIT.label;
                        mark = <IconClock size={16} stroke={2.5} />;
                    }
                    if (status === 'COMPLETED') {
                        state = 'done';
                        text = STATUS.COMPLETED.label;
                        mark = <IconCheck size={16} stroke={3} />;
                    }
                    if (status === 'FAILED') {
                        state = 'failed';
                        text = STATUS.FAILED.label;
                        mark = <IconX size={16} stroke={3} />;
                    }
                }
                return (
                    <li key={label} className="step" data-state={state} aria-current={state === 'current' || state === 'wait' ? 'step' : undefined}>
                        <span className="step-mark">{mark}</span>
                        {text}
                    </li>
                );
            })}
        </ol>
    );
}
