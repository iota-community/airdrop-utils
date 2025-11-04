require('dotenv').config({ path: './.env.airdrop' });
const { Transaction } = require('@iota/iota-sdk/transactions');
const { IotaClient, getFullnodeUrl } = require('@iota/iota-sdk/client');
const { toHEX } = require('@iota/iota-sdk/utils');
const { Ed25519Keypair } = require('@iota/iota-sdk/keypairs/ed25519');
const BigNumber = require('bignumber.js');
const { extractDataFromCSVOneColumn, extractDataFromCSVTwoColumns } = require('./fileUtils');

const MAX_AIRDROP_ADDRESSES_PER_TIME = 500;

async function getAirdropData() {
    const { AIRDROP_INDIVIDUAL_AMOUNT } = process.env;

    console.log('AIRDROP_INDIVIDUAL_AMOUNT:', AIRDROP_INDIVIDUAL_AMOUNT);

    let CSV_FILE = './airdropDataTwoCols.csv';
    let airdropAddressList = [];
    let airdropAmountList = [];
    let airdropTotalAmount = 0;

    // This is the case of CSV with 2 columns
    if (!AIRDROP_INDIVIDUAL_AMOUNT) {
        const [addressList, amountList, totalAmount] = await extractDataFromCSVTwoColumns(
            CSV_FILE,
            ',',
        );
        airdropAddressList = addressList;
        airdropAmountList = amountList;

        airdropTotalAmount = new BigNumber(totalAmount).multipliedBy(10 ** 9).toString();
    } else {
        // This is the case of CSV with 1 column
        CSV_FILE = './airdropDataOneCol.csv';

        airdropAddressList = await extractDataFromCSVOneColumn(CSV_FILE, '\n');

        const airdropIndividualAmount = new BigNumber(AIRDROP_INDIVIDUAL_AMOUNT)
            .multipliedBy(10 ** 9)
            .toString();

        airdropAmountList = Array(airdropAddressList.length).fill(airdropIndividualAmount);

        airdropTotalAmount = new BigNumber(
            airdropAddressList.length * Number(AIRDROP_INDIVIDUAL_AMOUNT),
        )
            .multipliedBy(10 ** 9)
            .toString();
    }

    console.log('CSV_FILE:', CSV_FILE);

    return [airdropAddressList, airdropAmountList, airdropTotalAmount];
}

async function runAirdrop(airdropAddressList, airdropAmountList) {
    const {
        NETWORK,
        MOVE_PACKAGE_ID,
        MOVE_MODULE,
        MOVE_MODULE_FUNCTION,
        MULTISIG_ACCOUNT_ADDRESS,
        CURRENT_OWNER_ACCOUNT_MNEMONIC,
    } = process.env;

    console.log('NETWORK:', NETWORK);
    console.log('MOVE_PACKAGE_ID:', MOVE_PACKAGE_ID);

    if (airdropAddressList.length !== airdropAmountList.length) {
        throw new Error('Address and amount lists must have the same length');
    }

    console.log('airdropAddressList:', airdropAddressList);
    console.log('airdropAmountList:', airdropAmountList);

    let airdropTotalAmount = airdropAmountList.reduce((acc, val) => {
        return acc.plus(new BigNumber(val));
    }, new BigNumber(0));
    airdropTotalAmount = airdropTotalAmount.toString();

    const url =
        getFullnodeUrl(NETWORK) ||
        (NETWORK === 'mainnet' ? 'https://api.mainnet.iota.cafe' : 'https://api.testnet.iota.cafe');
    console.log('Using fullnode URL:', url);
    const client = new IotaClient({ url });

    const txb = new Transaction();

    const keypair = !MULTISIG_ACCOUNT_ADDRESS
        ? Ed25519Keypair.deriveKeypair(CURRENT_OWNER_ACCOUNT_MNEMONIC)
        : null;

    const senderAddress = !MULTISIG_ACCOUNT_ADDRESS
        ? keypair.toIotaAddress()
        : MULTISIG_ACCOUNT_ADDRESS;
    console.log('Sender address:', senderAddress);
    txb.setSender(senderAddress);

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

    if (!MULTISIG_ACCOUNT_ADDRESS) {
        const { digest } = await client.signAndExecuteTransaction({
            signer: keypair,
            transaction: txb,
        });

        await client.waitForTransaction({
            digest,
        });

        console.log('Tx hash:', digest);
    } else {
        // Build a transaction block so that it can be signed or simulated
        const txBytes = await txb.build({ client });

        // Convert txb to hex string which can then be used as input to the multisig interface
        const txBytesHexStr = toHEX(txBytes);

        console.log('Build txb result:', txBytesHexStr);
    }
}

async function main() {
    const [airdropAddressList, airdropAmountList, airdropTotalAmount] = await getAirdropData();

    for (let i = 0; i < airdropAddressList.length; i += MAX_AIRDROP_ADDRESSES_PER_TIME) {
        const addressChunk = airdropAddressList.slice(i, i + MAX_AIRDROP_ADDRESSES_PER_TIME);
        const amountChunk = airdropAmountList.slice(i, i + MAX_AIRDROP_ADDRESSES_PER_TIME);

        try {
            await runAirdrop(addressChunk, amountChunk);
        } catch (error) {
            console.error('Error occurred while running airdrop:', error);
        }
    }
}

main().catch((err) => console.error(err));
