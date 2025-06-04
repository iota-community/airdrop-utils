require('dotenv').config({ path: './.env.airdrop' });
const { Transaction } = require('@iota/iota-sdk/transactions');
const { IotaClient, getFullnodeUrl } = require('@iota/iota-sdk/client');
const { Ed25519Keypair } = require('@iota/iota-sdk/keypairs/ed25519');
const BigNumber = require('bignumber.js');
const { IOTA_DECIMALS } = require('@iota/iota-sdk/utils');
const { extractDataFromCSV } = require('./fileUtils');

const CSV_FILE = './airdropData.csv';

const isValidIotaAddressRegex = (address) => /^0x[0-9a-fA-F]{64}$/.test(address);

async function main() {

    const { NETWORK, MOVE_PACKAGE_ID, MOVE_MODULE, MOVE_MODULE_FUNCTION, AIRDROP_INDIVIDUAL_AMOUNT, CURRENT_OWNER_ACCOUNT_MNEMONIC } = process.env;

    console.log('NETWORK:', NETWORK);
    console.log('MOVE_PACKAGE_ID:', MOVE_PACKAGE_ID);
    console.log('AIRDROP_INDIVIDUAL_AMOUNT:', AIRDROP_INDIVIDUAL_AMOUNT);

    const airdropAddressList = await extractDataFromCSV(CSV_FILE, '\n', 1, 0).then(res => res.filter(line => line.trim() !== '' && isValidIotaAddressRegex(line.trim())));

    console.log('airdropAddressList:', airdropAddressList);

    const airdropIndividualAmount = new BigNumber(AIRDROP_INDIVIDUAL_AMOUNT).multipliedBy(10 ** IOTA_DECIMALS).toString();
    const airdropAmountList = Array(airdropAddressList.length).fill(airdropIndividualAmount);
    console.log('airdropAmountList:', airdropAmountList);

    const url = getFullnodeUrl(NETWORK) || (NETWORK === 'mainnet' ? 'https://api.mainnet.iota.cafe' : 'https://api.testnet.iota.cafe');
    console.log('Using fullnode URL:', url);
    const client = new IotaClient({ url });

    const txb = new Transaction();

    const keypair = Ed25519Keypair.deriveKeypair((CURRENT_OWNER_ACCOUNT_MNEMONIC));

    const senderAddress = keypair.toIotaAddress();
    console.log('Sender address:', senderAddress);
    txb.setSender(senderAddress);

    const airdropTotalAmount = new BigNumber(airdropAddressList.length * Number(AIRDROP_INDIVIDUAL_AMOUNT)).multipliedBy(10 ** IOTA_DECIMALS).toString();

    // No need to find coin
    // console.log('airdropTotalAmount:', airdropTotalAmount);
    // const coinFound = coinResp.data.find(
    //     (coin) => Number(coin.balance) >= Number(airdropTotalAmount),
    // );
    // if (coinFound.length === 0) {
    //     console.error("No IOTA coins available");
    //     return;
    // }
    // console.log('coinFound:', coinFound);

    // If using this, it never works with the error
    // Error: No valid gas coins found for the transaction
    // const [airdropCoin] = txb.splitCoins(txb.object(coinFound.coinObjectId), [airdropTotalAmount]);

    // Only this works!
    const [airdropCoin] = txb.splitCoins(txb.gas, [airdropTotalAmount]);

    txb.moveCall({
        target: `${MOVE_PACKAGE_ID}::${MOVE_MODULE}::${MOVE_MODULE_FUNCTION}`,
        arguments: [
            airdropCoin, // Coin<IOTA>
            txb.pure('vector<address>', airdropAddressList),
            txb.pure('vector<u64>', airdropAmountList), // Amount<u64>
        ],
    });

    const res = await client.devInspectTransactionBlock({
        transactionBlock: txb,
        sender: senderAddress,
    });
    console.log('Dev inspect result:', res.effects.status);

    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: txb,
    });

    console.log('Result:', result);
}

main().catch(err => console.error(err));

