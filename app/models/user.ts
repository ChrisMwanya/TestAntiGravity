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
}