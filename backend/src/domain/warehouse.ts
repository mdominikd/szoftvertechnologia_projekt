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

