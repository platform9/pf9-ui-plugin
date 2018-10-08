# Platform9 JavaScript OpenStack Client

This library is an opinionated OpenStack client written in modern idiomatic
JavaScript.

Here is an example of how it can be used:

```javascript
// Create the client and authenticate
const keystoneEndpoint = 'http://FQDN.com/keystone'
const client = new ApiClient({ keystoneEndpoint})
await client.keystone.authenticate('username', 'password')

// Scope the client to a project
const projects = await client.keystone.getProjects()
await client.keystone.changeProjectScope(projects[0].id)

// CRUD users
const newUser = await client.keystone.createUser({
  name: 'newUser@domain.com',
  email: 'newUser@domain.com',
  username: 'newUser@domain.com',
  password: 'secret',
  displayname: 'New User' // yes, it's lowercase in keystone
})
const users = await client.keystone.getUsers()
await client.keystone.deleteUser(newUser.id)
```
