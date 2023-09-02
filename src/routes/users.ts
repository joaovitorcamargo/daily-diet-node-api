import { FastifyInstance } from "fastify";
import {knex} from '../database'
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSession } from "../middlewares/check-session";

export async function usersRoutes(app: FastifyInstance) {

  app.get('/', {preHandler: [checkSession]} , async (request, reply) => {
    const users = await knex('users').select()

    return {users}
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
}