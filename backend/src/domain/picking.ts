import { optimizeRoute, routeLength, type Stop } from "./route.js";

export type PickBin = {id: number; number: number; row: number; col: number; level: number; quanity: number};
export type PickRequest = {partId: number; quanity: number; bins: PickBin[]};
export type PickLine = {partId: number; binId: number; take: number};

export function planPicking(requests: PickRequest[], budgetMs = 1500) {
    const takes = new Map<number, number>();
    for (const r of requests) {
        let left = r.quanity;
        for (const b of [...r.bins].sort((a, c) => a.number - c.number)) {
            if (left === 0) break;
            const take = Math.min(b.quanity, left);
            if (take === 0) continue;
            takes.set(b.id, take);
            left -= take;
        }
        if (left > 0) throw new Error(`Nincs eleg keszlet, ${left} db hianyzik`);
    }

    const byId = new Map(requests.flatMap((r) => r.bins).map((b) => [b.id, b] as const));
    const memo = new Map<string, number>();

    const spotsOf = (skip?: number) => {
        const spots = new Map<string, Stop>();
        for (const [id, take] of takes) {
            if (take <= 0 || id === skip) continue;
            const b = byId.get(id)!;
            spots.set(`${b.row}-${b.col}`, {row: b.row, col: b.col, level: b.level});
        }
        return spots;
    };

    const cost = () => {
        const spots = spotsOf();
        const key = [...spots.keys()].sort().join('|');
        let value = memo.get(key);
        if (value === undefined) {
            value = routeLength(optimizeRoute([...spots.values()]));
            memo.set(key, value);
        }
        return value;
    };

    const baseline = cost();
    let best = baseline;
    const deadline = Date.now() + budgetMs;
    let improved = true;

    while (improved && Date.now() < deadline) {
        improved = false;
        for (const r of requests) {
            for (const from of r.bins) {
                if (Date.now() > deadline) break;
                const have = takes.get(from.id) ?? 0;
                if (have <= 0) continue;

                for (const to of r.bins) {
                    if (to.id === from.id) continue;
                    const current = takes.get(from.id) ?? 0;
                    const spare = to.quanity - (takes.get(to.id) ?? 0);
                    if (current <= 0 || spare < current) continue;
                    takes.set(from.id, 0);
                    takes.set(to.id, (takes.get(to.id) ?? 0) + current);
                    const c = cost();
                    if (c < best - 1e-9) {
                        best = c;
                        improved = true;
                        break;
                    }
                    takes.set(to.id, (takes.get(to.id) ?? 0) - current);
                    takes.set(from.id, current);
                }

                const left0 = takes.get(from.id) ?? 0;
                if (left0 <= 0) continue;
                const snapshot = new Map(takes);
                const spots = spotsOf(from.id);
                takes.set(from.id, 0);
                let left = left0;
                for (const to of r.bins) {
                    if (left === 0) break;
                    if (to.id === from.id || !spots.has(`${to.row}-${to.col}`)) continue;
                    const move = Math.min(to.quanity - (takes.get(to.id) ?? 0), left);
                    if (move <= 0) continue;
                    takes.set(to.id, (takes.get(to.id) ?? 0) + move);
                    left -= move;
                }
                if (left === 0 && cost() < best - 1e-9) {
                    best = cost();
                    improved = true;
                } else {
                    takes.clear();
                    snapshot.forEach((v, k) => takes.set(k, v));
                }
            }
        }
    }

    const lines: PickLine[] = [];
    for (const r of requests)
        for (const b of r.bins) {
            const take = takes.get(b.id) ?? 0;
            if (take > 0) lines.push({partId: r.partId, binId: b.id, take});
        }
    return {lines, length: best, baseline};
}
