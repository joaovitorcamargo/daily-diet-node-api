import { FastifyInstance } from "fastify";
import {knex} from '../database'
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSession } from "../middlewares/check-session";
import { count } from "console";

export async function usersRoutes(app: FastifyInstance) {

  app.get('/', {
    preHandler: [checkSession]
  } , async (request, reply) => {
    const users = await knex('users').select()

    return {users}
  })
  
  app.get('/get-all-meals', {
    preHandler: [checkSession]
  }, async(request, reply) => {
    const sessionId = request.cookies.sessionId;

    const getMeals = await knex('users')
      .join('user_meals', 'users.id', 'user_meals.user_id')
      .join('meals', 'meals.id', 'user_meals.meal_id')
      .where('users.session_id', sessionId)
      .select('meals.*');

    return getMeals
  })

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string()
    })

    const { name } = bodySchema.parse(request.body)
    
    const session = {
      id: request.cookies.sessionId
    }

    if(!session.id) {
      session.id = randomUUID()
      reply.cookie('sessionId', session.id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 //7 DIAS,
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: session.id
    })

    return reply.status(201).send()
  })

  app.put('/auth', async (request, reply) => {

    const bodySchema = z.object({
      id: z.string().uuid()
    })

    const {id} = bodySchema.parse(request.body);

    const session = {
      id: ''
    }

    session.id = randomUUID()
    reply.cookie('sessionId', session.id, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7 //7 DIAS,
    })

    await knex('users').where('id', id).update({
      'session_id': session.id
    })

    return reply.status(200).send('User Authorized')
  })

  app.get('/metric', {
    preHandler: [checkSession]
  }, async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    const query = await knex('users')
      .select(
        'users.name as name',
        knex.raw('COUNT(meals.id) as total_meals'),
        knex.raw('COUNT(CASE WHEN meals.allowed_meal = false THEN 1 END) as not_allowed_meal'),
        knex.raw('COUNT(CASE WHEN meals.allowed_meal = true THEN 1 END) as allowed_meal')
      )
      .join('user_meals', 'users.id', 'user_meals.user_id')
      .join('meals', 'meals.id', 'user_meals.meal_id')
      .where('users.session_id', sessionId).first();

    return query
  })

}