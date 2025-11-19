import type { HttpContext } from '@adonisjs/core/http'
import Investment from '#models/investment'
import Account from '#models/account'

export default class InvestmentsController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!
    const investments = await Investment.query().where('user_id', user.id)

    const investmentsWithStats = investments.map((investment) => {
      const gain = Number(investment.currentValue) - Number(investment.initialValue)
      const gainPercentage = (gain / Number(investment.initialValue)) * 100

      return {
        ...investment.toJSON(),
        gain,
        gainPercentage,
      }
    })

    // Calculate total income for percentage calculation
    const accounts = await Account.query().where('user_id', user.id)
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0)
    const investmentPercentage = totalBalance > 0 ? (totalInvestmentValue / totalBalance) * 100 : 0

    return view.render('pages/investments/index', {
      investments: investmentsWithStats,
      totalInvestmentValue,
      investmentPercentage,
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['name', 'currentValue', 'initialValue', 'type'])

    await Investment.create({
      userId: user.id,
      ...data,
    })

    return response.redirect('/investments')
  }

  async update({ params, request, response }: HttpContext) {
    const investment = await Investment.findOrFail(params.id)
    const data = request.only(['currentValue'])

    investment.merge(data)
    await investment.save()

    return response.redirect('/investments')
  }

  async destroy({ params, response }: HttpContext) {
    const investment = await Investment.findOrFail(params.id)
    await investment.delete()
    return response.redirect('/investments')
  }
}
