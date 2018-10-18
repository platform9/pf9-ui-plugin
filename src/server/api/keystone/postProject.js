import Tenant from '../../models/openstack/Tenant'

const postProject = (req, res) => {
  const project = req.body.project
  const newProject = new Tenant(project)
  res.status(201).send({ project: newProject.asJson() })
}

export default postProject
