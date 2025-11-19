import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    await Category.createMany([
      // Income categories
      { name: 'Salary', type: 'income' },
      { name: 'Freelance', type: 'income' },
      { name: 'Investment Returns', type: 'income' },
      { name: 'Other Income', type: 'income' },
      
      // Expense categories
      { name: 'Food & Dining', type: 'expense' },
      { name: 'Transportation', type: 'expense' },
      { name: 'Shopping', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
      { name: 'Bills & Utilities', type: 'expense' },
      { name: 'Healthcare', type: 'expense' },
      { name: 'Education', type: 'expense' },
      { name: 'Other Expenses', type: 'expense' },
    ])
  }
}