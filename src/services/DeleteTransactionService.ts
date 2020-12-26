// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<boolean> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionsRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new Error('Registro inexistente');
    }

    const deleted = transactionsRepository.delete(id);

    return !!deleted;
  }
}

export default DeleteTransactionService;
