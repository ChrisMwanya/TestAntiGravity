import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class VerifyExistingUsers extends BaseCommand {
  static commandName = 'verify:existing-users'
  static description = 'Mark all existing users as verified'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting to verify existing users...')

    const users = await User.query().where('is_verified', false)

    if (users.length === 0) {
      this.logger.info('No unverified users found.')
      return
    }

    for (const user of users) {
      user.isVerified = true
      user.verificationToken = null
      await user.save()
    }

    this.logger.success(`Successfully verified ${users.length} user(s)`)
  }
}
