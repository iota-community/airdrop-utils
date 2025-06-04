const fs = require('fs');
const fsPromise = fs.promises;
const { parse } = require('csv');

const extractDataFromCSV = async(filePath, delimiter, from_line, column) => {
    try {
        const fileContent = await fsPromise.readFile(filePath, 'utf-8');

        return new Promise((resolve, reject) => {
            parse(fileContent, { delimiter, from_line }, (err, records) => {
                if (err) {
                    reject(`Error parsing CSV: ${err}`);
                    return;
                } ``

                const columnData = records.map(row => row[column]);
                const columnDataUnique = [...new Set(columnData)]; // Remove duplicates
                resolve(columnDataUnique);
            });
        });
    } catch (error) {
        console.error('File read error:', error);
    }
}

exports.extractDataFromCSV = extractDataFromCSV;