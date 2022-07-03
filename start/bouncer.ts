import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export const { actions } = Bouncer.define('updateUser', (user: User, updatedUser: User) => {
  return user.id === updatedUser.id
})

export const { policies } = Bouncer.registerPolicies({})
