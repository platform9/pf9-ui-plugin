export const loadSshKeys = async ({ setContext, context }) => {
  const response = await context.openstackClient.nova.getSshKeys()
  const sshKeys = response.map(key => key.keypair)
  setContext({ sshKeys })
}
