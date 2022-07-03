import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from './../../database/factories/index'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', (group) => {
  test.only('it should authenticate an user', async (assert) => {
    const plainPassword = 'teste123'
    const { id, email } = await UserFactory.merge({ password: plainPassword }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({
        email,
        password: plainPassword,
      })
      .expect(201)

    assert.isDefined(body.user, 'User undefined')
    assert.equal(body.user.id, id, 'Id not match')
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
