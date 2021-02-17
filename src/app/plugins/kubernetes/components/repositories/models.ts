export enum RepositoryType {
  Public = 'public',
  Private = 'private',
}

export const repositoryOptions = [
  { label: 'Public', value: RepositoryType.Public },
  { label: 'Private', value: RepositoryType.Private },
]
