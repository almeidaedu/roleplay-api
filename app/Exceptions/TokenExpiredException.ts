import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TokenExpiredException extends Exception {
  public code = 'E_TOKEN_EXPIRED'
  public status = 410

  constructor() {
    super('Token expired')
  }

  public async handle(error: this, context: HttpContextContract) {
    return context.response
      .status(error.status)
      .send({ code: error.code, message: error.message, status: error.status })
  }
}
