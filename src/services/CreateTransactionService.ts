// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
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

    let category_id;

    // Repositório de categorias
    const categoriesRepository = getRepository(Category);

    // Verifica se já existe cadastro da categoria
    const categoryExists = await categoriesRepository.findOne({
      where: {
        title: category_title,
      },
    });

    if (!categoryExists) {
      // Cria categoria e usa seu id
      const category = categoriesRepository.create({ title: category_title });
      const savedCategory = await categoriesRepository.save(category);
      category_id = savedCategory.id;
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
