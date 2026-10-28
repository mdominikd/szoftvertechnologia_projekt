// M1: raktar elrendezes

//240 es rekesz
export const WAREHOUSE = {rows: 10, cols: 4, levels: 6};

//ember altal olvashato tag
export function binNumber(row:number,col:number,level:number):number{
    return (row -1) * WAREHOUSE.cols * WAREHOUSE.levels + (col -1) * WAREHOUSE.levels +level;
}



//rekesz cimke
export function binLabel(bin: { number: number; row:number; col:number; level:number}): string {
    return `${String(bin.number).padStart(3, '0')} (S${bin.row}-0${bin.col}-Sz${bin.level})`;
}

export function asileOf(row: number): number {
    return Math.floor(row/2);
}


export function sortRoute<T extends {row:number; col: number; level: number}>(items: T[]): T[] {
    return [...items].sort((a,b)=> {
        const asile = asileOf(a.row) - asileOf(b.row);
        if(asile !=0) return asile;
        const colDiff = asileOf(a.row) %2 ===0 ? a.col - b.col : b.col - a.col;
        return colDiff || a.level -  b.level || a.row - b.row;
    });
}

