import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CustomMessages, rules, schema } from '@ioc:Adonis/Core/Validator'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    password: schema.string({}, [rules.minLength(6)]),
    email: schema.string({}, [rules.email()]),
    avatar: schema.string.optional({}, [rules.url()]),
  })

  public messages: CustomMessages = {}
}
