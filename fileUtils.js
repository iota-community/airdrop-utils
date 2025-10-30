const fs = require('fs');
const fsPromise = fs.promises;
const { parse } = require('csv');
const BigNumber = require('bignumber.js');

const isValidIotaAddressRegex = (address) => /^0x[0-9a-fA-F]{64}$/.test(address);

// Extracts data from a CSV file with two columns where the delimiter is a comma.
// Example:
// address1,amount1
// address2,amount2
const extractDataFromCSVTwoColumns = async (filePath, delimiter, from_line = 1) => {
    try {
        const fileContent = await fsPromise.readFile(filePath, 'utf-8').then((res) => res.trim());

        return new Promise((resolve, reject) => {
            parse(fileContent, { delimiter, from_line }, (err, records) => {
                if (err) {
                    reject(`Error parsing CSV: ${err}`);
                    return;
                }

                // First column is addresses, second column is amounts
                // const columnAddress = records.map(row => row[0]);
                // const columnAmount = records.map(row => row[1]);
                const columnAddress = [];
                const columnAmount = [];
                let totalAmount = 0;
                for (const row of records) {
                    if (isValidIotaAddressRegex(row[0].trim()) && !isNaN(Number(row[1].trim()))) {
                        columnAddress.push(row[0].trim());

                        const amount = new BigNumber(row[1].trim())
                            .multipliedBy(10 ** 9)
                            .toString();
                        columnAmount.push(amount);
                        totalAmount += Number(row[1].trim());
                    }
                }

                if (columnAddress.length !== columnAmount.length) {
                    reject(`Mismatched CSV columns`);
                    return;
                }

                resolve([columnAddress, columnAmount, Math.ceil(totalAmount)]);
            });
        });
    } catch (error) {
        console.error('File read error:', error);
    }
};

// Extracts data from a CSV file with only one column that is the addresses.
// Delimiter can be newline \n or comma ,.
const extractDataFromCSVOneColumn = async (filePath, delimiter, from_line = 1) => {
    try {
        const fileContent = await fsPromise.readFile(filePath, 'utf-8').then((res) => res.trim());

        return new Promise((resolve, reject) => {
            parse(fileContent, { delimiter, from_line }, (err, records) => {
                if (err) {
                    reject(`Error parsing CSV: ${err}`);
                    return;
                }

                const columnData = records
                    .map((row) => row[0].trim())
                    .filter((row) => isValidIotaAddressRegex(row));
                const columnDataUnique = [...new Set(columnData)]; // Remove duplicates
                resolve(columnDataUnique);
            });
        });
    } catch (error) {
        console.error('File read error:', error);
    }
};

module.exports = {
    extractDataFromCSVOneColumn,
    extractDataFromCSVTwoColumns,
    isValidIotaAddressRegex,
};
