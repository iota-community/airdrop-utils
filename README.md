# Airdrop utils script

Implemented by IOTA Foundation.

## Introduction

Utils script to airdrop IOTA tokens from the sender wallet to the list of addresses each of which receives the same amount.

The Move contract is provided in the folder `move`.

## Install

Run this cmd: `npm i`

## Config

Copy the sample `.env.airdrop.example` to `.env.airdrop` and edit the following params:

**Notice**

If the param `MULTISIG_ACCOUNT_ADDRESS` is set, then the script will only build the tx.

If the param `AIRDROP_INDIVIDUAL_AMOUNT` is set, then all recipient addresses will receive the same amount.

### Same amount for all recipient addresses

Data is specified in the file `airdropDataOneCol.csv` which is one column CSV with one address per line. Delimiter is newline `\n`.

Example:

```
0x1b161bf35ad91f323b5e05bd2f871635f3f6094d95aa7693ec033411bb7ce937
0xe487a2538dc5ff473f948e455859fb8708df145b823bf68defeb771c463c8297
```

### Different amounts for different recipient addresses

Data is specified in the file `airdropDataTwoCols.csv` which is two-column CSV with the first column is for address while the second column is for amount. Delimiter is `comma`.

Example:

```
0x1b161bf35ad91f323b5e05bd2f871635f3f6094d95aa7693ec033411bb7ce937,0.004
0xe487a2538dc5ff473f948e455859fb8708df145b823bf68defeb771c463c8297,0.005
```

## Run airdrop

`npm start`

## Run in background with pm2

```
pm2 start runAirdrop.sh --no-autorestart --log-date-format='YYYY-MM-DD HH:mm:ss'
```