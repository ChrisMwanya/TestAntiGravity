import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fixed_charges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL').nullable()
      table.string('name').notNullable()
      table.decimal('amount', 15, 2).notNullable()
      table.enu('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).notNullable()
      table.integer('billing_day').nullable()
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.enu('status', ['active', 'inactive']).defaultTo('active')
      table.text('notes').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
