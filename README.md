# bap-junglebus
> BAP transaction indexer for JungleBus

BAP-junglebus is a [JungleBus](https://junglebus.gorillapool.io/) compatible Bitcoin Attestation Protocol indexer. 
It scans all BAP transactions and processes them into a global BAP state using GorillaPool's JungleBus.

# global installation

```shell
npm install -g bap-junglebus
```

Set the environment variables. You must at least set a JungleBus subscription.

```shell
export BAP_SUBSCRIPTION_ID=""
```

And optionally overwrite the defaults for the database:

```shell
export BAP_MONGO_URL="mongodb://localhost:27017/bap"
```

Indexing BAP blocks can now be done by running

```shell
bap-junglebus
```

The arguments to the bap-junglebus cli are:

| arg                    | Description               |
|------------------------|---------------------------|
| `-s <subscription id>` | JungleBus subscription ID |

# local installation

```
git clone https://github.com/icellan/bap-junglebus.git
```

BAP-junglebus can run either with settings from a config file (`config.json`) or from environment variables.

config.json
```json
{
  "subscriptionId": "...",
  "mongoUrl": "mongodb://..."
}
```

environment
```shell
export BAP_SUBSCRIPTION_ID="..."
export BAP_MONGO_URL="mongo://..."
```

## run

To run the indexer:

```shell
./start.sh
```

## testing 

```shell
yarn test
```
or

```shell
yarn testwatch
```

# Including in your own package or site

```
npm install bap-junglebus
or
yarn add bap-junglebus
```

Make sure you set the environment variables before running any scripts:

```shell
export BAP_SUBSCRIPTION_ID = '<junglebus subscription id>';
export BAP_MONGO_URL = 'mongodb://localhost:27017/bap';
```

Index all BAP transactions (also from mempool):

```javascript
import { watchBAPTransactions } from 'bap-junglebus/src/bap';

(async function() {
  await watchBAPTransactions();
})();
```

# Babel

Make sure babel is set up properly or that es6 is supported by your own package.
