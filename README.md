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

### Different amounts for different recipient addresses

Data is specified in the file `airdropDataTwoCols.csv` which is two-column CSV with the first column is for address while the second column is for amount. Delimiter is `comma`.

Create the CSV file `airdropData.csv` which holds the addresses to receive airdrop. Each address is per line.

## Run airdrop

`npm start`