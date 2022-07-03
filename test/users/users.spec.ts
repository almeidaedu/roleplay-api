import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import { UserFactory } from './../../database/factories/index'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let token = ''
let user = {} as User

test.group('User', (group) => {
  test('it should create an user', async (assert) => {
    const userPayload = {
      email: 'test@test.com',
      username: 'teste',
      password: 'teste123',
      avatar: 'https://image.com/image/1',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)

    assert.exists(body.user, 'User undefined')
    assert.exists(body.user.id, 'Id undefined')
    assert.equal(body.user.email, userPayload.email, 'Email not match')
    assert.equal(body.user.username, userPayload.username, 'Username not match')
    assert.notExists(body.user.password, 'Password should not be returned')
  })

  test('it should return 409 when email is already in use', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email,
        username: 'teste',
        password: 'teste123',
      })
      .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'Email')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 409 when username is already in use', async (assert) => {
    const { username } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@test.com',
        username,
        password: 'teste123',
      })
      .expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'Username')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 422 when required data is not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when email is invalid', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@',
        username: 'teste',
        password: 'teste123',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when password is too short', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@test.com',
        username: 'teste',
        password: 'teste',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should update an user', async (assert) => {
    const email = 'test@test.com'
    const avatar = 'http://github.com/eduardo-cadmus.png'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        avatar,
        password: user.password,
      })
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.email, email, 'Email not match')
    assert.equal(body.user.avatar, avatar, 'Avatar not match')
    assert.equal(body.user.id, user.id, 'Id not match')
  })

  test(`it should update the user's password`, async (assert) => {
    const password = 'teste123'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: user.email,
        avatar: user.avatar,
        password,
      })
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.id, user.id, 'Id not match')

    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  test('it should return 422 when required data is not provided', async (assert) => {
    const { id } = await UserFactory.create()

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test(`it should return 422 when update email is invalid`, async (assert) => {
    const { id, username, password, avatar } = await UserFactory.create()

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'test@',
        username,
        password,
        avatar,
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test(`it should return 422 when update password is invalid`, async (assert) => {
    const { id, email, username, avatar } = await UserFactory.create()

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        username,
        password: 'teste',
        avatar,
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test(`it should return 422 when update avatar is invalid`, async (assert) => {
    const { id, email, username, password } = await UserFactory.create()

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        username,
        password,
        avatar: 'http:/github.com/eduardo-almeida.png',
      })
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  group.before(async () => {
    const plainPassword = 'teste123'
    const newUser = await UserFactory.merge({ password: plainPassword }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({
        email: newUser.email,
        password: plainPassword,
      })
      .expect(201)

    token = body.token.token
    user = newUser
  })
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
