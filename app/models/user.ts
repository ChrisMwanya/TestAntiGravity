import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Account from './account.js'
import Budget from './budget.js'
import Investment from './investment.js'
import AccountType from './account_type.js'
import Category from './category.js'
import string from '@adonisjs/core/helpers/string'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare avatar: string | null

  @column()
  declare isVerified: boolean

  @column({ serializeAs: null })
  declare verificationToken: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Account)
  declare accounts: HasMany<typeof Account>

  @hasMany(() => Budget)
  declare budgets: HasMany<typeof Budget>

  @hasMany(() => Investment)
  declare investments: HasMany<typeof Investment>

  @hasMany(() => AccountType)
  declare accountTypes: HasMany<typeof AccountType>

  @hasMany(() => Category)
  declare categories: HasMany<typeof Category>

  /**
   * Generate a unique verification token for the user
   */
  async generateVerificationToken() {
    this.verificationToken = string.random(64)
    await this.save()
    return this.verificationToken
  }

  /**
   * Verify user email with the provided token
   */
  static async verifyEmail(token: string) {
    const user = await User.query().where('verification_token', token).first()

    if (!user) {
      return null
    }

    user.isVerified = true
    user.verificationToken = null
    await user.save()

    return user
  }
}
