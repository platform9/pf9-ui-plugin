export const loadSshKeys = async ({ setContext, context }) => {
  const sshKeys = await context.openstackClient.nova.getSshKeys()
  setContext({ sshKeys })
  return sshKeys
}
