import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async register({ request, response, auth }: HttpContext) {
    const data = request.only(['fullName', 'email', 'password'])

    const user = await User.create(data)
    await auth.use('web').login(user)

    return response.redirect('/dashboard')
  }

  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    return response.redirect('/dashboard')
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }
}
