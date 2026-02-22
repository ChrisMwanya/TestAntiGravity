import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'debts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.enu('type', ['borrowed', 'lent']).notNullable()
      table.decimal('amount', 15, 2).notNullable()
      table.decimal('remaining_amount', 15, 2).notNullable()
      table.date('due_date').nullable()
      table.enu('status', ['active', 'paid']).defaultTo('active')
      table.text('notes').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
