import type { HttpContext } from '@adonisjs/core/http'
import FixedCharge from '#models/fixed_charge'
import Category from '#models/category'

// Normalize any frequency to a monthly cost for stats
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

// Compute next billing date from today based on frequency and billingDay
function nextDueDate(charge: FixedCharge): string {
  const today = new Date()
  const start = new Date(charge.startDate)
  let next = new Date(today)

  switch (charge.frequency) {
    case 'daily':
      next.setDate(today.getDate() + 1)
      break
    case 'weekly': {
      const targetDay = charge.billingDay ?? start.getDay() // 0=Sun
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

export default class FixedChargesController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    const charges = await FixedCharge.query()
      .where('user_id', user.id)
      .preload('category')
      .orderBy('name', 'asc')

    const categories = await Category.query()
      .whereNull('user_id')
      .orWhere('user_id', user.id)
      .where('type', 'expense')
      .orderBy('name', 'asc')

    const activeCharges = charges.filter((c) => c.status === 'active')
    const inactiveCharges = charges.filter((c) => c.status === 'inactive')

    const monthlyTotal = activeCharges.reduce(
      (sum, c) => sum + toMonthlyCost(Number(c.amount), c.frequency),
      0
    )
    const yearlyTotal = monthlyTotal * 12

    // Attach nextDueDate as computed property
    const activeWithDue = activeCharges.map((c) => ({
      ...c.toJSON(),
      nextDueDate: nextDueDate(c),
    }))

    return view.render('pages/fixed_charges/index', {
      activeCharges: activeWithDue,
      inactiveCharges: inactiveCharges.map((c) => c.toJSON()),
      monthlyTotal,
      yearlyTotal,
      categories,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = request.only([
      'name',
      'amount',
      'frequency',
      'billingDay',
      'startDate',
      'endDate',
      'categoryId',
      'notes',
    ])

    await FixedCharge.create({
      userId: user.id,
      name: data.name,
      amount: Number(data.amount),
      frequency: data.frequency,
      billingDay: data.billingDay ? Number(data.billingDay) : null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      notes: data.notes || null,
      status: 'active',
    })

    session.flash('success', 'Fixed charge added successfully')
    return response.redirect('/fixed-charges')
  }

  async toggle({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const charge = await FixedCharge.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    charge.status = charge.status === 'active' ? 'inactive' : 'active'
    await charge.save()

    session.flash('success', `Charge ${charge.status === 'active' ? 'activated' : 'paused'}`)
    return response.redirect('/fixed-charges')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const charge = await FixedCharge.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await charge.delete()
    session.flash('success', 'Fixed charge deleted')
    return response.redirect('/fixed-charges')
  }
}
