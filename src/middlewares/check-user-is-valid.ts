import {knex} from "../database"
import { z } from "zod"
import { FastifyReply, FastifyRequest } from "fastify"

export async function checkUser(request: FastifyRequest, reply: FastifyReply) {

  const idSchemaParams = z.object({
    id: z.string().uuid()
  })

  const {id} = idSchemaParams.parse(request.params)

  const sessionId = request.cookies.sessionId
  const checkUserIsValid = await knex('users').where('session_id', sessionId).first()

  
  if(!checkUserIsValid) {
    return reply.status(404).send({
      error: 'User Not Found'
    })
  }
  
  const checkMealIsUser = await knex('user_meals').where({
    user_id: checkUserIsValid.id,
    meal_id: id
  }).first()

  if(!checkMealIsUser) {
    return reply.status(401).send({
      error: 'User does not belong'
    })
  }
}