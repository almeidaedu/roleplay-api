import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Group from 'App/Models/Group'

export default class GroupsController {
  public async store({ request, response }: HttpContextContract) {
    const groupPayload = request.all()

    const { name, description, location, schedule, chronic, master } = await Group.create(
      groupPayload
    )

    const group = {
      name,
      description,
      location,
      schedule,
      chronic,
      master,
    }

    return response.created({ group })
  }
}
