export const binLabel = (bin: {number: number; row: number; col: number; level: number}) =>
    `${String(bin.number).padStart(3, '0')} (S${bin.row}-0${bin.col}-Sz${bin.level})`;
