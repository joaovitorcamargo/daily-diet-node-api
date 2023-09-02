import { FastifyInstance } from 'fastify';
import {knex} from '../database'
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { checkSession } from '../middlewares/check-session';
import { app } from '../app';
import { checkUser } from '../middlewares/check-user-is-valid';

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [checkSession]
  },async () => {
    const meals = await knex('meals').select()
    
    return {
      meals
    }
  })

  app.post('/', {
    preHandler: [checkSession]
  }, async(request, reply) => {

    const sessionId = request.cookies.sessionId

    const bodySchema = z.object({
      name: z.string(),
      description: z.string(),
      allowed_meal: z.boolean(),
      date: z.string(),
      time: z.string()
    })
    
    const {name, description, allowed_meal, date, time} = bodySchema.parse(request.body)

    const hasUser = await knex('users').where('session_id', sessionId).first()

    if(!hasUser) {
      return reply.status(404).send('No user found')
    }

    const id = randomUUID()

    await knex('meals').insert({
      id,
      name,
      description,
      allowed_meal,
      date,
      time
    })

    await knex('user_meals').insert({
      id: randomUUID(),
      user_id: hasUser.id,
      meal_id: id
    })

    return reply.status(201).send()
  })

  app.put('/:id', {
    preHandler: [checkSession, checkUser]
  }, async(request, reply) => {

    const idSchemaParams = z.object({
      id: z.string().uuid()
    })

    const {id} = idSchemaParams.parse(request.params)
    
    if(request.body) {
      const bodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        allowed_meal: z.boolean().optional(),
        date: z.string().optional(),
        time: z.string().optional()
      })

      const getDataToChange = bodySchema.parse(request.body)

      await knex('meals').where('id', id).update(getDataToChange)
    }
    return reply.status(200).send()

  })

  app.get('/:id', {
    preHandler: [checkSession]
  }, async(request) => {
    const paramsSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).first()

    return { meal }
  })

}