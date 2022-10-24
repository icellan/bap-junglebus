import url from 'url';
import config from '../config.json';

export const DEBUG = !!(process.env.DEBUG || config.DEBUG || false);
export const BAP_BITCOM_ADDRESS = '1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT';
export const AIP_BITCOM_ADDRESS = '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva';
export const SUBSCRIPTION_ID = process.env.BAP_SUBSCRIPTION_ID || config.subscriptionId;
export const mongoUrl = process.env.BAP_MONGO_URL || process.env.MONGO_URL || config.mongoUrl;
if (!mongoUrl) {
  console.error('No MongoDB connection defined in ENV or config.json');
  process.exit(-1);
}
const parsedMongoUrl = url.parse(mongoUrl);
export const dbName = parsedMongoUrl.pathname.replace(/\//g, '');
