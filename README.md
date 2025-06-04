# Airdrop utils script

Implemented by IOTA Foundation.

## Introduction

Utils script to airdrop IOTA tokens from the sender wallet to the list of addresses each of which receives the same amount.

The Move contract is provided in the folder `move`.

## Install

Run this cmd: `npm i`

## Config

Copy the sample `.env.airdrop.example` to `.env.airdrop` and edit the following params:

 - `CURRENT_OWNER_ACCOUNT_MNEMONIC`
 - `AIRDROP_INDIVIDUAL_AMOUNT`

Create the CSV file `airdropData.csv` which holds the addresses to receive airdrop. Each address is per line.

## Run airdrop

`npm start`