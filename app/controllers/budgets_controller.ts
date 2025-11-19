import type { HttpContext } from '@adonisjs/core/http'
import Budget from '#models/budget'
import Category from '#models/category'
import Account from '#models/account'
import db from '@adonisjs/lucid/services/db'

export default class BudgetsController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!
    const budgets = await Budget.query().where('user_id', user.id).preload('category')

    // Calculate spending for each budget
    const accounts = await Account.query().where('user_id', user.id)
    const currentMonth = new Date().toISOString().slice(0, 7)

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await db
          .from('transactions')
          .whereIn(
            'account_id',
            accounts.map((a) => a.id)
          )
          .where('category_id', budget.categoryId)
          .where('type', 'expense')
          .whereRaw(`strftime('%Y-%m', date) = ?`, [currentMonth])
          .sum('amount as total')
          .first()

        return {
          ...budget.toJSON(),
          spent: spending?.total || 0,
          percentage: ((spending?.total || 0) / Number(budget.amount)) * 100,
        }
      })
    )

    const categories = await Category.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .orderBy('name', 'asc')

    return view.render('pages/budgets/index', {
      budgets: budgetsWithSpending,
      categories,
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['categoryId', 'amount', 'period'])

    await Budget.create({
      userId: user.id,
      ...data,
    })

    return response.redirect('/budgets')
  }

  async destroy({ params, response }: HttpContext) {
    const budget = await Budget.findOrFail(params.id)
    await budget.delete()
    return response.redirect('/budgets')
  }
}
