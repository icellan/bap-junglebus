import fs from 'fs';
import {
  describe,
  expect,
  test,
} from '@jest/globals';

import { getCells, getEventFromTx } from '../src/bap';
import { validAIPSignature} from '../src/aip';

const tx1 = fs.readFileSync('./test/data/6a36e2c06be15b5e36f4c61ce7700a65887f4eaa4b33c24cff71724f813cd6ea.hex');
const tx2 = fs.readFileSync('./test/data/b2bbc64a109bcda53b58c0e1e0e77be550dc7fa8133242a440820d04e55c460c.hex');

describe('validAIPSignature', () => {
  test('validate ATTEST', async() => {
    const event = await getEventFromTx(tx1.toString());
    const cells = getCells(event.out[0]);
    expect(validAIPSignature(cells.bapCell.cell, cells.aipCell.cell, cells.bapDataCell?.cell)).toBe(true);
  });

  test('validate ID', async() => {
    const event = await getEventFromTx(tx2.toString());
    const cells = getCells(event.out[0]);
    expect(validAIPSignature(cells.bapCell.cell, cells.aipCell.cell, cells.bapDataCell?.cell)).toBe(true);
  });
});
