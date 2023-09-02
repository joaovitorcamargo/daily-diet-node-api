import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_meals', (table) => {
    table.uuid('id').primary(),
    table.string('user_id').unsigned().references('users.id'),
    table.string('meal_id').unsigned().references('meals.id')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user_meals')
}

