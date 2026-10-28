export type BinState = { id: number, number: number, partId: number | null; quanity: number};

export function planStockIn(bins: BinState[], partId: number, maxPerBin: number, quanity: number) {
    const byNumber = [...bins].sort((a,b) => a.number -b.number);
    const candidates = [
        ...byNumber.filter((b) => b.partId === partId && b.quanity < maxPerBin),
        ...byNumber.filter((b) => b.partId === null), 
    ];

    const plan: { binId: number; add: number} [] = [];
    let left = quanity;
    for(const bin of candidates) {
        if(left === 0) break;
        const add = Math.min(maxPerBin - bin.quanity, left);
        plan.push({binId: bin.id,add});
        left -= add;
    }
    if(left>0) throw new Error(`Nincs eleg helz a raktarban, ${left} db nem fer el`);
    return plan;


}

export function pp(bins: BinState[], quanity:number) {
    const plan: {binId: number; take: number}[] =[];
    let left =quanity;
    for(const bin of [...bins].sort((a,b) => a.number - b.number)) {
        if(left === 0) break;
        const take = Math.min(bin.quanity,left);
        if(take === 0) continue;
        plan.push({binId: bin.id,take})
        left -=take;
    } 
    if(left >0) throw new Error(`Nincs eleg keszlet, ${left} db hianyzik`);
    return plan;
}