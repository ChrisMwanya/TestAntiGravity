import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Create a verified test user
    await User.updateOrCreate(
      { email: 'test@example.com' },
      {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        isVerified: true,
      }
    )
  }
}
