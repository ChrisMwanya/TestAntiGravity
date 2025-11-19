import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import AccountType from '#models/account_type'

export default class AccountsController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Load accounts with their types
    const accounts = await user
      .related('accounts')
      .query()
      .preload('accountType')
      .orderBy('created_at', 'desc')

    // Load available account types (system + user specific)
    const accountTypes = await AccountType.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .orderBy('name', 'asc')

    return view.render('pages/accounts/index', { accounts, accountTypes })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = request.only(['name', 'accountTypeId', 'balance'])

    await user.related('accounts').create({
      name: data.name,
      accountTypeId: data.accountTypeId,
      balance: data.balance,
    })

    session.flash('success', 'Account created successfully')
    return response.redirect().back()
  }

  async destroy({ params, response }: HttpContext) {
    const account = await Account.findOrFail(params.id)
    await account.delete()
    return response.redirect('/accounts')
  }
}
