import Message from 'bsv/message';
import { DEBUG, BAP_BITCOM_ADDRESS } from './config.js';

/**
 * Validate AIP signature
 *
 * @param bapCell
 * @param aipCell
 * @param bapDataCell
 * @returns {boolean}
 */
export const validAIPSignature = function (bapCell, aipCell, bapDataCell) {
  try {
    let messageBuffer = Buffer.concat([
      Buffer.from('6a', 'hex'), // OP_RETURN
      Buffer.from(bapCell[0].s),
      Buffer.from(bapCell[1].s),
      Buffer.from(bapCell[2].s),
      Buffer.from(bapCell[3].s),
      Buffer.from('7c', 'hex'),
    ]);

    if (bapDataCell) {
      // data included
      messageBuffer = Buffer.concat([
        messageBuffer,
        Buffer.from(BAP_BITCOM_ADDRESS),
        Buffer.from('DATA'),
        Buffer.from(bapDataCell[2].s),
        Buffer.from(bapDataCell[3].s),
        Buffer.from('7c', 'hex'),
      ]);
    }

    const bitcoinAddress = aipCell[2].s;
    const signatureString = aipCell[3].b;

    return Message.verify(messageBuffer, bitcoinAddress, signatureString);
  } catch (e) {
    if (DEBUG) console.error(e);
  }

  return false;
};
