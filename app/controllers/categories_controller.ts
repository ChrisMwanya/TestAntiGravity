import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'

export default class CategoriesController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Get system defaults (userId is null) and user's custom categories
    const categories = await Category.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .orderBy('name', 'asc')

    return view.render('pages/categories/index', { categories })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = request.only(['name', 'type'])

    await user.related('categories').create({
      name: data.name,
      type: data.type as 'income' | 'expense',
    })

    session.flash('success', 'Category created successfully')
    return response.redirect().back()
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const category = await Category.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    // Check if used by any transaction or budget
    const transactionsCount = await category
      .related('transactions')
      .query()
      .count('* as total')
      .first()
    const budgetsCount = await category.related('budgets').query().count('* as total').first()

    if (transactionsCount?.$extras.total > 0 || budgetsCount?.$extras.total > 0) {
      session.flash(
        'error',
        'Cannot delete this category as it is used by existing transactions or budgets'
      )
      return response.redirect().back()
    }

    await category.delete()
    session.flash('success', 'Category deleted successfully')
    return response.redirect().back()
  }
}
