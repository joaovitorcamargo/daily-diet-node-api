// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
      created_at: string
    },
    meals: {
      id: string
      name: string
      description: string
      allowed_meal: boolean
      date: string
      time: string
      created_at: string
    }
    user_meals: {
      id: string
      user_id: string
      meal_id: string
    }
  }
}
