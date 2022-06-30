import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(exception: Exception, context: HttpContextContract) {
    if (exception.status === 422) {
      return context.response.status(exception.status).send({
        code: 'BAD_REQUEST',
        message: exception.message,
        status: exception.status,
        errors: exception['messages']?.errors ? exception['messages'].errors : '',
      })
    }

    return super.handle(exception, context)
  }
}
