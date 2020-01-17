import Tenant from '../../models/openstack/Tenant'

const deleteProject = (req, res) => {
  const { projectId } = req.params
  const project = Tenant.findById(projectId)
  if (!project) {
    console.log('Project NOT found')
    return res.status(404).send({ err: 'Project not found' })
  }
  project.destroy()
  console.log('Project destroyed')
  res.status(204).send(null)
}

export default deleteProject
