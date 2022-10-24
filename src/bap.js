import { JungleBusClient, ControlMessageStatusCode } from '@gorillapool/js-junglebus';
import BPU from 'bpu';

import {
  AIP_BITCOM_ADDRESS,
  BAP_BITCOM_ADDRESS,
  SUBSCRIPTION_ID,
} from './config';
import { BAP } from './schemas/bap';
import { Errors } from './schemas/errors';
import { validAIPSignature } from './aip';
import { getStatusValue, updateStatusValue } from './status';

export const FIRST_BAP_BLOCK = 590000;

export const updateLastBlock = async function (block) {
  return updateStatusValue('lastBlock', block);
};

export const getLastBlockIndex = async function () {
  const lastBlockIndex = await getStatusValue('lastBlock');
  return lastBlockIndex ? Number(lastBlockIndex) : FIRST_BAP_BLOCK;
};

export const addBAPErrorTransaction = async function (bapOp) {
  return Errors.updateOne({
    _id: bapOp.txId,
  }, {
    $set: bapOp,
  }, {
    upsert: true,
  });
};

export const processBapTransaction = async function (bapTransaction) {
  if (!bapTransaction) return;

  const bapQuery = { _id: bapTransaction.txId, ...bapTransaction };
  delete bapQuery.txId;
  bapQuery.processed = false;

  const existing = await BAP.findOne({ _id: bapQuery._id });
  if (existing) {
    const bapId = bapQuery._id;
    delete bapQuery._id;
    if (existing.timestamp) {
      // do not update timestamp if already set, we'll use the original one from the mempool
      delete bapQuery.timestamp;
    }

    await BAP.updateOne({
      _id: bapId,
    }, {
      $set: bapQuery,
    });
  } else {
    await BAP.insert(bapQuery);
  }
};

/**
 * Naive and quick and dirty parser for BAP transactions
 *
 * This should be improved and put into a generic BOB parser, like https://github.com/BitcoinSchema/go-bob
 * Example:
 *  {
      op: {
        i: 0,
        e: { v: 0, i: 0, a: 'false' },
        len: 11,
        o0: 'OP_0',
        o1: 'OP_RETURN',
        s2: '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT',
        b2: 'MUJBUFN1YVBuZkduU0JNM0dMVjl5aHhVZFllNHZHYmRNVA==',
        h2: '31424150537561506e66476e53424d33474c56397968785564596534764762644d54',
        s3: 'ATTEST',
        b3: 'QVRURVNU',
        h3: '415454455354',
        s4: 'b26bb30516fb447ba75ffca3c61f9d353fdb57e100bd49a201701132c2742fd6',
        b4: 'YjI2YmIzMDUxNmZiNDQ3YmE3NWZmY2EzYzYxZjlkMzUzZmRiNTdlMTAwYmQ0OWEyMDE3MDExMzJjMjc0MmZkNg==',
        h4: '62323662623330353136666234343762613735666663613363363166396433353366646235376531303062643439613230313730313133326332373432666436',
        s5: '0',
        b5: 'MA==',
        h5: '30',
        s6: '|',
        b6: 'fA==',
        h6: '7c',
        s7: '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva',
        b7: 'MTVQY2lIRzIyU05MUUpYTW9TVWFXVmk3V1NxYzdoQ2Z2YQ==',
        h7: '313550636948473232534e4c514a584d6f5355615756693757537163376843667661',
        s8: 'BITCOIN_ECDSA',
        b8: 'QklUQ09JTl9FQ0RTQQ==',
        h8: '424954434f494e5f4543445341',
        s9: '134a6TXxzgQ9Az3w8BcvgdZyA5UqRL89da',
        b9: 'MTM0YTZUWHh6Z1E5QXozdzhCY3ZnZFp5QTVVcVJMODlkYQ==',
        h9: '31333461365458787a675139417a33773842637667645a7941355571524c38396461',
        s10: '\u001f)��\\�E�t�\b�+\u0013�n1�j���W\u000e�3���\u0007�)M�C�m��\u0005\u0014�\u001a\fݼ���s\u001cG`\u0007YtW��lQ*�',
        b10: 'HymivVy7RZ105gjtKxPwf25/MdRqwbT9Vw6QM+27tgenKU24Q/Bts70FFMIaDN28/4GgcxxHYAdZdFeunGxRKuE=',
        h10: '1f29a2bd5cbb459d74e608ed2b13f07f6e7f31d46ac1b4fd570e9033edbbb607a7294db843f06db3bd0514c21a0cddbcff81a0731c476007597457ae9c6c512ae1'
      }
    }
 *
 * @param bapCell
 * @param aipCell
 * @param bapDataCell
 */
export const parseBAPTransaction = function (bapCell, aipCell, bapDataCell) {
  if (
    !bapCell
    || !bapCell[0]
    || bapCell[0].s !== BAP_BITCOM_ADDRESS
    || !bapCell[1].s
    || !bapCell[2].s
    || !bapCell[3].s
  ) {
    return false;
  }

  const valid = validAIPSignature(bapCell, aipCell, bapDataCell);
  if (!valid) {
    return false;
  }

  const bapTransaction = {
    type: bapCell[1].s,
    hash: bapCell[2].s,
    sequence: bapCell[3].s,
    signatureAddress: aipCell[2].s,
  };

  if (bapDataCell && bapDataCell[2].s === bapCell[2].s) {
    // data included
    /* eslint-disable prefer-destructuring */
    bapTransaction.data = bapDataCell[3].s;
  }

  return bapTransaction;
};

export const getEventFromTx = async function (rawTx) {
  return BPU.parse({
    tx: { r: rawTx },
    split: [
      {
        token: { op: 106 },
        include: 'l',
      },
      {
        token: { op: 0 },
        include: 'l',
      },
      {
        token: { s: '|' },
      },
    ],
  });
};

export const getCells = function (out) {
  let bapCell = out.tape.find((c) => {
    return c.cell[0].s === BAP_BITCOM_ADDRESS && c.cell[1].s !== 'DATA';
  });
  const bapDataCell = out.tape.find((c) => {
    return c.cell[0].s === BAP_BITCOM_ADDRESS && c.cell[1].s === 'DATA';
  });
  const aipCell = out.tape.find((c) => {
    return c.cell[0].s === AIP_BITCOM_ADDRESS;
  });

  if (bapDataCell && !bapCell) {
    bapCell = bapDataCell;
  }
  return {
    bapCell,
    bapDataCell,
    aipCell,
  };
};

export const processEvent = async function (rawTx, block, timestamp) {
  const event = await getEventFromTx(rawTx);
  const txId = event.tx.h;
  timestamp = timestamp || Math.round(+new Date() / 1000);

  if (event?.out) {
    /* eslint-disable no-restricted-syntax */
    for (const out of event.out) {
      const {
        bapCell,
        bapDataCell,
        aipCell,
      } = getCells(out);

      if (bapCell?.cell && aipCell?.cell) {
        try {
          console.log('got BAP transaction', txId, block || 'mempool');
          const bapOp = parseBAPTransaction(bapCell.cell, aipCell.cell, bapDataCell?.cell);
          if (bapOp) {
            bapOp.txId = txId;
            bapOp.block = block;
            bapOp.timestamp = timestamp;

            /* eslint-disable no-await-in-loop */
            await processBapTransaction(bapOp);
          } else {
            out.txId = txId;
            out.block = block;
            await addBAPErrorTransaction(out);
          }
        } catch (e) {
          out.txId = txId;
          out.block = block;
          out.error = JSON.stringify(e, Object.getOwnPropertyNames(e));
          await addBAPErrorTransaction(out);
        }
      }
    }
  }
};

export const watchBAPTransactions = async function (subscriptionId) {
  const lastBlockIndexed = await getLastBlockIndex();

  const client = new JungleBusClient('junglebus.gorillapool.io', {
    useSSL: true,
    onError(ctx) {
      console.error(ctx);
    },
  });

  const onPublish = async function (tx) {
    await processEvent(tx.transaction, tx.block_height, tx.block_time);
  };
  const onStatus = async function (message) {
    if (message.statusCode === ControlMessageStatusCode.BLOCK_DONE) {
      await updateLastBlock(message.block);
    } else if (message.statusCode === ControlMessageStatusCode.ERROR) {
      console.error(message);
    }
  };
  const onError = function (err) {
    console.error(err);
  };
  const onMempool = async function (tx) {
    await processEvent(tx.transaction, 0, 0);
  };

  return client.Subscribe(
    subscriptionId || SUBSCRIPTION_ID,
    lastBlockIndexed,
    onPublish,
    onStatus,
    onError,
    onMempool,
  );
};
