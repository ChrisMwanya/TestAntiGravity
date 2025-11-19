import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    // 1. Add account_type_id column
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('account_type_id')
        .unsigned()
        .references('id')
        .inTable('account_types')
        .onDelete('RESTRICT')
        .nullable()
    })

    // 2. Seed default types and migrate data
    this.defer(async (db) => {
      // Create default types
      const types = ['bank', 'cash', 'investment']
      const typeIds: Record<string, number> = {}

      for (const typeName of types) {
        const [id] = await db.table('account_types').insert({ name: typeName }).returning('id')
        typeIds[typeName] = id.id || id // Handle different return formats
      }

      // Update existing accounts
      for (const typeName of types) {
        await db
          .from('accounts')
          .where('type', typeName)
          .update({ account_type_id: typeIds[typeName] })
      }
    })

    // 3. Make column not nullable and drop old column
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('account_type_id').notNullable().alter()
      table.dropColumn('type')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', ['bank', 'cash', 'investment']).nullable()
    })

    // Restore data (reverse migration)
    this.defer(async (db) => {
      const accounts = await db
        .from('accounts')
        .join('account_types', 'accounts.account_type_id', 'account_types.id')
        .select('accounts.id', 'account_types.name')

      for (const account of accounts) {
        // Map back to enum values if possible, default to 'bank' if custom type
        const type = ['bank', 'cash', 'investment'].includes(account.name) ? account.name : 'bank'
        await db.from('accounts').where('id', account.id).update({ type })
      }
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('type').notNullable().alter()
      table.dropColumn('account_type_id')
    })
  }
}