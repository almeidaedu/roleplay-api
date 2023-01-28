import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import IGroup from 'App/Interfaces/IGroup'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Group', (group) => {
  test.only('it should create a group', async (assert) => {
    const user = await UserFactory.create()
    const groupPayload: IGroup = {
      name: 'test',
      description: 'test',
      schedule: 'test',
      location: 'test',
      chronic: 'test',
      master: user.id,
    }

    const { body } = await supertest(BASE_URL).post('/groups').send(groupPayload).expect(201)

    assert.exists(body.group, 'Group undefined')

    for (let key in body.group) {
      assert.equal(body.group[key], groupPayload[key])
    }
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
