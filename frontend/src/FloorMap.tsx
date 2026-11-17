import { AISLES, AISLE_WIDTH, BAY, COLS, CROSS, LENGTH, aisleOf, aisleX, bayY, legPath, type Stop } from "./routing";

export function FloorMap({route, done, current}: {route: Stop[]; done: number[]; current: number | null}) {
    const top = LENGTH + CROSS;
    const sy = (y: number) => top - y;
    const minX = -AISLE_WIDTH / 2 - 1.2;
    const width = aisleX(AISLES - 1) + AISLE_WIDTH + 2.4;
    const top0 = -1.4;
    const height = LENGTH + 2 * CROSS + 0.2 - top0;

    const legs = route.map((s, i) => ({stop: s, path: legPath(i === 0 ? null : route[i - 1], s)}));
    const back = legPath(route.length > 0 ? route[route.length - 1] : null, null);
    const points = (path: [number, number][]) => path.map(([x, y]) => `${x},${sy(y)}`).join(' ');

    const groups = new Map<string, number[]>();
    route.forEach((s, i) => {
        const key = `${s.row}-${s.col}`;
        groups.set(key, [...(groups.get(key) ?? []), i]);
    });

    return (
        <svg
            viewBox={`${minX} ${top0} ${width} ${height}`}
            className="map"
            role="img"
            aria-label="A raktár felülnézeti térképe a kivételezési útvonallal"
        >
            <defs>
                <marker id="map-arrow" viewBox="0 0 4 4" refX="3" refY="2" markerWidth="1.6" markerHeight="1.6" orient="auto">
                    <path d="M0,0 L4,2 L0,4 z" fill="context-stroke" />
                </marker>
            </defs>

            {Array.from({length: AISLES - 1}).map((_, a) => {
                const x0 = aisleX(a) + AISLE_WIDTH / 2;
                const x1 = aisleX(a + 1) - AISLE_WIDTH / 2;
                const mid = (x0 + x1) / 2;
                return (
                    <g key={a}>
                        <rect x={x0} y={sy(LENGTH)} width={x1 - x0} height={LENGTH} className="map-rack" />
                        <line x1={mid} x2={mid} y1={sy(LENGTH)} y2={sy(0)} className="map-bay" />
                        {Array.from({length: COLS - 1}).map((_, c) => (
                            <line key={c} x1={x0} x2={x1} y1={sy((c + 1) * BAY)} y2={sy((c + 1) * BAY)} className="map-bay" />
                        ))}
                        <text x={(x0 + mid) / 2} y={sy(LENGTH) - 0.5} className="map-text" textAnchor="middle">{2 * a + 1}</text>
                        <text x={(mid + x1) / 2} y={sy(LENGTH) - 0.5} className="map-text" textAnchor="middle">{2 * a + 2}</text>
                    </g>
                );
            })}

            {Array.from({length: AISLES}).map((_, a) => (
                <text key={a} x={aisleX(a)} y={-0.4} className="map-text map-aisle" textAnchor="middle">A{a + 1}</text>
            ))}

            {Array.from({length: COLS}).map((_, c) => (
                <text key={c} x={minX + 0.6} y={sy(bayY(c + 1))} className="map-text" textAnchor="middle" dominantBaseline="central">{c + 1}.</text>
            ))}

            <text x={minX + 0.2} y={LENGTH + 2 * CROSS - 0.4} className="map-text">Bejárat és csomagoló</text>
            <rect x={-0.55} y={sy(0) - 0.55} width={1.1} height={1.1} className="map-depot" />

            <polyline points={points(back)} className="map-leg map-leg-back" />
            {legs.map(({stop, path}) => {
                const finished = done.includes(stop.step);
                const active = stop.step === current;
                return (
                    <polyline
                        key={stop.step}
                        points={points(path)}
                        className={`map-leg${finished ? ' map-leg-done' : ''}${active ? ' map-leg-current' : ''}`}
                        markerEnd={finished ? undefined : 'url(#map-arrow)'}
                    />
                );
            })}

            {[...groups.values()].map((indexes) => {
                const first = route[indexes[0]];
                const x = aisleX(aisleOf(first.row)) + (first.row % 2 === 1 ? 1.05 : -1.05);
                const y = sy(bayY(first.col));
                const finished = indexes.every((i) => done.includes(route[i].step));
                const active = indexes.some((i) => route[i].step === current);
                const state = active ? ' map-dot-current' : finished ? ' map-dot-done' : '';
                const textState = active ? ' is-current' : finished ? ' is-done' : '';
                return (
                    <g key={`${first.row}-${first.col}`}>
                        {active && <circle cx={x} cy={y} r={1.15} className="map-ring" />}
                        <circle cx={x} cy={y} r={0.66} className={`map-dot${state}`} />
                        <text x={x} y={y} className={`map-dot-text${textState}`}>{indexes[0] + 1}</text>
                        {indexes.length > 1 && (
                            <text x={x} y={y + 1.65} className="map-more">+{indexes.length - 1}</text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

export function RackFace({row, col, level, quanity, others}: {row: number; col: number; level: number; quanity: number; others: {col: number; level: number}[]}) {
    const levels = [6, 5, 4, 3, 2, 1];
    return (
        <div className="rack face" role="img" aria-label={`A ${row}. sor homloknézete: ${col}. oszlop, ${level}. szint`}>
            {levels.map((l) => (
                <div key={l} className="rack-level">
                    <div className="rack-level-name">Sz{l}</div>
                    {Array.from({length: COLS}).map((_, i) => {
                        const c = i + 1;
                        const target = c === col && l === level;
                        const pending = others.some((o) => o.col === c && o.level === l);
                        return (
                            <div key={c} className={`bin${target ? ' bin-hit' : ''}`}>
                                {target ? <b>{quanity} db</b> : pending ? <span className="face-pending">még kell</span> : null}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
