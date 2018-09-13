import context from '../context'

// Role maps by resMgrIds
// console.log(context)
// const roles = context.resMgrRoles

class ResMgrRoles {
  static newResMgrHost = (id) => {
    context.resMgrRoles[id] = {}
  }

  static getAllRoles = () => context.resMgrRoles

  static getAllHostRoles = (id) => context.resMgrRoles[id]

  static getHostRole = (id, role) => context.resMgrRoles[id][role]

  static updateHostRole = (id, role, input) => {
    context.resMgrRoles[id][role] = {
      ...context.resMgrRoles[id][role],
      ...input
    }
    return context.resMgrRoles[id][role]
  }
}

export default ResMgrRoles
