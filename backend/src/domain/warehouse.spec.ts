import { bindNodeCallback } from 'rxjs';
import { binLabel, binNumber, WAREHOUSE } from './warehouse.js';

describe('binNumber', () => {
  it('a feladat példája: (3, 2, 4) a 58. rekesz', () => {
    expect(binNumber(3,2, 4)).toBe(58);
  });

  it('az első és az utolsó rekesz', () => {
    expect(binNumber(1,1,1)).toBe(1);
    expect(binNumber(WAREHOUSE.rows, WAREHOUSE.cols, WAREHOUSE.levels)).toBe(240);
  });
});


describe('binLabel', () => {
    it('haromjegy sorszam es hely teszt', () => {
        expect(binLabel({number: 58, row:3, col:2, level: 4})).toBe('058 (S3-02-Sz4)');
    })
})