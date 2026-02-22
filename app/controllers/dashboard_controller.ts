import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import Account from '#models/account'
import Investment from '#models/investment'
import Debt from '#models/debt'
import FixedCharge from '#models/fixed_charge'
import db from '@adonisjs/lucid/services/db'

// Normalize a fixed charge amount to monthly cost
function toMonthlyCost(amount: number, frequency: string): number {
  switch (frequency) {
    case 'daily':
      return amount * 30.44
    case 'weekly':
      return amount * 4.33
    case 'monthly':
      return amount
    case 'quarterly':
      return amount / 3
    case 'yearly':
      return amount / 12
    default:
      return amount
  }
}

// Compute next billing date
function nextDueDate(charge: FixedCharge): string {
  const today = new Date()
  const start = new Date(charge.startDate)
  let next = new Date(today)

  switch (charge.frequency) {
    case 'daily':
      next.setDate(today.getDate() + 1)
      break
    case 'weekly': {
      const targetDay = charge.billingDay ?? start.getDay()
      const diff = (targetDay - today.getDay() + 7) % 7 || 7
      next.setDate(today.getDate() + diff)
      break
    }
    case 'monthly': {
      const day = charge.billingDay ?? start.getDate()
      next = new Date(today.getFullYear(), today.getMonth(), day)
      if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, day)
      break
    }
    case 'quarterly': {
      const day = charge.billingDay ?? start.getDate()
      next = new Date(today.getFullYear(), today.getMonth(), day)
      if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 3, day)
      break
    }
    case 'yearly': {
      next = new Date(start)
      next.setFullYear(today.getFullYear())
      if (next <= today) next.setFullYear(today.getFullYear() + 1)
      break
    }
  }

  return next.toISOString().split('T')[0]
}

export default class DashboardController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Accounts
    const accounts = await Account.query().where('user_id', user.id).preload('accountType')
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

    // Recent transactions
    const recentTransactions = await Transaction.query()
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .preload('account')
      .preload('category')
      .orderBy('date', 'desc')
      .limit(10)

    // Monthly income & expenses
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthlyStats = await db
      .from('transactions')
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .whereRaw(`TO_CHAR(date, 'YYYY-MM') = ?`, [currentMonth])
      .select('type')
      .sum('amount as total')
      .groupBy('type')

    const income = Number(monthlyStats.find((s: any) => s.type === 'income')?.total || 0)
    const expenses = Number(monthlyStats.find((s: any) => s.type === 'expense')?.total || 0)

    // Investments
    const investments = await Investment.query().where('user_id', user.id)
    const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0)

    // Debts
    const debts = await Debt.query().where('user_id', user.id).where('status', 'active')
    const totalBorrowed = debts
      .filter((d) => d.type === 'borrowed')
      .reduce((sum, d) => sum + Number(d.remainingAmount), 0)
    const totalLent = debts
      .filter((d) => d.type === 'lent')
      .reduce((sum, d) => sum + Number(d.remainingAmount), 0)

    // Fixed Charges
    const fixedCharges = await FixedCharge.query()
      .where('user_id', user.id)
      .where('status', 'active')
      .preload('category')

    const monthlyBills = fixedCharges.reduce(
      (sum, c) => sum + toMonthlyCost(Number(c.amount), c.frequency),
      0
    )

    // Upcoming bills (next 5 by due date)
    const upcomingBills = fixedCharges
      .map((c) => ({ ...c.toJSON(), nextDueDate: nextDueDate(c) }))
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
      .slice(0, 5)

    return view.render('pages/dashboard', {
      user,
      totalBalance,
      income,
      expenses,
      totalInvestments,
      recentTransactions,
      accounts,
      investments,
      totalBorrowed,
      totalLent,
      monthlyBills,
      upcomingBills,
      activeDebtsCount: debts.length,
    })
  }
}
