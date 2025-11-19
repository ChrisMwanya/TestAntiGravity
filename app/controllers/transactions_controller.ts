import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import Account from '#models/account'
import Category from '#models/category'

export default class TransactionsController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!
    const accounts = await Account.query().where('user_id', user.id)
    const transactions = await Transaction.query()
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .preload('account')
      .preload('category')
      .orderBy('date', 'desc')

    const categories = await Category.all()

    return view.render('pages/transactions/index', {
      transactions,
      accounts,
      categories,
    })
  }

  async create({ view }: HttpContext) {
    const accounts = await Account.all()
    const categories = await Category.all()
    return view.render('pages/transactions/create', { accounts, categories })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['accountId', 'categoryId', 'amount', 'type', 'date', 'description'])

    // Verify account belongs to user
    const account = await Account.query()
      .where('id', data.accountId)
      .where('user_id', user.id)
      .firstOrFail()

    const transaction = await Transaction.create(data)

    // Update account balance
    if (data.type === 'income') {
      account.balance = Number(account.balance) + Number(data.amount)
    } else {
      account.balance = Number(account.balance) - Number(data.amount)
    }
    await account.save()

    return response.redirect('/transactions')
  }

  async edit({ params, view }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('account')
      .preload('category')
      .firstOrFail()

    const accounts = await Account.all()
    const categories = await Category.all()

    return view.render('pages/transactions/edit', {
      transaction,
      accounts,
      categories,
    })
  }

  async update({ params, request, response }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const oldAmount = Number(transaction.amount)
    const oldType = transaction.type

    const data = request.only(['accountId', 'categoryId', 'amount', 'type', 'date', 'description'])

    // Revert old transaction effect on balance
    const account = await Account.findOrFail(transaction.accountId)
    if (oldType === 'income') {
      account.balance = Number(account.balance) - oldAmount
    } else {
      account.balance = Number(account.balance) + oldAmount
    }

    // Apply new transaction
    if (data.type === 'income') {
      account.balance = Number(account.balance) + Number(data.amount)
    } else {
      account.balance = Number(account.balance) - Number(data.amount)
    }
    await account.save()

    transaction.merge(data)
    await transaction.save()

    return response.redirect('/transactions')
  }

  async destroy({ params, response }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const account = await Account.findOrFail(transaction.accountId)

    // Revert transaction effect on balance
    if (transaction.type === 'income') {
      account.balance = Number(account.balance) - Number(transaction.amount)
    } else {
      account.balance = Number(account.balance) + Number(transaction.amount)
    }
    await account.save()

    await transaction.delete()
    return response.redirect('/transactions')
  }
}