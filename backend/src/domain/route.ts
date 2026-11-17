import { asileOf, WAREHOUSE } from "./warehouse.js";

export type Stop = {row: number; col: number; level: number};

type Point = {x: number; y: number; aisle: number};

const BAY = 2.7;
const PITCH = 5.2;
const LENGTH = WAREHOUSE.cols * BAY;

const DEPOT: Point = {x: 0, y: 0, aisle: 0};

const pointOf = (s: Stop): Point => ({x: asileOf(s.row) * PITCH, y: (s.col - 0.5) * BAY, aisle: asileOf(s.row)});

function dist(a: Point, b: Point) {
    if (a.aisle === b.aisle) return Math.abs(a.y - b.y);
    const across = Math.abs(a.x - b.x);
    return Math.min(a.y + b.y, (LENGTH - a.y) + (LENGTH - b.y)) + across;
}

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
    return order;
}
