import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'

export default class AccountsController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!
    const accounts = await Account.query().where('user_id', user.id)

    return view.render('pages/accounts/index', { accounts })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['name', 'type', 'balance'])

    await Account.create({
      userId: user.id,
      ...data,
    })

    return response.redirect('/accounts')
  }

  async destroy({ params, response }: HttpContext) {
    const account = await Account.findOrFail(params.id)
    await account.delete()
    return response.redirect('/accounts')
  }
}
