import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class VerifyEmailNotification extends BaseMail {
  from = env.get('MAIL_FROM_ADDRESS', 'noreply@example.com')
  subject = 'Confirmez votre adresse email'

  constructor(
    private user: User,
    private verificationToken: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const verificationUrl = `${env.get('APP_URL', 'http://localhost:3333')}/verify/${this.verificationToken}`

    this.message.to(this.user.email)
    this.message.htmlView('emails/verify_email', {
      user: this.user,
      verificationUrl,
    })
  }
}
