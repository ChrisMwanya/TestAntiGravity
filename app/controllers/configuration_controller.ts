import type { HttpContext } from '@adonisjs/core/http'
import AccountType from '#models/account_type'
import Category from '#models/category'

export default class ConfigurationController {
  async index({ auth, view, request }: HttpContext) {
    const user = auth.user!
    const isOnboarding = request.input('onboarding') === 'true'

    // Fetch all necessary data for the configuration page
    const accounts = await user
      .related('accounts')
      .query()
      .preload('accountType')
      .orderBy('name', 'asc')

    const accountTypes = await AccountType.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .orderBy('name', 'asc')

    const categories = await Category.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .orderBy('name', 'asc')

    return view.render('pages/configuration/index', {
      accounts,
      accountTypes,
      categories,
      isOnboarding,
    })
  }
}
