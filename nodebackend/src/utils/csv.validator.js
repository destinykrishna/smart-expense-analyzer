const csv = require('csv-parser');
const fs = require('fs');

// Required columns that every uploaded CSV must have
const REQUIRED_COLUMNS = ['id', 'date', 'description', 'amount'];

/**
 * Validates CSV headers without fully parsing the file.
 * Reads only as much of the file as needed to get the first row.
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Promise<{ valid: boolean, missingColumns: string[] }>}
 */
function validateCsvHeaders(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    const parser = csv();

    stream.pipe(parser);

    parser.once('headers', (headers) => {
      parser.destroy(); // stop reading after first row
      stream.destroy();

      const normalised = headers.map((h) => h.trim().toLowerCase());
      const missingColumns = REQUIRED_COLUMNS.filter((col) => !normalised.includes(col));

      resolve({ valid: missingColumns.length === 0, missingColumns });
    });

    parser.once('error', reject);
    stream.once('error', reject);
  });
}

/**
 * Parses the full CSV file and returns an array of transaction objects
 * ready to be sent to the ML service.
 * @param {string} filePath
 * @returns {Promise<Array<{ id, date, description, amount, currency }>>}
 */
function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          id:          row.id?.trim(),
          date:        row.date?.trim(),
          description: row.description?.trim(),
          amount:      parseFloat(row.amount),
          currency:    (row.currency?.trim() || 'USD').toUpperCase(),
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = { validateCsvHeaders, parseCsv };
