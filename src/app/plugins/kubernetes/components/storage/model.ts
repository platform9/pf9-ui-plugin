import { GetClusterClusterRoleBindingsItem, IGenericResource } from 'api-client/qbert.model'

export interface IStorageClassSelector extends IGenericResource<GetClusterClusterRoleBindingsItem> {
  id: string
  name: string
  clusterName: string
  type: string
  created: string
}
