import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import Account from '#models/account'
import Investment from '#models/investment'
import db from '@adonisjs/lucid/services/db'

export default class DashboardController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Get all accounts with their balances
    const accounts = await Account.query().where('user_id', user.id)

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

    // Get recent transactions
    const recentTransactions = await Transaction.query()
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .preload('account')
      .preload('category')
      .orderBy('date', 'desc')
      .limit(10)

    // Calculate income and expenses for current month
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthlyStats = await db
      .from('transactions')
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .whereRaw(`strftime('%Y-%m', date) = ?`, [currentMonth])
      .select('type')
      .sum('amount as total')
      .groupBy('type')

    const income =
      monthlyStats.find((s: any) => s.type === 'income')?.total || 0
    const expenses =
      monthlyStats.find((s: any) => s.type === 'expense')?.total || 0

    // Get investments
    const investments = await Investment.query().where('user_id', user.id)
    const totalInvestments = investments.reduce(
      (sum, inv) => sum + Number(inv.currentValue),
      0
    )

    return view.render('pages/dashboard', {
      user,
      totalBalance,
      income,
      expenses,
      totalInvestments,
      recentTransactions,
      accounts,
      investments,
    })
  }
}