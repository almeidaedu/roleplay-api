import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from './../../database/factories/index'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', (group) => {
  test('it should authenticate an user', async (assert) => {
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

  test('it should return an api token when session is created', async (assert) => {
    const plainPassword = 'teste123'
    const { id, email } = await UserFactory.merge({ password: plainPassword }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({
        email,
        password: plainPassword,
      })
      .expect(201)

    assert.isDefined(body.token, 'Token undefined')
    assert.equal(body.user.id, id, 'Id not match')
  })

  test('it should return 400 when credentials are not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/sessions').send({}).expect(400)

    assert.equal(body.code, 'BAD_REQUEST', 'Code not match')
    assert.equal(body.status, 400, 'Status not match')
    assert.equal(body.message, 'invalid credentials', 'Message not match')
  })

  test.only('it should return 400 when credentials are invalid', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({
        email,
        password: 'teste123',
      })
      .expect(400)

    assert.equal(body.code, 'BAD_REQUEST', 'Code not match')
    assert.equal(body.status, 400, 'Status not match')
    assert.equal(body.message, 'invalid credentials', 'Message not match')
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
