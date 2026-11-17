import { planPicking, type PickBin } from './picking.js';

const bin = (id: number, row: number, col: number, level: number, quanity: number): PickBin =>
    ({id, number: id, row, col, level, quanity});

describe('planPicking', () => {
    it('a kivett darabszam pontosan a kert, es rekeszenkent nem tobb a keszletnel', () => {
        const bins = [bin(1, 1, 1, 1, 3), bin(2, 1, 2, 1, 4), bin(3, 9, 3, 2, 10)];
        const { lines } = planPicking([{ partId: 1, quanity: 9, bins }]);
        expect(lines.reduce((s, l) => s + l.take, 0)).toBe(9);
        for (const l of lines) expect(l.take).toBeLessThanOrEqual(bins.find((b) => b.id === l.binId)!.quanity);
    });

    it('a rovidebb setat valasztja a sorszam szerinti kivalasztas helyett', () => {
        const a = [bin(1, 10, 4, 1, 1), bin(2, 1, 1, 1, 1)];
        const b = [bin(3, 1, 1, 2, 1)];
        const { lines, length, baseline } = planPicking([
            { partId: 1, quanity: 1, bins: a },
            { partId: 2, quanity: 1, bins: b },
        ]);
        expect(length).toBeLessThan(baseline);
        expect(lines.find((l) => l.partId === 1)!.binId).toBe(2);
    });

    it('tobb kisebb rekeszt egy nagyba vonja ossze, ha elfer', () => {
        const a = [bin(1, 1, 1, 1, 2), bin(2, 10, 4, 1, 2), bin(3, 1, 1, 2, 5)];
        const { lines } = planPicking([{ partId: 1, quanity: 4, bins: a }]);
        expect(lines.map((l) => l.binId).sort()).toEqual([1, 3]);
    });

    it('hianyos keszletnel hibat dob', () => {
        expect(() => planPicking([{ partId: 1, quanity: 5, bins: [bin(1, 1, 1, 1, 2)] }])).toThrow('hianyzik');
    });
});
