import type { HttpContext } from '@adonisjs/core/http'
import AccountType from '#models/account_type'

export default class AccountTypesController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Get system defaults (userId is null) and user's custom types
    const types = await AccountType.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .orderBy('name', 'asc')

    return view.render('pages/account_types/index', { types })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const { name } = request.only(['name'])

    await user.related('accountTypes').create({ name })

    session.flash('success', 'Account type created successfully')
    return response.redirect().back()
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const user = auth.user!
    const type = await AccountType.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    const { name } = request.only(['name'])
    type.name = name
    await type.save()

    session.flash('success', 'Account type updated successfully')
    return response.redirect().back()
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const type = await AccountType.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    // Check if used by any account
    const accountsCount = await type.related('accounts').query().count('* as total').first()

    if (accountsCount?.$extras.total > 0) {
      session.flash('error', 'Cannot delete this type as it is used by existing accounts')
      return response.redirect().back()
    }

    await type.delete()
    session.flash('success', 'Account type deleted successfully')
    return response.redirect().back()
  }
}
