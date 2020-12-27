import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: CreateTransactionDTO): Promise<Transaction> {
    // Repositório de transações
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    // Repositório de categorias
    const categoriesRepository = getRepository(Category);

    let category_id;

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (total < value) {
        throw new AppError('Not enough balance.');
      }
    }

    // Verifica se já existe cadastro da categoria
    const categoryExists = await categoriesRepository.findOne({
      where: {
        title: category_title,
      },
    });

    if (!categoryExists) {
      // Cria categoria e usa seu id
      const category = categoriesRepository.create({ title: category_title });
      await categoriesRepository.save(category);
      category_id = category.id;
    } else {
      // Usa id da categoria existente
      category_id = categoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    // Salvar no banco de dados
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
