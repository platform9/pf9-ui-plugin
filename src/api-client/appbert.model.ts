export interface Appbert {
  getClusterTags: () => Promise<ClusterTag[]>
}

export interface ClusterTag {
  uuid: string
  name: string
  projectId: string
  tags: string[]
  pkgs: Pkg[]
}

export interface Pkg {
  name: string
  validate: boolean
  installed: boolean
}
