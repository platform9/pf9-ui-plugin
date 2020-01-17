import Tenant from '../../models/openstack/Tenant'

const putProject = (req, res) => {
  const { projectId } = req.params
  const { project } = req.body
  const updatedProject = Tenant.findById(projectId)
  updatedProject.update(project)
  res.status(201).send({ project: updatedProject.asJson() })
}

export default putProject
