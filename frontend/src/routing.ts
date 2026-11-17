export type Stop = {step: number; row: number; col: number; level: number};

type Point = {x: number; y: number; aisle: number};

export const COLS = 4;
export const BAY = 2.7;
export const LENGTH = COLS * BAY;
export const AISLES = 6;
export const AISLE_WIDTH = 3;
export const CROSS = 3;
const PITCH = 5.2;

export const aisleOf = (row: number) => Math.floor(row / 2);
export const aisleX = (aisle: number) => aisle * PITCH;
export const bayY = (col: number) => (col - 0.5) * BAY;
export const sideOf = (row: number) => (row % 2 === 1 ? 'jobb' : 'bal');

const DEPOT: Point = {x: 0, y: 0, aisle: 0};

const pointOf = (s: Stop | null): Point =>
    s ? {x: aisleX(aisleOf(s.row)), y: bayY(s.col), aisle: aisleOf(s.row)} : DEPOT;

function dist(a: Point, b: Point) {
    if (a.aisle === b.aisle) return Math.abs(a.y - b.y);
    const across = Math.abs(a.x - b.x);
    return Math.min(a.y + b.y, (LENGTH - a.y) + (LENGTH - b.y)) + across;
}

export const legLength = (from: Stop | null, to: Stop | null) => dist(pointOf(from), pointOf(to));

export function routeLength(stops: Stop[]) {
    let total = 0;
    let prev = DEPOT;
    for (const s of stops) {
        const p = pointOf(s);
        total += dist(prev, p);
        prev = p;
    }
    return total + dist(prev, DEPOT);
}

export function optimizeRoute<T extends Stop>(stops: T[]): T[] {
    const remaining = [...stops];
    let order: T[] = [];
    let prev = DEPOT;
    while (remaining.length > 0) {
        let best = 0;
        let bestDist = Infinity;
        remaining.forEach((s, i) => {
            const d = dist(prev, pointOf(s));
            if (d < bestDist) {
                best = i;
                bestDist = d;
            }
        });
        const [next] = remaining.splice(best, 1);
        order.push(next);
        prev = pointOf(next);
    }

    let improved = true;
    while (improved) {
        improved = false;
        for (let i = 0; i < order.length - 1; i++) {
            for (let j = i + 1; j < order.length; j++) {
                const candidate = [...order.slice(0, i), ...order.slice(i, j + 1).reverse(), ...order.slice(j + 1)];
                if (routeLength(candidate) < routeLength(order) - 1e-9) {
                    order = candidate;
                    improved = true;
                }
            }
        }
    }

    const result: T[] = [];
    for (let i = 0; i < order.length;) {
        let j = i;
        while (j + 1 < order.length && order[j + 1].row === order[i].row && order[j + 1].col === order[i].col) j++;
        result.push(...order.slice(i, j + 1).sort((a, b) => a.level - b.level));
        i = j + 1;
    }
    return result;
}

export function legPath(from: Stop | null, to: Stop | null): [number, number][] {
    const a = pointOf(from);
    const b = pointOf(to);
    const start: [number, number] = [a.x, a.y];
    if (a.aisle === b.aisle) return [start, [b.x, b.y]];
    const front = a.y + b.y;
    const back = (LENGTH - a.y) + (LENGTH - b.y);
    const edge = front <= back ? -1.6 : LENGTH + 2.4;
    return [start, [a.x, edge], [b.x, edge], [b.x, b.y]];
}
