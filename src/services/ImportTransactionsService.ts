import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionRequest {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_title: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const requests: TransactionRequest[] = [];

    const filePath = path.resolve(__dirname, '..', '..', 'tmp', fileName);
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const request = {
        title: line[0],
        type: line[1],
        value: line[2],
        category_title: line[3],
      };
      requests.push(request);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const transactions = requests.map(request => {
      return createTransaction.execute(request);
    });

    await Promise.all(transactions);

    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
