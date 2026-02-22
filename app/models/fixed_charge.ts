import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Category from './category.js'

export default class FixedCharge extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare categoryId: number | null

  @column()
  declare name: string

  @column()
  declare amount: number

  @column()
  declare frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

  @column()
  declare billingDay: number | null

  @column()
  declare startDate: string

  @column()
  declare endDate: string | null

  @column()
  declare status: 'active' | 'inactive'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
