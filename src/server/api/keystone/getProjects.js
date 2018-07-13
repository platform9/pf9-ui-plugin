import context from '../../context'

const getProjects = (req, res) => {
  const tenants = context.getTenants()
  return res.send({ projects: tenants })
}

export default getProjects
