import type { HttpContext } from '@adonisjs/core/http'
import Debt from '#models/debt'

export default class DebtsController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    const debts = await Debt.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')

    const activeDebts = debts.filter((d) => d.status === 'active')
    const paidDebts = debts.filter((d) => d.status === 'paid')

    const totalBorrowed = activeDebts
      .filter((d) => d.type === 'borrowed')
      .reduce((sum, d) => sum + Number(d.remainingAmount), 0)

    const totalLent = activeDebts
      .filter((d) => d.type === 'lent')
      .reduce((sum, d) => sum + Number(d.remainingAmount), 0)

    return view.render('pages/debts/index', {
      debts,
      activeDebts,
      paidDebts,
      totalBorrowed,
      totalLent,
    })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/debts/create')
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = request.only(['name', 'type', 'amount', 'dueDate', 'notes'])

    await Debt.create({
      userId: user.id,
      name: data.name,
      type: data.type,
      amount: Number(data.amount),
      remainingAmount: Number(data.amount),
      dueDate: data.dueDate || null,
      status: 'active',
      notes: data.notes || null,
    })

    session.flash('success', 'Debt added successfully')
    return response.redirect('/debts')
  }

  async pay({ auth, params, request, response, session }: HttpContext) {
    const user = auth.user!
    const debt = await Debt.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    const { paymentAmount } = request.only(['paymentAmount'])
    const payment = Number(paymentAmount)

    debt.remainingAmount = Math.max(0, Number(debt.remainingAmount) - payment)

    if (debt.remainingAmount <= 0) {
      debt.status = 'paid'
    }

    await debt.save()

    session.flash('success', 'Payment recorded successfully')
    return response.redirect('/debts')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.user!
    const debt = await Debt.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await debt.delete()

    session.flash('success', 'Debt deleted')
    return response.redirect('/debts')
  }
}
