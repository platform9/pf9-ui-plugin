import { credentialActions, mngmUserActions } from '../userManagement/users/actions'

export const enableMfa = async ({ credential, userOptions, userId }) => {
  const [credentialCreateSuccess] = await credentialActions.create(credential)
  // Need to resolve: User patch is not allowed for SSU
  const [userPatchSuccess] = await mngmUserActions.update({ id: userId, options: userOptions })
  if (!credentialCreateSuccess || !userPatchSuccess) {
    console.log('Error occurred. MFA not fully enabled.')
  }
  return true
}

export const disableMfa = async ({ credential, userOptions, userId }) => {
  const [credentialDeleteSuccess] = await credentialActions.delete({ id: credential.id })
  // Need to resolve: User patch is not allowed for SSU
  const [userPatchSuccess] = await mngmUserActions.update({ id: userId, options: userOptions })
  if (!credentialDeleteSuccess || !userPatchSuccess) {
    console.log('Error occurred. MFA removal not fully successful.')
  }
  return true
}
