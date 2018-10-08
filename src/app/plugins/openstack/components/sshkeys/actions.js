export const loadSshKeys = async ({ setContext, context }) => {
  const sshKeys = await context.apiClient.nova.getSshKeys()
  setContext({ sshKeys })
  return sshKeys
}
