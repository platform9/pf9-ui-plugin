import Tenant from '../../models/openstack/Tenant'

const deleteProject = (req, res) => {
  const { projectId } = req.params
  console.log('Attempting to delete projectId: ', projectId)
  const project = Tenant.findById(projectId)
  if (!project) {
    console.log('Project NOT found')
    return res.status(404).send({ err: 'Project not found' })
  }
  project.destroy()
  console.log('Project destroyed')
  res.status(200).send({})
}

export default deleteProject
