import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'

export default class AuthController {
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async register({ request, response, session }: HttpContext) {
    const data = request.only(['fullName', 'email', 'password'])

    const user = await User.create(data)
    const token = await user.generateVerificationToken()

    // Send verification email
    await mail.send(new VerifyEmailNotification(user, token))

    session.flash('success', 'Un email de vérification a été envoyé à votre adresse.')
    return response.redirect().toRoute('auth.verification.pending')
  }

  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)

    if (!user.isVerified) {
      session.flash('error', 'Veuillez vérifier votre email avant de vous connecter.')
      return response.redirect().toRoute('auth.verification.pending')
    }

    await auth.use('web').login(user)
    return response.redirect('/dashboard')
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }

  async verify({ params, response, auth, session }: HttpContext) {
    const user = await User.verifyEmail(params.token)

    if (!user) {
      session.flash('error', 'Le lien de vérification est invalide ou a expiré.')
      return response.redirect().toRoute('auth.verification.failed')
    }

    await auth.use('web').login(user)
    session.flash('success', 'Votre email a été vérifié avec succès !')
    return response.redirect().toRoute('auth.verification.success')
  }

  async showVerificationPending({ view }: HttpContext) {
    return view.render('pages/auth/verification_pending')
  }

  async showVerificationSuccess({ view }: HttpContext) {
    return view.render('pages/auth/verification_success')
  }

  async showVerificationFailed({ view }: HttpContext) {
    return view.render('pages/auth/verification_failed')
  }

  async resendVerification({ request, response, session }: HttpContext) {
    const { email } = request.only(['email'])

    const user = await User.findBy('email', email)

    if (!user) {
      session.flash('error', 'Aucun compte trouvé avec cet email.')
      return response.redirect().back()
    }

    if (user.isVerified) {
      session.flash('info', 'Votre compte est déjà vérifié.')
      return response.redirect().toRoute('auth.login.show')
    }

    const token = await user.generateVerificationToken()
    await mail.send(new VerifyEmailNotification(user, token))

    session.flash('success', 'Un nouvel email de vérification a été envoyé.')
    return response.redirect().back()
  }
}
