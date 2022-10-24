#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/yargs';
import { watchBAPTransactions } from './bap';

const options = yargs(hideBin(process.argv))
  .usage('Usage: -s <subscriptionId>')
  .option('s', {
    alias: 'subscription',
    describe: 'JungleBus subscription ID',
    type: 'string',
  })
  .argv;

(async () => {
  await watchBAPTransactions(options.subscription);
})()
  .catch((error) => {
    console.error(error);
  });
