import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware to ensure the user has verified their email
 */
export default class VerifiedMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {
    const user = auth.user

    if (!user) {
      return response.redirect().toRoute('auth.login.show')
    }

    if (!user.isVerified) {
      session.flash('error', 'Veuillez vérifier votre email pour accéder à cette page.')
      return response.redirect().toRoute('auth.verification.pending')
    }

    return next()
  }
}
